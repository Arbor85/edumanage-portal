<script setup lang="ts">
import { computed } from 'vue'
import { useWorkoutStore } from '../../../stores/workoutStore'
import { useRouter } from 'vue-router'

const store = useWorkoutStore()
const router = useRouter()
const recent = computed(() => store.history.slice(0, 5))

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-4">
    <p class="text-sm font-semibold text-text-primary dark:text-white mb-3">Recent Activity</p>
    <div v-if="!recent.length" class="text-sm text-text-secondary py-4 text-center">No workouts yet</div>
    <div v-else class="flex flex-col divide-y divide-gray-100 dark:divide-white/5">
      <div
        v-for="w in recent"
        :key="w.id ?? ''"
        class="flex items-center gap-3 py-2.5 cursor-pointer hover:text-primary transition-colors"
        @click="router.push('/history')"
      >
        <span class="text-xl">🏋️</span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-text-primary dark:text-white truncate">{{ w.name ?? 'Workout' }}</p>
          <p class="text-xs text-text-secondary">{{ formatDate(w.completedAt) }}</p>
        </div>
        <span class="text-xs text-text-secondary">{{ w.excercises?.length ?? 0 }} ex</span>
      </div>
    </div>
  </div>
</template>
