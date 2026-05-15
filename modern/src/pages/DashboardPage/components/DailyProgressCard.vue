<script setup lang="ts">
import { computed } from 'vue'
import { useWorkoutStore } from '../../../stores/workoutStore'
import ProgressRing from '../../../components/ProgressRing.vue'

const store = useWorkoutStore()
const GOAL = 5 // workouts per week

const thisWeek = computed(() => {
  const start = new Date()
  start.setDate(start.getDate() - start.getDay())
  start.setHours(0, 0, 0, 0)
  return store.history.filter((w) => w.completedAt && new Date(w.completedAt) >= start).length
})

const percent = computed(() => Math.min(100, Math.round((thisWeek.value / GOAL) * 100)))
</script>

<template>
  <div class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-4 flex flex-col items-center gap-3">
    <p class="text-sm font-semibold text-text-primary dark:text-white self-start">Weekly Progress</p>
    <ProgressRing :percent="percent" :size="120" :label="`${thisWeek}/${GOAL}`" />
    <p class="text-xs text-text-secondary">workouts this week</p>
  </div>
</template>
