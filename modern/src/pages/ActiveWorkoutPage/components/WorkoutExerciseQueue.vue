<script setup lang="ts">
import { ref } from 'vue'
import { useWorkoutStore } from '../../../stores/workoutStore'
import { useExerciseStore } from '../../../stores/exerciseStore'
import BaseButton from '../../../components/BaseButton.vue'
import SelectExercise from '../../../components/SelectExercise/index.vue'

const store = useWorkoutStore()
const exerciseStore = useExerciseStore()
const addId = ref<number | null>(null)

function add() {
  const ex = exerciseStore.exercises.find((e) => e.id === addId.value)
  if (!ex) return
  store.addAdHocExercise({ name: ex.name ?? '', isBodyweight: false })
  addId.value = null
}
</script>

<template>
  <div class="flex gap-2 items-end mt-2">
    <div class="flex-1">
      <SelectExercise v-model="addId" label="Add Exercise" />
    </div>
    <BaseButton size="sm" variant="secondary" :disabled="addId === null" @click="add">Add</BaseButton>
  </div>
</template>
