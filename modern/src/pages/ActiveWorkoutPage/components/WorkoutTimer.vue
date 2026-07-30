<script setup lang="ts">
import { useWorkoutStore } from '../../../stores/workoutStore'
import { computed } from 'vue'
import BaseButton from '../../../components/BaseButton.vue'
import CountdownTimer from '../../../components/CountdownTimer.vue'

const store = useWorkoutStore()

const currentEx = computed(() => {
  const aw = store.activeWorkout
  if (!aw) return null
  const step = aw.steps[aw.currentStepIndex]
  if (!step) return null
  const exIdx = step.type === 'normal-set' || step.type === 'drop-set'
    ? step.exerciseIndex
    : step.type === 'superset-round' ? step.items[0]?.exerciseIndex ?? 0 : 0
  return aw.exercises[exIdx] ?? null
})
const currentSet = computed(() => {
  const aw = store.activeWorkout
  if (!aw || !currentEx.value) return null
  const step = aw.steps[aw.currentStepIndex]
  if (!step) return null
  const setIdx = step.type === 'normal-set' || step.type === 'drop-set' ? step.setIndex : 0
  return currentEx.value.sets[setIdx] ?? null
})
</script>

<template>
  <div class="flex flex-col items-center gap-2 py-4">
    <div v-if="store.isResting" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div class="text-center">
        <p class="text-white text-2xl font-bold mb-4">Rest</p>
        <CountdownTimer :seconds="store.restSecondsLeft ?? 0" :auto-start="true" class="text-white" @finish="store.skipRest()" />
        <BaseButton class="mt-6" variant="primary" @click="store.skipRest()">Skip Rest</BaseButton>
      </div>
    </div>

    <p v-if="currentEx" class="text-xl font-bold text-text-primary dark:text-white">{{ currentEx.name }}</p>
    <p v-if="currentSet" class="text-text-secondary text-sm">
      Set {{ (store.activeWorkout?.currentStepIndex ?? 0) + 1 }} of {{ currentEx?.sets.length }}
      · {{ currentSet.reps ?? '?' }} reps
      <span v-if="currentSet.weight"> · {{ currentSet.weight }}kg</span>
    </p>
  </div>
</template>
