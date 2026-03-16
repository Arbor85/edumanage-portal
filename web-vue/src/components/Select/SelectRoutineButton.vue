<template>
  <div>
    <button
      type="button"
      @click="openDialog"
      :disabled="routines.length === 0"
      class="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
    >
      {{ buttonText }}
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ dialogTitle }}</h3>
          <button
            type="button"
            @click="closeDialog"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <SelectRoutine
          v-model="draftRoutineId"
          :routines="routines"
          label="Select routine"
        />

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
            :disabled="!draftRoutineId"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Select routine
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SelectRoutine from './SelectRoutine.vue'
import type { Routine } from '../../types/routine'

const props = withDefaults(
  defineProps<{
    routines?: Routine[]
    buttonText?: string
    dialogTitle?: string
  }>(),
  {
    routines: () => [],
    buttonText: 'Start defined routine',
    dialogTitle: 'Select routine',
  },
)

const emit = defineEmits<{
  (event: 'select', routine: Routine): void
}>()

const isOpen = ref(false)
const draftRoutineId = ref('')

const openDialog = () => {
  draftRoutineId.value = ''
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const applySelection = () => {
  if (!draftRoutineId.value) {
    return
  }

  const selectedRoutine = props.routines.find((routine) => routine.id === draftRoutineId.value)

  if (!selectedRoutine) {
    return
  }

  emit('select', selectedRoutine)
  closeDialog()
}
</script>
