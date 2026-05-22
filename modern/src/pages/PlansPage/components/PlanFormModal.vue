<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePageTitle } from '../../../composables/usePageTitle'
import type { PlanOut, PlanCreate, PlanUpdate, PlanWorkoutInput, RoutineOut, ClientOut, RoutineExcercise, RoutineSet, ExcerciseOut } from '../../../types'
import { usePlanStore } from '../../../stores/planStore'
import { useClientStore } from '../../../stores/clientStore'
import { useToast } from '../../../composables/useToast'
import FullSizeDialog from '../../../components/FullSizeDialog/index.vue'
import ProcessWizard from '../../../components/ProcessWizard/index.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import BaseButton from '../../../components/BaseButton.vue'
import BaseAvatar from '../../../components/BaseAvatar.vue'
import BaseDatePicker from '../../../components/BaseDatePicker.vue'
import EmptyState from '../../../components/EmptyState.vue'
import ClientPickerDialog from '../../../components/ClientPickerDialog/index.vue'
import RoutinePickerDialog from '../../../components/RoutinePickerDialog/index.vue'
import ExercisePickerDialog from '../../../components/ExercisePickerDialog/index.vue'
import EditSet from '../../../components/EditSet/index.vue'
import AddSetsDialog from '../../../components/AddSetsDialog/index.vue'
import { X, Plus, CalendarDays, Copy, LayoutList, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{ open: boolean; plan: PlanOut | null }>()
const emit = defineEmits<{ close: [] }>()

usePageTitle(() => props.plan ? 'Edit Plan' : 'New Plan', () => props.open)

const planStore = usePlanStore()
const clientStore = useClientStore()
const toast = useToast()

const form = ref<{
  name: string | null
  clientId: string | null
  note: string | null
  status: string | null
  workouts: PlanWorkoutInput[]
}>({ name: null, clientId: null, note: null, status: null, workouts: [] })

const saving = ref(false)
const confirmDelete = ref(false)
const confirmDiscard = ref(false)
const activeWorkoutIndex = ref(0)
const isClientPickerOpen = ref(false)
const isRoutinePickerOpen = ref(false)
const isExercisePickerOpen = ref(false)
const addSetsForExIdx = ref<number | null>(null)
const nameIsAuto = ref(false)
const planView = ref<'wizard' | 'calendar'>('wizard')
const calendarCursor = ref(new Date())
const draggingIdx = ref<number | null>(null)
const dragOverDate = ref<string | null>(null)
const slideDirection = ref<'left' | 'right'>('left')
const slideTransitionName = computed(() => `view-slide-${slideDirection.value}`)
const isScheduleCopyOpen = ref(false)
const scheduleCopySourceIndex = ref<number | null>(null)
const scheduleCopyFrequency = ref<string>('weekly')
const scheduleCopyCount = ref(4)

const FREQUENCIES = [
  { key: 'every-1', label: 'Every day', days: 1 },
  { key: 'every-2', label: 'Every 2 days', days: 2 },
  { key: 'every-3', label: 'Every 3 days', days: 3 },
  { key: 'every-4', label: 'Every 4 days', days: 4 },
  { key: 'every-5', label: 'Every 5 days', days: 5 },
  { key: 'every-6', label: 'Every 6 days', days: 6 },
  { key: 'weekly', label: 'Once a week', days: 7 },
  { key: 'biweekly', label: 'Every 2 weeks', days: 14 },
  { key: 'monthly', label: 'Once a month', months: 1 },
] as const

const scheduleCopyDates = computed(() => {
  if (scheduleCopySourceIndex.value === null) return []
  const src = form.value.workouts[scheduleCopySourceIndex.value]
  if (!src?.date) return []
  const freq = FREQUENCIES.find(f => f.key === scheduleCopyFrequency.value)
  if (!freq) return []
  const base = new Date(src.date + 'T00:00:00')
  return Array.from({ length: scheduleCopyCount.value }, (_, i) => {
    const d = new Date(base)
    if ('months' in freq) d.setMonth(d.getMonth() + freq.months * (i + 1))
    else d.setDate(d.getDate() + freq.days * (i + 1))
    return d.toISOString().split('T')[0]
  })
})

let savedSnapshot = ''

const isDirty = computed(() => JSON.stringify(form.value) !== savedSnapshot)

const STATUS_CYCLE = ['draft', 'active', 'inactive']
const STATUS_META: Record<string, { label: string; classes: string }> = {
  draft: { label: 'Draft', classes: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60' },
  active: { label: 'Active', classes: 'bg-primary/10 text-primary' },
  inactive: { label: 'Inactive', classes: 'bg-red-50 dark:bg-red-500/10 text-red-500' },
}

const statusMeta = computed(() => STATUS_META[form.value.status ?? 'draft'] ?? STATUS_META.draft)
const selectedClient = computed(() =>
  clientStore.clients.find((c) => c.invitationCode === form.value.clientId) ?? null,
)
const wizardSteps = computed(() =>
  form.value.workouts.map((w, i) => {
    const exCount = (w.excercises ?? []).length
    const vol = (w.excercises ?? []).reduce((sum, ex) =>
      sum + (ex.sets ?? []).reduce((s, set) => s + (set.reps ?? 0) * (set.weight ?? 0), 0), 0)
    const parts: string[] = []
    if (w.date) parts.push(new Date(w.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))
    if (exCount) parts.push(`${exCount} ex`)
    if (vol > 0) parts.push(vol >= 1000 ? `${(vol / 1000).toFixed(1)}k kg` : `${vol} kg`)
    return { id: i, label: w.name ?? 'New workout', subtitle: parts.length ? parts.join(' · ') : undefined }
  }),
)

const calendarYear = computed(() => calendarCursor.value.getFullYear())
const calendarMonth = computed(() => calendarCursor.value.getMonth())
const calendarTitle = computed(() =>
  calendarCursor.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
)
const calendarDays = computed(() => {
  const year = calendarYear.value
  const month = calendarMonth.value
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7 // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: { dateStr: string | null }[] = Array.from({ length: firstDow }, () => ({ dateStr: null }))
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ dateStr })
  }
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push({ dateStr: null })
  return cells
})
const workoutsByDate = computed(() => {
  const map = new Map<string, number[]>()
  form.value.workouts.forEach((w, i) => {
    if (w.date) {
      if (!map.has(w.date)) map.set(w.date, [])
      map.get(w.date)!.push(i)
    }
  })
  return map
})
const todayStr = new Date().toISOString().split('T')[0]

watch(planView, (newVal) => {
  slideDirection.value = newVal === 'calendar' ? 'left' : 'right'
})

function prevMonth() {
  calendarCursor.value = new Date(calendarYear.value, calendarMonth.value - 1, 1)
}
function nextMonth() {
  calendarCursor.value = new Date(calendarYear.value, calendarMonth.value + 1, 1)
}
function goToWorkout(index: number) {
  activeWorkoutIndex.value = index
  planView.value = 'wizard'
}

function onChipDragStart(wIdx: number, e: DragEvent) {
  draggingIdx.value = wIdx
  e.dataTransfer!.effectAllowed = 'copyMove'
}
function onChipDragEnd() {
  draggingIdx.value = null
  dragOverDate.value = null
}
function onCellDragOver(dateStr: string, e: DragEvent) {
  e.preventDefault()
  dragOverDate.value = dateStr
  e.dataTransfer!.dropEffect = e.ctrlKey ? 'copy' : 'move'
}
function onCellDragLeave(e: DragEvent) {
  if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
    dragOverDate.value = null
  }
}
function onCellDrop(dateStr: string, e: DragEvent) {
  e.preventDefault()
  if (draggingIdx.value === null) return
  if (e.ctrlKey) {
    const src = form.value.workouts[draggingIdx.value]
    form.value.workouts.push({
      id: null, name: src.name, note: src.note, user_id: null,
      excercises: JSON.parse(JSON.stringify(src.excercises)), date: dateStr,
    })
  } else {
    form.value.workouts[draggingIdx.value].date = dateStr
  }
  draggingIdx.value = null
  dragOverDate.value = null
}

watch(
  () => form.value.workouts.map((w) => w.name),
  (names) => {
    if (!nameIsAuto.value) return
    form.value.name = names.filter(Boolean).join(' + ') || null
  },
)

function onNameInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  nameIsAuto.value = !val
  form.value.name = val || null
}

function cycleStatus() {
  const idx = STATUS_CYCLE.indexOf(form.value.status ?? 'draft')
  form.value.status = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

watch(() => props.open, (val) => {
  if (!val) return
  if (props.plan) {
    form.value = {
      name: props.plan.name,
      clientId: props.plan.clientId,
      note: props.plan.note,
      status: props.plan.status,
      workouts: (props.plan.workouts ?? []).map((w) => ({
        id: w.id, name: w.name, note: w.note, user_id: w.userId,
        excercises: w.excercises, date: w.date,
      })),
    }
    nameIsAuto.value = false
  } else {
    form.value = { name: null, clientId: null, note: null, status: null, workouts: [] }
    nameIsAuto.value = true
  }
  activeWorkoutIndex.value = 0
  planView.value = 'wizard'
  const firstDated = form.value.workouts.find(w => w.date)
  calendarCursor.value = firstDated ? new Date(firstDated.date + 'T00:00:00') : new Date()
  savedSnapshot = JSON.stringify(form.value)
  if (!clientStore.clients.length) clientStore.fetch()
})

function requestClose() {
  if (isDirty.value) {
    confirmDiscard.value = true
  } else {
    emit('close')
  }
}

function onClientPicked(client: ClientOut) {
  form.value.clientId = client.invitationCode
}

function onRoutinePicked(routine: RoutineOut) {
  form.value.workouts.push({
    id: null,
    name: routine.name,
    note: routine.note,
    user_id: null,
    excercises: routine.excercises as RoutineExcercise[],
    date: null,
  })
  activeWorkoutIndex.value = form.value.workouts.length - 1
}

function addBlankWorkout() {
  form.value.workouts.push({ id: null, name: null, note: null, user_id: null, excercises: [], date: null })
  activeWorkoutIndex.value = form.value.workouts.length - 1
}

function onExercisePicked(ex: ExcerciseOut) {
  const workout = form.value.workouts[activeWorkoutIndex.value]
  if (!workout) return
  if (!workout.excercises) workout.excercises = []
  workout.excercises.push({
    name: ex.name,
    isBodyweight: ex.isBodyweight,
    sets: [{ type: 'normal', reps: 10, weight: null, note: null }],
  })
}

function removeExercise(workoutIdx: number, exIdx: number) {
  form.value.workouts[workoutIdx].excercises!.splice(exIdx, 1)
}

function addSet(workoutIdx: number, exIdx: number) {
  const sets = form.value.workouts[workoutIdx].excercises![exIdx].sets ?? []
  const last = sets[sets.length - 1]
  form.value.workouts[workoutIdx].excercises![exIdx].sets = [
    ...sets,
    last ? { ...last } : { type: 'normal', reps: 10, weight: null, note: null },
  ]
}

function removeSet(workoutIdx: number, exIdx: number, setIdx: number) {
  form.value.workouts[workoutIdx].excercises![exIdx].sets!.splice(setIdx, 1)
}

function onSetsAdded(sets: RoutineSet[]) {
  const ex = form.value.workouts[activeWorkoutIndex.value].excercises![addSetsForExIdx.value!]
  ex.sets = [...(ex.sets ?? []), ...sets]
  addSetsForExIdx.value = null
}

function openScheduleCopy(index: number) {
  scheduleCopySourceIndex.value = index
  scheduleCopyFrequency.value = 'weekly'
  scheduleCopyCount.value = 4
  isScheduleCopyOpen.value = true
}

function doScheduleCopy() {
  const src = form.value.workouts[scheduleCopySourceIndex.value!]
  for (const date of scheduleCopyDates.value) {
    form.value.workouts.push({
      id: null,
      name: src.name,
      note: src.note,
      user_id: null,
      excercises: JSON.parse(JSON.stringify(src.excercises)),
      date,
    })
  }
  activeWorkoutIndex.value = form.value.workouts.length - 1
  isScheduleCopyOpen.value = false
  scheduleCopySourceIndex.value = null
}

function removeWorkout(i: number) {
  form.value.workouts.splice(i, 1)
  if (activeWorkoutIndex.value >= form.value.workouts.length) {
    activeWorkoutIndex.value = Math.max(0, form.value.workouts.length - 1)
  }
}

async function save() {
  saving.value = true
  try {
    if (props.plan?.id) {
      await planStore.update(props.plan.id, form.value as PlanUpdate)
      if (form.value.status && form.value.status !== props.plan.status) {
        await planStore.updateStatus(props.plan.id, form.value.status)
      }
      toast.success('Plan updated')
    } else {
      const { status, ...createModel } = form.value;
      await planStore.create(createModel as PlanCreate);
      toast.success('Plan created')
    }
    savedSnapshot = JSON.stringify(form.value)
    emit('close')
  } catch {
    toast.error('Failed to save plan')
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!props.plan?.id) return
  try {
    await planStore.remove(props.plan.id)
    toast.success('Plan deleted')
    confirmDelete.value = false
    emit('close')
  } catch {
    toast.error('Failed to delete plan')
  }
}
</script>

<template>
  <FullSizeDialog :open="open">
    <template #header>
      <input :value="form.name ?? ''" type="text" placeholder="Plan name…" autofocus
        class="flex-1 min-w-0 text-lg font-semibold bg-transparent outline-none text-text-primary dark:text-white placeholder:text-text-secondary placeholder:font-normal"
        @input="onNameInput" />

      <!-- Client picker -->
      <button type="button"
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-text-secondary dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary transition-colors flex-shrink-0"
        @click="isClientPickerOpen = true">
        <BaseAvatar v-if="selectedClient" :name="selectedClient.name ?? '?'" size="xs" />
        <span class="max-w-[120px] truncate">{{ selectedClient?.name ?? 'No client' }}</span>
      </button>

      <!-- Status badge — only when editing an existing plan -->
      <button v-if="plan" type="button"
        :class="['px-2.5 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-colors focus-visible:ring-2 focus-visible:ring-primary', statusMeta.classes]"
        @click="cycleStatus">
        {{ statusMeta.label }}
      </button>

      <!-- View toggle -->
      <div v-if="form.workouts.length" class="flex items-center gap-0.5 bg-gray-100 dark:bg-white/10 rounded-xl p-1 flex-shrink-0">
        <button type="button"
          :class="['p-1.5 rounded-lg transition-colors', planView === 'wizard' ? 'bg-white dark:bg-white/15 text-text-primary dark:text-white shadow-sm' : 'text-text-secondary dark:text-white/50 hover:text-text-primary dark:hover:text-white']"
          aria-label="Wizard view" @click="planView = 'wizard'">
          <LayoutList class="w-4 h-4" />
        </button>
        <button type="button"
          :class="['p-1.5 rounded-lg transition-colors', planView === 'calendar' ? 'bg-white dark:bg-white/15 text-text-primary dark:text-white shadow-sm' : 'text-text-secondary dark:text-white/50 hover:text-text-primary dark:hover:text-white']"
          aria-label="Calendar view" @click="planView = 'calendar'">
          <CalendarDays class="w-4 h-4" />
        </button>
      </div>

      <!-- Close -->
      <button type="button"
        class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary dark:text-white/60 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Close dialog" @click="requestClose">
        <X class="w-5 h-5" />
      </button>
    </template>

    <!-- Animated view container -->
    <div v-if="form.workouts.length" class="h-full overflow-hidden relative">
      <Transition :name="slideTransitionName" mode="out-in">

        <!-- Wizard -->
        <ProcessWizard v-if="planView === 'wizard'" key="wizard" v-model="activeWorkoutIndex" :steps="wizardSteps" class="h-full">
          <template #add-step>
            <div class="flex flex-col gap-1">
              <button type="button"
                class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-primary font-medium hover:bg-primary/10 transition-colors"
                @click="isRoutinePickerOpen = true">
                <Plus class="w-4 h-4" />
                From routine
              </button>
              <button type="button"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-secondary dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                @click="addBlankWorkout">
                <Plus class="w-4 h-4" />
                Blank workout
              </button>
            </div>
          </template>

          <template #step-content="{ index }">
            <div v-if="form.workouts[index]" class="flex flex-col gap-5">
              <!-- Workout name + remove -->
              <div class="flex items-center justify-between gap-3">
                <input :value="form.workouts[index].name ?? ''" type="text" placeholder="Workout name…"
                  class="flex-1 text-lg font-semibold bg-transparent outline-none text-text-primary dark:text-white placeholder:text-text-secondary placeholder:font-normal"
                  @input="form.workouts[index].name = ($event.target as HTMLInputElement).value || null" />
                <button type="button"
                  class="text-sm text-red-500 hover:text-red-600 font-medium focus-visible:ring-1 focus-visible:ring-primary rounded flex-shrink-0"
                  @click="removeWorkout(index)">
                  Remove
                </button>
              </div>

              <!-- Date -->
              <div class="flex items-center gap-2">
                <BaseDatePicker :model-value="form.workouts[index].date" label="Date" class="flex-1"
                  @update:model-value="form.workouts[index].date = $event" />
                <button type="button"
                  :disabled="!form.workouts[index].date"
                  :class="['flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors mt-5', form.workouts[index].date ? 'border-primary text-primary hover:bg-primary/10' : 'border-gray-200 dark:border-white/10 text-text-secondary dark:text-white/30 cursor-not-allowed']"
                  @click="openScheduleCopy(index)">
                  <Copy class="w-4 h-4" />
                  Schedule copy
                </button>
              </div>

              <!-- Note -->
              <div class="flex flex-col gap-1.5">
                <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Note</p>
                <textarea :value="form.workouts[index].note ?? ''" rows="2" placeholder="Optional note…"
                  class="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm bg-white dark:bg-surface-dark text-text-primary dark:text-white placeholder:text-text-secondary outline-none resize-none focus-visible:ring-2 focus-visible:ring-primary"
                  @input="form.workouts[index].note = ($event.target as HTMLTextAreaElement).value || null" />
              </div>

              <!-- Exercises -->
              <div class="flex flex-col gap-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Exercises</p>

                <div v-for="(ex, ei) in form.workouts[index].excercises ?? []" :key="ei"
                  class="flex flex-col gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/10">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-sm text-text-primary dark:text-white">{{ ex.name }}</span>
                      <span v-if="ex.isBodyweight"
                        class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                        Bodyweight
                      </span>
                    </div>
                    <button type="button"
                      class="text-sm text-red-500 hover:text-red-600 font-medium focus-visible:ring-1 focus-visible:ring-primary rounded flex-shrink-0"
                      @click="removeExercise(index, ei)">
                      Remove
                    </button>
                  </div>

                  <div class="flex flex-col gap-2">
                    <div v-for="(set, si) in ex.sets ?? []" :key="si" class="flex items-center gap-2">
                      <EditSet :set="set" :is-bodyweight="ex.isBodyweight" class="flex-1"
                        @update:set="form.workouts[index].excercises![ei].sets![si] = $event" />
                      <button type="button"
                        class="text-red-400 hover:text-red-600 text-lg leading-none p-1 focus-visible:ring-1 focus-visible:ring-primary rounded"
                        aria-label="Remove set" @click="removeSet(index, ei, si)">×</button>
                    </div>
                  </div>

                  <div class="flex items-center gap-4">
                    <button type="button"
                      class="text-sm text-primary font-medium hover:underline focus-visible:ring-1 focus-visible:ring-primary rounded"
                      @click="addSet(index, ei)">+ Add set</button>
                    <button type="button"
                      class="text-sm text-primary font-medium hover:underline focus-visible:ring-1 focus-visible:ring-primary rounded"
                      @click="addSetsForExIdx = ei">+ Add sets…</button>
                  </div>
                </div>

                <button type="button"
                  class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-primary font-medium hover:bg-primary/10 transition-colors w-full"
                  @click="isExercisePickerOpen = true">
                  <Plus class="w-4 h-4" />
                  Add exercise
                </button>
              </div>
            </div>
          </template>
        </ProcessWizard>

        <!-- Calendar view -->
        <div v-else key="calendar" class="h-full flex flex-col overflow-auto p-4">
          <!-- Month navigation + add buttons -->
          <div class="flex items-center gap-2 mb-4 flex-shrink-0">
            <button type="button"
              class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary dark:text-white/60 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              @click="prevMonth">
              <ChevronLeft class="w-5 h-5" />
            </button>
            <p class="text-sm font-semibold text-text-primary dark:text-white capitalize flex-1 text-center">{{ calendarTitle }}</p>
            <button type="button"
              class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary dark:text-white/60 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              @click="nextMonth">
              <ChevronRight class="w-5 h-5" />
            </button>
            <div class="w-px h-4 bg-gray-200 dark:bg-white/10 mx-1" />
            <button type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-primary font-medium hover:bg-primary/10 transition-colors"
              @click="isRoutinePickerOpen = true">
              <Plus class="w-3.5 h-3.5" />
              From routine
            </button>
            <button type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-text-secondary dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              @click="addBlankWorkout">
              <Plus class="w-3.5 h-3.5" />
              Blank
            </button>
          </div>

          <!-- Day-of-week headers -->
          <div class="grid grid-cols-7 mb-1 flex-shrink-0">
            <div v-for="d in ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']" :key="d"
              class="text-center text-xs font-semibold text-text-secondary py-1">{{ d }}</div>
          </div>

          <!-- Day cells -->
          <div class="grid grid-cols-7 gap-px flex-1">
            <div v-for="(cell, ci) in calendarDays" :key="ci"
              :class="['min-h-[80px] rounded-lg p-1 flex flex-col gap-1 transition-colors',
                cell.dateStr ? 'bg-white dark:bg-white/5' : '',
                cell.dateStr === todayStr ? 'ring-2 ring-primary ring-inset' : '',
                cell.dateStr && dragOverDate === cell.dateStr ? 'bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/50 ring-inset' : '']"
              @dragover="cell.dateStr ? onCellDragOver(cell.dateStr, $event) : undefined"
              @dragleave="onCellDragLeave($event)"
              @drop="cell.dateStr ? onCellDrop(cell.dateStr, $event) : undefined">
              <!-- Day number -->
              <span v-if="cell.dateStr"
                :class="['text-xs font-medium leading-none px-1 pt-0.5 self-end select-none',
                  cell.dateStr === todayStr ? 'text-primary' : 'text-text-secondary dark:text-white/40']">
                {{ Number(cell.dateStr.split('-')[2]) }}
              </span>
              <!-- Workout chips -->
              <div v-for="wIdx in workoutsByDate.get(cell.dateStr ?? '') ?? []" :key="wIdx"
                :class="['w-full px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium truncate leading-5 cursor-grab active:cursor-grabbing transition-opacity',
                  draggingIdx === wIdx ? 'opacity-40' : 'hover:bg-primary/20']"
                draggable="true"
                :title="form.workouts[wIdx].name || 'Workout'"
                @click="goToWorkout(wIdx)"
                @dragstart="onChipDragStart(wIdx, $event)"
                @dragend="onChipDragEnd">
                {{ form.workouts[wIdx].name || 'Workout' }}
              </div>
            </div>
          </div>

          <!-- DnD hint -->
          <p class="text-xs text-text-secondary text-center mt-2 flex-shrink-0 select-none">
            Drag to move · Hold <kbd class="px-1 py-0.5 rounded bg-gray-100 dark:bg-white/10 font-mono text-[10px]">Ctrl</kbd> while dropping to copy
          </p>
        </div>

      </Transition>
    </div>

    <!-- Empty state -->
    <div v-else class="h-full flex flex-col items-center justify-center gap-2">
      <EmptyState :icon="CalendarDays" title="No workouts yet" description="Add a workout from a routine or start blank"
        action-label="From routine" @action="isRoutinePickerOpen = true" />
      <button type="button"
        class="text-sm text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors"
        @click="addBlankWorkout">
        or add a blank workout
      </button>
    </div>

    <template #footer>
      <div class="flex items-center gap-2">
        <BaseButton v-if="plan" variant="danger" @click="confirmDelete = true">Delete</BaseButton>
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="requestClose">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">{{ plan ? 'Save' : 'Create' }}</BaseButton>
      </div>
    </template>
  </FullSizeDialog>

  <ConfirmDialog :open="confirmDelete" title="Delete Plan" message="Are you sure you want to delete this plan?"
    confirm-label="Delete" variant="danger" @confirm="doDelete" @cancel="confirmDelete = false" />

  <ConfirmDialog :open="confirmDiscard" title="Discard changes?"
    message="You have unsaved changes. Leave anyway and lose them?" confirm-label="Discard" variant="danger"
    @confirm="confirmDiscard = false; emit('close')" @cancel="confirmDiscard = false" />

  <ClientPickerDialog :open="isClientPickerOpen" @select="onClientPicked" @close="isClientPickerOpen = false" />

  <RoutinePickerDialog :open="isRoutinePickerOpen" @select="onRoutinePicked" @close="isRoutinePickerOpen = false" />

  <ExercisePickerDialog :open="isExercisePickerOpen" @select="onExercisePicked" @close="isExercisePickerOpen = false" />

  <!-- Schedule copy dialog -->
  <Teleport to="body">
    <div v-if="isScheduleCopyOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-5 p-6">
        <h3 class="text-base font-semibold text-text-primary dark:text-white">Schedule copies</h3>

        <!-- Frequency -->
        <div class="flex flex-col gap-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Frequency</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="freq in FREQUENCIES" :key="freq.key" type="button"
              :class="['px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors', scheduleCopyFrequency === freq.key ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-white/10 text-text-secondary dark:text-white/60 hover:border-primary/50 hover:text-primary']"
              @click="scheduleCopyFrequency = freq.key">
              {{ freq.label }}
            </button>
          </div>
        </div>

        <!-- Count -->
        <div class="flex flex-col gap-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Number of copies</p>
          <div class="flex items-center gap-3">
            <button type="button"
              class="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 text-text-primary dark:text-white text-lg leading-none flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30"
              :disabled="scheduleCopyCount <= 1" @click="scheduleCopyCount = Math.max(1, scheduleCopyCount - 1)">−</button>
            <span class="w-8 text-center text-sm font-semibold text-text-primary dark:text-white">{{ scheduleCopyCount }}</span>
            <button type="button"
              class="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 text-text-primary dark:text-white text-lg leading-none flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30"
              :disabled="scheduleCopyCount >= 52" @click="scheduleCopyCount = Math.min(52, scheduleCopyCount + 1)">+</button>
          </div>
        </div>

        <!-- Date preview -->
        <div class="flex flex-col gap-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {{ scheduleCopyDates.length }} workout{{ scheduleCopyDates.length !== 1 ? 's' : '' }} will be added
          </p>
          <ul class="flex flex-col gap-1 max-h-40 overflow-y-auto">
            <li v-for="(d, i) in scheduleCopyDates" :key="d"
              class="flex items-center gap-2 text-sm text-text-primary dark:text-white px-2 py-1 rounded-lg odd:bg-gray-50 dark:odd:bg-white/5">
              <span class="text-text-secondary dark:text-white/40 w-5 text-right text-xs">{{ i + 1 }}</span>
              <span>{{ new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) }}</span>
            </li>
          </ul>
        </div>

        <div class="flex items-center justify-end gap-2">
          <BaseButton variant="ghost" @click="isScheduleCopyOpen = false">Cancel</BaseButton>
          <BaseButton variant="primary" :disabled="!scheduleCopyDates.length" @click="doScheduleCopy">
            Add {{ scheduleCopyDates.length }} workout{{ scheduleCopyDates.length !== 1 ? 's' : '' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>

  <AddSetsDialog v-if="addSetsForExIdx !== null" :open="addSetsForExIdx !== null"
    :base-set="form.workouts[activeWorkoutIndex]?.excercises?.[addSetsForExIdx]?.sets?.at(-1) ?? { type: 'normal', reps: 10, weight: null, note: null }"
    :is-bodyweight="form.workouts[activeWorkoutIndex]?.excercises?.[addSetsForExIdx]?.isBodyweight" @add="onSetsAdded"
    @close="addSetsForExIdx = null" />
</template>

<style scoped>
.view-slide-left-enter-active,
.view-slide-left-leave-active,
.view-slide-right-enter-active,
.view-slide-right-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.view-slide-left-enter-from  { transform: translateX(40px);  opacity: 0; }
.view-slide-left-leave-to    { transform: translateX(-40px); opacity: 0; }
.view-slide-right-enter-from { transform: translateX(-40px); opacity: 0; }
.view-slide-right-leave-to   { transform: translateX(40px);  opacity: 0; }
</style>
