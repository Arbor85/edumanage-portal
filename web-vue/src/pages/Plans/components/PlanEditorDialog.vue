<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    @click.self="emit('cancel')"
  >
    <div class="w-full max-w-3xl rounded-lg border border-slate-300 bg-white p-6 shadow-xl dark:border-slate-600 dark:bg-slate-800">
      <h2 class="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{ isEditing ? 'Edit plan' : 'Create plan' }}
      </h2>

      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Plan name
          </label>
          <input
            v-model="formData.name"
            @input="nameManuallyEdited = true"
            type="text"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Enter plan name"
          />
        </div>

        <div v-if="canManageClients">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Client
          </label>
          <SelectClient
            v-model="formData.clientId"
            :options="clients"
          />
        </div>

        <div>
          <div class="mb-2 flex items-center justify-between">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Workouts ({{ formData.workouts.length }})
            </label>
            <div class="flex items-center gap-2">
              <div class="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-600">
                <button
                  type="button"
                  @click="workoutsViewMode = 'list'"
                  class="px-3 py-1 text-xs font-medium"
                  :class="workoutsViewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
                >
                  List
                </button>
                <button
                  type="button"
                  @click="workoutsViewMode = 'calendar'"
                  class="border-l border-slate-300 px-3 py-1 text-xs font-medium dark:border-slate-600"
                  :class="workoutsViewMode === 'calendar' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
                >
                  Calendar
                </button>
              </div>
              <button
                type="button"
                @click="openEmptyWorkoutDialog"
                class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              >
                Add empty workout
              </button>
              <ScheduleRoutine
                :routines="routines"
                @schedule="addWorkout"
              />
            </div>
          </div>

          <div v-if="workoutsViewMode === 'list'" class="custom-scrollbar max-h-96 space-y-3 overflow-y-auto">
            <div
              v-for="(workout, index) in formData.workouts"
              :key="`workout-${index}`"
              class="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/50"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {{ workout.name }}
                  </p>
                  <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {{ formatDate(workout.date) }} • {{ workout.excercises.length }} exercise{{ workout.excercises.length !== 1 ? 's' : '' }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="openEditWorkoutDialog(index)"
                    class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    @click="openCopyWorkoutDialog(index)"
                    class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    @click="removeWorkout(index)"
                    class="rounded-md bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="formData.workouts.length === 0"
              class="rounded border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-400"
            >
              No workouts scheduled. Click "Add workout" to start.
            </div>
          </div>

          <CalendarView v-else v-model="calendarDate">
            <template #day="{ day, date }">
              <div class="mb-1 text-xs font-medium text-slate-900 dark:text-slate-100">
                {{ day }}
              </div>
              <div
                class="space-y-1 rounded p-0.5"
                :class="dragOverDateKey === toDateKey(date) ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''"
                @dragover.prevent="handleDayDragOver(date)"
                @dragenter.prevent="handleDayDragOver(date)"
                @dragleave="handleDayDragLeave(date)"
                @drop.prevent="handleDayDrop(date)"
              >
                <button
                  v-for="entry in getWorkoutsForDay(date)"
                  :key="`workout-calendar-${entry.index}-${entry.workout.id}`"
                  type="button"
                  draggable="true"
                  @dragstart="handleWorkoutDragStart(entry.index)"
                  @dragend="handleWorkoutDragEnd"
                  @click="openEditWorkoutDialog(entry.index)"
                  class="w-full rounded bg-emerald-100 px-1.5 py-1 text-left text-[10px] text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-800"
                  :title="`${entry.workout.name} • ${formatDate(entry.workout.date)}`"
                >
                  <p class="truncate font-semibold">{{ entry.workout.name }}</p>
                  <p class="truncate">{{ entry.workout.excercises.length }} exc.</p>
                </button>
              </div>
            </template>

            <template #footer>
              <div
                v-if="calendarMonthEmpty"
                class="mt-4 rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                No workouts scheduled in this month.
              </div>
            </template>
          </CalendarView>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button
          type="button"
          @click="emit('cancel')"
          class="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Cancel
        </button>
        <button
          v-if="isEditing && currentStatus === 'Published'"
          type="button"
          :disabled="statusUpdating"
          @click="emit('revoke')"
          class="inline-flex items-center gap-1.5 rounded-md border border-orange-400 bg-white px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-orange-900/20"
        >
          <Ban :size="15" />
          Revoke
        </button>
        <button
          v-if="isEditing && currentStatus !== 'Published'"
          type="button"
          @click="saveAndPublish"
          :disabled="!canSave || statusUpdating"
          class="inline-flex items-center gap-1.5 rounded-md border border-emerald-500 bg-white px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-emerald-900/20"
        >
          <Send :size="15" />
          Save + Publish
        </button>
        <button
          type="button"
          @click="save"
          :disabled="!canSave"
          class="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          {{ isEditing ? 'Save changes' : 'Create plan' }}
        </button>
      </div>
    </div>

    <RoutineEditorDialog
      :open="showEmptyWorkoutDialog"
      :title="workoutDialogMode === 'edit' ? 'Edit workout' : 'Add empty workout'"
      :save-label="workoutDialogMode === 'edit' ? 'Save workout' : 'Add workout'"
      :excercises="excercises"
      :show-schedule-date="true"
      :initial-name="workoutDialogInitialName"
      :initial-note="workoutDialogInitialNote"
      :initial-excercises="workoutDialogInitialExcercises"
      :initial-date="workoutDialogInitialDate"
      @cancel="closeWorkoutDialog"
      @save="saveWorkoutFromDialog"
    />

    <SelectDate
      v-if="copyingWorkoutIndex !== null"
      :model-value="copyWorkoutDate"
      :auto-open="true"
      :hide-button="true"
      @update:modelValue="onCopyDateSelected"
      @close="closeCopyWorkoutDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Ban, Send } from 'lucide-vue-next'
import CalendarView from '../../../components/CalendarView.vue'
import RoutineEditorDialog from '../../../components/RoutineEditorDialog.vue'
import ScheduleRoutine from '../../../components/ScheduleRoutine.vue'
import SelectClient from '../../../components/Select/SelectClient.vue'
import SelectDate from '../../../components/SelectDate.vue'
import { hasCurrentUserPermission } from '../../../services/permissionsService'
import type { Client } from '../../../types/client'
import type { Excercise } from '../../../types/excercise'
import { Permission } from '../../../types/permission'
import type { PlanStatus, PlanWorkout } from '../../../types/plan'
import type { Routine, RoutineExcercise } from '../../../types/routine'

type PlanEditorPayload = {
  name: string
  clientId?: string
  workouts: PlanWorkout[]
}

const props = withDefaults(
  defineProps<{
    open: boolean
    isEditing: boolean
    currentStatus?: PlanStatus
    statusUpdating?: boolean
    clients: Client[]
    routines: Routine[]
    excercises: Excercise[]
    initialName?: string
    initialClientId?: string
    initialWorkouts?: PlanWorkout[]
  }>(),
  {
    currentStatus: 'Draft',
    statusUpdating: false,
    initialName: '',
    initialClientId: '',
    initialWorkouts: () => [],
  },
)

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'save', payload: PlanEditorPayload): void
  (event: 'save-and-publish', payload: PlanEditorPayload): void
  (event: 'revoke'): void
}>()

const showEmptyWorkoutDialog = ref(false)
const workoutDialogMode = ref<'create' | 'edit'>('create')
const editingWorkoutIndex = ref<number | null>(null)
const workoutDialogInitialName = ref('')
const workoutDialogInitialNote = ref('')
const workoutDialogInitialExcercises = ref<RoutineExcercise[]>([])
const workoutDialogInitialDate = ref('')
const copyingWorkoutIndex = ref<number | null>(null)
const copyWorkoutDate = ref('')
const nameManuallyEdited = ref(false)
const workoutsViewMode = ref<'list' | 'calendar'>('list')
const calendarDate = ref(new Date())
const draggedWorkoutIndex = ref<number | null>(null)
const dragOverDateKey = ref('')
const canManageClients = hasCurrentUserPermission(Permission.MANAGE_CLIENTS)

const formData = ref<PlanEditorPayload>({
  name: '',
  clientId: '',
  workouts: [],
})

const canSave = computed(() => {
  return Boolean(formData.value.name.trim() || formData.value.workouts.length > 0)
})

const clonePlanWorkouts = (workouts: PlanWorkout[]): PlanWorkout[] => {
  return workouts.map((workout) => ({
    ...workout,
    excercises: workout.excercises.map((excercise) => ({
      ...excercise,
      sets: excercise.sets.map((setItem) => ({ ...setItem })),
    })),
  }))
}

const applyInitialValues = () => {
  nameManuallyEdited.value = false
  formData.value = {
    name: props.initialName,
    clientId: props.initialClientId,
    workouts: clonePlanWorkouts(props.initialWorkouts),
  }

  closeWorkoutDialog()
  closeCopyWorkoutDialog()
}

watch(
  () => [props.open, props.initialName, props.initialClientId, props.initialWorkouts],
  () => {
    if (props.open) {
      applyInitialValues()
    }
  },
  { immediate: true },
)

const autoGenerateName = () => {
  if (props.isEditing || nameManuallyEdited.value) {
    return
  }

  const workoutNames = formData.value.workouts.map((workout) => workout.name).join(' + ')
  const clientName = props.clients.find((client) => client.invitationCode === formData.value.clientId)?.name || ''

  if (workoutNames) {
    formData.value.name = clientName ? `${workoutNames} for ${clientName}` : workoutNames
    return
  }

  formData.value.name = ''
}

watch(() => [formData.value.workouts.map((workout) => workout.name).join(','), formData.value.clientId], autoGenerateName)

const toDateKey = (value: Date | string) => {
  if (value instanceof Date) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  return value.split('T')[0] || value
}

const withUpdatedDate = (sourceDate: string, dateKey: string) => {
  const timePart = sourceDate.includes('T') ? sourceDate.slice(sourceDate.indexOf('T')) : ''
  return `${dateKey}${timePart}`
}

const getWorkoutsForDay = (date: Date) => {
  const dateKey = toDateKey(date)
  return formData.value.workouts
    .map((workout, index) => ({ workout, index }))
    .filter((entry) => toDateKey(entry.workout.date) === dateKey)
}

const calendarMonthEmpty = computed(() => {
  const year = calendarDate.value.getFullYear()
  const month = calendarDate.value.getMonth()

  return formData.value.workouts.every((workout) => {
    const d = new Date(workout.date)
    return d.getFullYear() !== year || d.getMonth() !== month
  })
})

const handleWorkoutDragStart = (index: number) => {
  draggedWorkoutIndex.value = index
}

const handleWorkoutDragEnd = () => {
  draggedWorkoutIndex.value = null
  dragOverDateKey.value = ''
}

const handleDayDragOver = (date: Date) => {
  if (draggedWorkoutIndex.value === null) {
    return
  }

  dragOverDateKey.value = toDateKey(date)
}

const handleDayDragLeave = (date: Date) => {
  const dayKey = toDateKey(date)

  if (dragOverDateKey.value === dayKey) {
    dragOverDateKey.value = ''
  }
}

const handleDayDrop = (date: Date) => {
  if (draggedWorkoutIndex.value === null) {
    return
  }

  const droppedWorkout = formData.value.workouts[draggedWorkoutIndex.value]

  if (!droppedWorkout) {
    handleWorkoutDragEnd()
    return
  }

  const dayKey = toDateKey(date)
  formData.value.workouts[draggedWorkoutIndex.value] = {
    ...droppedWorkout,
    date: withUpdatedDate(droppedWorkout.date, dayKey),
  }

  handleWorkoutDragEnd()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const openEmptyWorkoutDialog = () => {
  workoutDialogMode.value = 'create'
  editingWorkoutIndex.value = null
  workoutDialogInitialName.value = ''
  workoutDialogInitialNote.value = ''
  workoutDialogInitialExcercises.value = []
  workoutDialogInitialDate.value = ''
  showEmptyWorkoutDialog.value = true
}

const openEditWorkoutDialog = (index: number) => {
  const workout = formData.value.workouts[index]

  if (!workout) {
    return
  }

  workoutDialogMode.value = 'edit'
  editingWorkoutIndex.value = index
  workoutDialogInitialName.value = workout.name
  workoutDialogInitialNote.value = workout.note || ''
  workoutDialogInitialDate.value = workout.date
  workoutDialogInitialExcercises.value = workout.excercises.map((excercise) => ({
    ...excercise,
    sets: excercise.sets.map((setItem) => ({ ...setItem })),
  }))
  showEmptyWorkoutDialog.value = true
}

const closeWorkoutDialog = () => {
  showEmptyWorkoutDialog.value = false
  workoutDialogMode.value = 'create'
  editingWorkoutIndex.value = null
  workoutDialogInitialName.value = ''
  workoutDialogInitialNote.value = ''
  workoutDialogInitialExcercises.value = []
  workoutDialogInitialDate.value = ''
}

const addWorkout = (workout: PlanWorkout) => {
  formData.value.workouts.push(workout)
}

const closeCopyWorkoutDialog = () => {
  copyingWorkoutIndex.value = null
  copyWorkoutDate.value = ''
}

const openCopyWorkoutDialog = (index: number) => {
  const workout = formData.value.workouts[index]

  if (!workout) {
    return
  }

  copyingWorkoutIndex.value = index
  copyWorkoutDate.value = getDateWithOffset(workout.date, 7)
}

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDateWithOffset = (sourceDate: string, daysOffset: number) => {
  const normalizedSourceDate = sourceDate.split('T')[0] || sourceDate

  if (!normalizedSourceDate) {
    return ''
  }

  const [yearPart, monthPart, dayPart] = normalizedSourceDate.split('-')
  const year = Number(yearPart)
  const month = Number(monthPart)
  const day = Number(dayPart)

  if (!year || !month || !day) {
    return ''
  }

  const date = new Date(year, month - 1, day)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  date.setDate(date.getDate() + daysOffset)
  return formatDateForInput(date)
}

const onCopyDateSelected = (date: string) => {
  if (copyingWorkoutIndex.value === null || !date) {
    return
  }

  const sourceWorkout = formData.value.workouts[copyingWorkoutIndex.value]

  if (!sourceWorkout) {
    closeCopyWorkoutDialog()
    return
  }

  const generatedId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `workout-${Date.now()}-${Math.random().toString(16).slice(2)}`

  const copiedWorkout: PlanWorkout = {
    ...sourceWorkout,
    id: generatedId,
    date,
    excercises: sourceWorkout.excercises.map((excercise) => ({
      ...excercise,
      sets: excercise.sets.map((setItem) => ({ ...setItem })),
    })),
  }

  formData.value.workouts.splice(copyingWorkoutIndex.value + 1, 0, copiedWorkout)
  closeCopyWorkoutDialog()
}

const saveWorkoutFromDialog = (payload: { name: string; note?: string; excercises: RoutineExcercise[]; date?: string }) => {
  if (workoutDialogMode.value === 'edit' && editingWorkoutIndex.value !== null) {
    const currentWorkout = formData.value.workouts[editingWorkoutIndex.value]

    if (!currentWorkout) {
      closeWorkoutDialog()
      return
    }

    formData.value.workouts[editingWorkoutIndex.value] = {
      ...currentWorkout,
      name: payload.name,
      note: payload.note,
      excercises: payload.excercises,
      date: payload.date || currentWorkout.date,
    }

    closeWorkoutDialog()
    return
  }

  const generatedId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `workout-${Date.now()}-${Math.random().toString(16).slice(2)}`

  const workout: PlanWorkout = {
    id: generatedId,
    name: payload.name,
    note: payload.note,
    excercises: payload.excercises,
    date: payload.date || new Date().toISOString().split('T')[0] || '',
  }

  formData.value.workouts.push(workout)
  closeWorkoutDialog()
}

const removeWorkout = (index: number) => {
  formData.value.workouts.splice(index, 1)
}

const save = () => {
  if (!canSave.value) {
    return
  }

  emit('save', {
    name: formData.value.name,
    clientId: formData.value.clientId?.trim() || undefined,
    workouts: clonePlanWorkouts(formData.value.workouts),
  })
}

const saveAndPublish = () => {
  if (!canSave.value) {
    return
  }

  emit('save-and-publish', {
    name: formData.value.name,
    clientId: formData.value.clientId?.trim() || undefined,
    workouts: clonePlanWorkouts(formData.value.workouts),
  })
}
</script>
