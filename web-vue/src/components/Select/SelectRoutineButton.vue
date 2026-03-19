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

    <FormDialog :open="isOpen" :title="dialogTitle" save-label="Select routine" :save-disabled="!draftRoutineId" max-width-class="max-w-2xl" @cancel="closeDialog" @submit="applySelection">
      <SelectRoutine
        v-model="draftRoutineId"
        :routines="routines"
        label="Select routine"
      />
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormDialog from '../FormDialog.vue'
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
