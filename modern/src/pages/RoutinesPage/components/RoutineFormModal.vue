<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RoutineOut, RoutineCreate, RoutineUpdate, RoutineExcercise, ExcerciseOut } from '../../../types'
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

const props = defineProps<{
  open: boolean
  routine: RoutineOut | null
}>()
const emit = defineEmits<{ close: [] }>()

const routineStore = useRoutineStore()
const toast = useToast()

const form = ref<{ name: string | null; note: string | null; excercises: RoutineExcercise[] }>({
  name: null, note: null, excercises: []
})
const saving = ref(false)
const confirmDelete = ref(false)
const activeStepIndex = ref(0)
const isExercisePickerOpen = ref(false)


const wizardSteps = computed(() =>
  form.value.excercises.map((ex, i) => ({ id: i, label: ex.name ?? 'New exercise' }))
)

watch(() => props.open, (val) => {
  if (val) {
    if (props.routine) {
      form.value = {
        name: props.routine.name,
        note: props.routine.note,
        excercises: (props.routine.excercises ?? []).map((ex) => ({
          name: ex.name,
          isBodyweight: ex.isBodyweight,
          sets: (ex.sets ?? []).map((s) => ({ ...s })),
        })),
      }
    } else {
      form.value = { name: null, note: null, excercises: [] }
    }
    activeStepIndex.value = 0
  }
})

function onExercisePicked(ex: ExcerciseOut) {
  form.value.excercises.push({
    name: ex.name,
    isBodyweight: false,
    sets: [{ type: 'normal', reps: 10, weight: null, note: null }],
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
        v-model="form.name"
        type="text"
        placeholder="Routine name…"
        autofocus
        class="flex-1 text-lg font-semibold bg-transparent outline-none text-text-primary dark:text-white placeholder:text-text-secondary placeholder:font-normal"
      />
      <button
        type="button"
        class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary dark:text-white/60 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Close dialog"
        @click="emit('close')"
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
              <label class="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
                <input v-model="form.excercises[index].isBodyweight" type="checkbox" class="w-4 h-4 accent-primary" />
                Bodyweight
              </label>
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
                :is-bodyweight="form.excercises[index].isBodyweight"
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
            <button
              type="button"
              class="text-sm text-primary font-medium text-left hover:underline mt-1 focus-visible:ring-1 focus-visible:ring-primary rounded w-fit"
              @click="addSet(index)"
            >
              + Add set
            </button>
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
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
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

  <ExercisePickerDialog
    :open="isExercisePickerOpen"
    @close="isExercisePickerOpen = false"
    @select="onExercisePicked"
  />
</template>
