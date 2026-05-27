<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePageTitle } from '../../../composables/usePageTitle'
import type { RoutineOut, RoutineCreate, RoutineUpdate, RoutineExcercise, RoutineSet, ExcerciseOut, DefaultWorkoutOut, ActivityType, ActivityTrackType } from '../../../types'
import { useRoutineStore } from '../../../stores/routineStore'
import { useToast } from '../../../composables/useToast'
import FullSizeDialog from '../../../components/FullSizeDialog/index.vue'
import ProcessWizard from '../../../components/ProcessWizard/index.vue'
import ExercisePickerDialog from '../../../components/ExercisePickerDialog/index.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import BaseButton from '../../../components/BaseButton.vue'
import EmptyState from '../../../components/EmptyState.vue'
import { X, Plus, Dumbbell } from 'lucide-vue-next'
import EditSet from '../../../components/EditSet/index.vue'
import AddSetsDialog from '../../../components/AddSetsDialog/index.vue'
import DefaultWorkoutPickerDialog from '../../../components/DefaultWorkoutPickerDialog/index.vue'

const props = defineProps<{
  open: boolean
  routine: RoutineOut | null
}>()
const emit = defineEmits<{ close: [] }>()

usePageTitle(() => props.routine ? 'Edit Routine' : 'New Routine', () => props.open)

const routineStore = useRoutineStore()
const toast = useToast()

const ACTIVITY_TYPE_BADGE: Record<ActivityType, { label: string; classes: string }> = {
  weighted:   { label: 'Weighted',   classes: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' },
  machine:    { label: 'Machine',    classes: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' },
  bodyweight: { label: 'Bodyweight', classes: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' },
  cardio:     { label: 'Cardio',     classes: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400' },
}

const form = ref<{ name: string | null; note: string | null; excercises: RoutineExcercise[] }>({
  name: null, note: null, excercises: []
})
const saving = ref(false)
const confirmDelete = ref(false)
const confirmDiscard = ref(false)
const activeStepIndex = ref(0)
const isExercisePickerOpen = ref(false)
const isDefaultWorkoutPickerOpen = ref(false)
const addSetsForExIdx = ref<number | null>(null)

let savedSnapshot = ''

const isDirty = computed(() => JSON.stringify(form.value) !== savedSnapshot)

const nameIsAuto = ref(false)

const wizardSteps = computed(() =>
  form.value.excercises.map((ex, i) => ({ id: i, label: ex.name ?? 'New exercise' }))
)

watch(
  () => form.value.excercises.map((e) => e.name),
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

watch(() => props.open, (val) => {
  if (val) {
    if (props.routine) {
      form.value = {
        name: props.routine.name,
        note: props.routine.note,
        excercises: (props.routine.excercises ?? []).map((ex) => ({
          name: ex.name,
          activityType: ex.activityType ?? 'weighted',
          activityTrackType: ex.activityTrackType ?? 'repetitions',
          sets: (ex.sets ?? []).map((s) => ({ ...s })),
        })),
      }
      nameIsAuto.value = false
    } else {
      form.value = { name: null, note: null, excercises: [] }
      nameIsAuto.value = true
    }
    activeStepIndex.value = 0
    savedSnapshot = JSON.stringify(form.value)
  }
})

function requestClose() {
  if (isDirty.value) {
    confirmDiscard.value = true
  } else {
    emit('close')
  }
}

function defaultSetForTrackType(trackType: ActivityTrackType): RoutineSet {
  if (trackType === 'time') return { type: 'normal', reps: null, weight: null, duration: 60, distance: null, note: null }
  if (trackType === 'distance') return { type: 'normal', reps: null, weight: null, duration: null, distance: 1000, note: null }
  return { type: 'normal', reps: 10, weight: null, duration: null, distance: null, note: null }
}

function onExercisePicked(ex: ExcerciseOut) {
  const trackType: ActivityTrackType = ex.activityTrackType ?? 'repetitions'
  form.value.excercises.push({
    name: ex.name,
    activityType: ex.activityType ?? 'weighted',
    activityTrackType: trackType,
    sets: [defaultSetForTrackType(trackType)],
  })
  activeStepIndex.value = form.value.excercises.length - 1
}

function removeExercise(i: number) {
  form.value.excercises.splice(i, 1)
  if (activeStepIndex.value >= form.value.excercises.length) {
    activeStepIndex.value = Math.max(0, form.value.excercises.length - 1)
  }
}

function addSet(exIdx: number) {
  const sets = form.value.excercises[exIdx].sets ?? []
  const last = sets[sets.length - 1]
  form.value.excercises[exIdx].sets = [
    ...sets,
    last ? { ...last } : { type: 'normal', reps: 10, weight: null, note: null },
  ]
}

function removeSet(exIdx: number, setIdx: number) {
  form.value.excercises[exIdx].sets!.splice(setIdx, 1)
}

function onSetsAdded(sets: RoutineSet[]) {
  const ex = form.value.excercises[addSetsForExIdx.value!]
  ex.sets = [...(ex.sets ?? []), ...sets]
  addSetsForExIdx.value = null
}

function onDefaultWorkoutSelected(w: DefaultWorkoutOut) {
  form.value.excercises = (w.excercises ?? []).map((ex) => ({
    name: ex.name,
    activityType: ex.activityType ?? 'weighted',
    activityTrackType: ex.activityTrackType ?? 'repetitions',
    sets: (ex.sets ?? []).map((s) => ({ ...s })),
  }))
  if (nameIsAuto.value) {
    form.value.name = w.name
  }
  activeStepIndex.value = 0
}

async function save() {
  saving.value = true
  try {
    if (props.routine?.id) {
      await routineStore.update(props.routine.id, form.value as RoutineUpdate)
      toast.success('Routine updated')
    } else {
      await routineStore.create(form.value as RoutineCreate)
      toast.success('Routine created')
    }
    savedSnapshot = JSON.stringify(form.value)
    emit('close')
  } catch {
    toast.error('Failed to save routine')
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!props.routine?.id) return
  try {
    await routineStore.remove(props.routine.id)
    toast.success('Routine deleted')
    confirmDelete.value = false
    emit('close')
  } catch {
    toast.error('Failed to delete routine')
  }
}
</script>

<template>
  <FullSizeDialog :open="open">
    <template #header>
      <input
        :value="form.name ?? ''"
        @input="onNameInput"
        type="text"
        placeholder="Routine name…"
        autofocus
        class="flex-1 text-lg font-semibold bg-transparent outline-none text-text-primary dark:text-white placeholder:text-text-secondary placeholder:font-normal"
      />
      <button
        type="button"
        class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary dark:text-white/60 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Close dialog"
        @click="requestClose"
      >
        <X class="w-5 h-5" />
      </button>
    </template>

    <!-- Wizard or empty state -->
    <ProcessWizard
      v-if="form.excercises.length"
      v-model="activeStepIndex"
      :steps="wizardSteps"
      class="h-full"
    >
      <template #add-step>
        <button
          type="button"
          class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-primary font-medium hover:bg-primary/10 transition-colors"
          @click="isExercisePickerOpen = true"
        >
          <Plus class="w-4 h-4" />
          Add exercise
        </button>
      </template>

      <template #step-content="{ index }">
        <div v-if="form.excercises[index]" class="flex flex-col gap-5">
          <!-- Exercise header -->
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold text-text-primary dark:text-white truncate">
              {{ form.excercises[index].name }}
            </h2>
            <div class="flex items-center gap-4">
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="ACTIVITY_TYPE_BADGE[form.excercises[index].activityType ?? 'weighted'].classes"
              >
                {{ ACTIVITY_TYPE_BADGE[form.excercises[index].activityType ?? 'weighted'].label }}
              </span>
              <button
                type="button"
                class="text-sm text-red-500 hover:text-red-600 font-medium focus-visible:ring-1 focus-visible:ring-primary rounded"
                @click="removeExercise(index)"
              >
                Remove
              </button>
            </div>
          </div>

          <!-- Sets -->
          <div class="flex flex-col gap-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Sets</p>
            <div
              v-for="(set, setIdx) in form.excercises[index].sets ?? []"
              :key="setIdx"
              class="flex items-center gap-2"
            >
              <EditSet
                :set="set"
                :activity-type="form.excercises[index].activityType"
                :activity-track-type="form.excercises[index].activityTrackType"
                class="flex-1"
                @update:set="form.excercises[index].sets![setIdx] = $event"
              />
              <button
                type="button"
                class="text-red-400 hover:text-red-600 text-lg leading-none p-1 focus-visible:ring-1 focus-visible:ring-primary rounded"
                aria-label="Remove set"
                @click="removeSet(index, setIdx)"
              >
                ×
              </button>
            </div>
            <div class="flex items-center gap-4 mt-1">
              <button
                type="button"
                class="text-sm text-primary font-medium hover:underline focus-visible:ring-1 focus-visible:ring-primary rounded w-fit"
                @click="addSet(index)"
              >
                + Add set
              </button>
              <button
                type="button"
                class="text-sm text-primary font-medium hover:underline focus-visible:ring-1 focus-visible:ring-primary rounded w-fit"
                @click="addSetsForExIdx = index"
              >
                + Add sets…
              </button>
            </div>
          </div>
        </div>
      </template>
    </ProcessWizard>

    <!-- Empty state when no exercises yet -->
    <div v-else class="h-full flex flex-col items-center justify-center">
      <EmptyState
        :icon="Dumbbell"
        title="No exercises yet"
        description="Add your first exercise to get started"
        action-label="Add exercise"
        @action="isExercisePickerOpen = true"
      />
    </div>

    <template #footer>
      <div class="flex items-center gap-2">
        <BaseButton v-if="routine" variant="danger" @click="confirmDelete = true">Delete</BaseButton>
        <BaseButton v-if="!routine" variant="ghost" @click="isDefaultWorkoutPickerOpen = true">Use default workout</BaseButton>
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="requestClose">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">{{ routine ? 'Save' : 'Create' }}</BaseButton>
      </div>
    </template>
  </FullSizeDialog>

  <ConfirmDialog
    :open="confirmDelete"
    title="Delete Routine"
    message="Are you sure you want to delete this routine?"
    confirm-label="Delete"
    variant="danger"
    @confirm="doDelete"
    @cancel="confirmDelete = false"
  />

  <ConfirmDialog
    :open="confirmDiscard"
    title="Discard changes?"
    message="You have unsaved changes. Leave anyway and lose them?"
    confirm-label="Discard"
    variant="danger"
    @confirm="confirmDiscard = false; emit('close')"
    @cancel="confirmDiscard = false"
  />

  <ExercisePickerDialog
    :open="isExercisePickerOpen"
    @close="isExercisePickerOpen = false"
    @select="onExercisePicked"
  />

  <AddSetsDialog
    v-if="addSetsForExIdx !== null"
    :open="addSetsForExIdx !== null"
    :base-set="form.excercises[addSetsForExIdx].sets?.at(-1) ?? { type: 'normal', reps: 10, weight: null, duration: null, distance: null, note: null }"
    :activity-type="form.excercises[addSetsForExIdx].activityType"
    :activity-track-type="form.excercises[addSetsForExIdx].activityTrackType"
    @add="onSetsAdded"
    @close="addSetsForExIdx = null"
  />

  <DefaultWorkoutPickerDialog
    :open="isDefaultWorkoutPickerOpen"
    @close="isDefaultWorkoutPickerOpen = false"
    @select="onDefaultWorkoutSelected"
  />
</template>
