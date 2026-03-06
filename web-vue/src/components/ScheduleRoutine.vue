<template>
  <div>
    <button
      type="button"
      @click="openDialog"
      class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
    >
      {{ buttonText }}
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Schedule workout</h3>
          <button
            type="button"
            @click="closeDialog"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div class="space-y-4">
          <SelectRoutine
            v-model="draftRoutineId"
            :routines="routines"
            label="Select routine"
          />

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Schedule date
            </label>
            <input
              v-model="draftDate"
              type="date"
              class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div class="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="closeDialog"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="applySelection"
            :disabled="!canApply"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Schedule workout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SelectRoutine from './SelectRoutine.vue'
import type { Routine } from '../types/routine'
import type { PlanWorkout } from '../types/plan'

const props = withDefaults(
  defineProps<{
    routines?: Routine[]
    buttonText?: string
  }>(),
  {
    routines: () => [],
    buttonText: 'Add workout',
  },
)

const emit = defineEmits<{
  (event: 'schedule', workout: PlanWorkout): void
}>()

const isOpen = ref(false)
const draftRoutineId = ref<string>('')
const draftDate = ref<string>('')

const canApply = computed(() => {
  return draftRoutineId.value && draftDate.value
})

const openDialog = () => {
  draftRoutineId.value = ''
  draftDate.value = new Date().toISOString().split('T')[0] || ''
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const applySelection = () => {
  if (!canApply.value) return

  const selectedRoutine = props.routines.find(r => r.id === draftRoutineId.value)
  if (!selectedRoutine) return

  const workout: PlanWorkout = {
    id: selectedRoutine.id,
    name: selectedRoutine.name,
    excercises: selectedRoutine.excercises,
    date: draftDate.value,
  }

  emit('schedule', workout)
  closeDialog()
}
</script>
