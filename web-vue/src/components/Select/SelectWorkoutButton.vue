<template>
  <div>
    <button
      type="button"
      @click="openDialog"
      :disabled="workouts.length === 0"
      class="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
    >
      {{ buttonText }}
    </button>

    <FormDialog :open="isOpen" :title="dialogTitle" save-label="Select workout" :save-disabled="!draftWorkoutId" max-width-class="max-w-2xl" @cancel="closeDialog" @submit="applySelection">
      <SelectWorkout
        v-model="draftWorkoutId"
        :workouts="workouts"
        label="Select workout"
      />
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormDialog from '../FormDialog.vue'
import SelectWorkout from './SelectWorkout.vue'
import type { Workout } from '../../types/workout'

const props = withDefaults(
  defineProps<{
    workouts?: Workout[]
    buttonText?: string
    dialogTitle?: string
  }>(),
  {
    workouts: () => [],
    buttonText: 'Start defined workout',
    dialogTitle: 'Select workout',
  },
)

const emit = defineEmits<{
  (event: 'select', workout: Workout): void
}>()

const isOpen = ref(false)
const draftWorkoutId = ref('')

const openDialog = () => {
  draftWorkoutId.value = ''
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const applySelection = () => {
  if (!draftWorkoutId.value) {
    return
  }

  const selectedWorkout = props.workouts.find((workout) => workout.id === draftWorkoutId.value)

  if (!selectedWorkout) {
    return
  }

  emit('select', selectedWorkout)
  closeDialog()
}
</script>
