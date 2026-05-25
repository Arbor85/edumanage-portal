<script setup lang="ts">
import { ref } from 'vue'
import { useWorkoutStore } from '../../../stores/workoutStore'
import { useExerciseStore } from '../../../stores/exerciseStore'
import SelectExercise from '../../../components/SelectExercise/index.vue'
import ExerciseSetupDialog from '../../../components/ExerciseSetupDialog.vue'

const store = useWorkoutStore()
const exerciseStore = useExerciseStore()

const selectedId = ref<number | null>(null)
const dialogOpen = ref(false)
const pendingExercise = ref<{ name: string; isBodyweight: boolean } | null>(null)

function onExerciseSelected(id: number | null) {
  if (id === null) return
  const ex = exerciseStore.exercises.find((e) => e.id === id)
  if (!ex) return
  pendingExercise.value = { name: ex.name ?? '', isBodyweight: ex.isBodyweight ?? false }
  dialogOpen.value = true
  selectedId.value = null
}

function onConfirm(sets: { reps: number | null; weight: number | null }[]) {
  if (!pendingExercise.value) return
  store.addAdHocExercise(pendingExercise.value, sets)
  pendingExercise.value = null
}

function onClose() {
  dialogOpen.value = false
  pendingExercise.value = null
}
</script>

<template>
  <SelectExercise :model-value="selectedId" label="Add Exercise" @update:model-value="onExerciseSelected" />

  <ExerciseSetupDialog
    :open="dialogOpen"
    :exercise-name="pendingExercise?.name ?? ''"
    :is-bodyweight="pendingExercise?.isBodyweight"
    @confirm="onConfirm"
    @close="onClose"
  />
</template>
