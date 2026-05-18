<script setup lang="ts">
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('Active Workout')
import { useWorkoutStore } from '../stores/workoutStore'
import { useExerciseStore } from '../stores/exerciseStore'
import { onMounted } from 'vue'
import WorkoutStartPanel from './ActiveWorkoutPage/components/WorkoutStartPanel.vue'
import WorkoutTracker from './ActiveWorkoutPage/components/WorkoutTracker.vue'
import WorkoutTimer from './ActiveWorkoutPage/components/WorkoutTimer.vue'

const workoutStore = useWorkoutStore()
const exerciseStore = useExerciseStore()

onMounted(() => exerciseStore.fetch())
</script>

<template>
  <div class="min-h-screen bg-surface dark:bg-gray-900 flex flex-col">
    <!-- Header -->
    <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/10">
      <p class="font-bold text-lg text-text-primary dark:text-white flex-1">
        {{ workoutStore.activeWorkout ? workoutStore.activeWorkout.routineName ?? 'Workout' : 'Active Workout' }}
      </p>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
      <!-- No active workout: show start panel -->
      <WorkoutStartPanel v-if="!workoutStore.activeWorkout" />

      <!-- Active workout -->
      <template v-else>
        <WorkoutTimer />
        <WorkoutTracker />
      </template>
    </div>
  </div>
</template>
