<script setup lang="ts">
import { ref, watch } from 'vue'
import type { RoutineOut, RoutineCreate, RoutineUpdate, RoutineExcercise } from '../../../types'
import { useRoutineStore } from '../../../stores/routineStore'
import { useExerciseStore } from '../../../stores/exerciseStore'
import { useToast } from '../../../composables/useToast'
import BaseModal from '../../../components/BaseModal.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseTextarea from '../../../components/BaseTextarea.vue'
import BaseButton from '../../../components/BaseButton.vue'
import BaseSelect from '../../../components/BaseSelect.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import SelectExercise from '../../../components/SelectExercise/index.vue'

const props = defineProps<{
  open: boolean
  routine: RoutineOut | null
}>()
const emit = defineEmits<{ close: [] }>()

const routineStore = useRoutineStore()
const exerciseStore = useExerciseStore()
const toast = useToast()

const form = ref<{ name: string | null; note: string | null; excercises: RoutineExcercise[] }>({
  name: null, note: null, excercises: []
})
const saving = ref(false)
const confirmDelete = ref(false)
const addExId = ref<number | null>(null)

const setTypeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'warmup', label: 'Warmup' },
  { value: 'drop', label: 'Drop' },
]

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
    addExId.value = null
  }
})

function addExercise() {
  const ex = exerciseStore.exercises.find((e) => e.id === addExId.value)
  if (!ex) return
  form.value.excercises.push({
    name: ex.name,
    isBodyweight: false,
    sets: [{ type: 'normal', reps: 10, weight: null, note: null }],
  })
  addExId.value = null
}

function removeExercise(i: number) {
  form.value.excercises.splice(i, 1)
}

function addSet(exIdx: number) {
  form.value.excercises[exIdx].sets = [
    ...(form.value.excercises[exIdx].sets ?? []),
    { type: 'normal', reps: 10, weight: null, note: null },
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
  <BaseModal :open="open" :title="routine ? 'Edit Routine' : 'New Routine'" size="lg" @close="emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="save">
      <BaseInput v-model="form.name" label="Name" placeholder="e.g. Push Day" />
      <BaseTextarea v-model="form.note" label="Notes" placeholder="Optional notes..." :rows="2" />

      <!-- Exercises -->
      <div class="flex flex-col gap-3">
        <p class="text-sm font-semibold text-text-primary dark:text-white">Exercises</p>

        <div
          v-for="(ex, exIdx) in form.excercises"
          :key="exIdx"
          class="border border-gray-200 dark:border-white/10 rounded-xl p-3 flex flex-col gap-2"
        >
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm text-text-primary dark:text-white flex-1">{{ ex.name }}</span>
            <label class="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
              <input v-model="ex.isBodyweight" type="checkbox" class="w-3.5 h-3.5" />
              Bodyweight
            </label>
            <button type="button" class="text-red-500 text-xs hover:underline focus-visible:ring-1 focus-visible:ring-primary rounded" @click="removeExercise(exIdx)">Remove</button>
          </div>

          <!-- Sets -->
          <div class="flex flex-col gap-1.5">
            <div
              v-for="(set, setIdx) in ex.sets ?? []"
              :key="setIdx"
              class="flex items-center gap-2 text-xs"
            >
              <BaseSelect
                :model-value="set.type"
                :options="setTypeOptions"
                class="w-24 text-xs"
                @update:model-value="set.type = $event as string"
              />
              <BaseInput
                :model-value="set.reps"
                type="number"
                placeholder="Reps"
                class="w-16 text-xs"
                @update:model-value="set.reps = parseInt($event as string) || null"
              />
              <BaseInput
                v-if="!ex.isBodyweight"
                :model-value="set.weight"
                type="number"
                placeholder="kg"
                class="w-16 text-xs"
                @update:model-value="set.weight = parseFloat($event as string) || null"
              />
              <button type="button" class="text-red-400 hover:text-red-600 text-sm" aria-label="Remove set" @click="removeSet(exIdx, setIdx)">×</button>
            </div>
          </div>
          <button type="button" class="text-xs text-primary font-medium text-left hover:underline mt-1 focus-visible:ring-1 focus-visible:ring-primary rounded" @click="addSet(exIdx)">+ Add Set</button>
        </div>

        <!-- Add Exercise -->
        <div class="flex gap-2 items-end">
          <div class="flex-1">
            <SelectExercise v-model="addExId" label="Add Exercise" />
          </div>
          <BaseButton variant="secondary" size="sm" :disabled="addExId === null" @click="addExercise">Add</BaseButton>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center gap-2">
        <BaseButton v-if="routine" variant="danger" @click="confirmDelete = true">Delete</BaseButton>
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">{{ routine ? 'Save' : 'Create' }}</BaseButton>
      </div>
    </template>
  </BaseModal>

  <ConfirmDialog
    :open="confirmDelete"
    title="Delete Routine"
    message="Are you sure you want to delete this routine?"
    confirm-label="Delete"
    variant="danger"
    @confirm="doDelete"
    @cancel="confirmDelete = false"
  />
</template>
