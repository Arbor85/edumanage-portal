<script setup lang="ts">
import { computed } from 'vue'
import { useWorkoutStore } from '../../../stores/workoutStore'
import { useRouter } from 'vue-router'
import { Dumbbell, ChevronRight } from 'lucide-vue-next'

const store = useWorkoutStore()
const router = useRouter()
const recent = computed(() => store.history.slice(0, 5))

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="bg-white dark:bg-surface-card rounded-2xl border border-gray-100/80 dark:border-white/5 shadow-card p-4">
    <p class="text-sm font-bold text-text-primary dark:text-white mb-3 tracking-tight">Recent activity</p>
    <div v-if="!recent.length" class="text-sm text-text-secondary py-4 text-center">No workouts yet</div>
    <div v-else class="flex flex-col divide-y divide-gray-100 dark:divide-white/5">
      <div
        v-for="(w, i) in recent"
        :key="w.id ?? ''"
        class="stagger-item flex items-center gap-3 py-2.5 cursor-pointer hover:text-primary group transition-colors duration-150"
        :style="{ animationDelay: `${i * 50}ms` }"
        @click="router.push('/history')"
      >
        <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 flex-shrink-0 group-hover:bg-primary/15 transition-colors duration-150">
          <Dumbbell class="w-4 h-4 text-primary/70" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-text-primary dark:text-white truncate group-hover:text-primary transition-colors duration-150">{{ w.name ?? 'Workout' }}</p>
          <p class="text-xs text-text-secondary">{{ formatDate(w.completedAt) }}</p>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <span class="text-xs font-medium text-text-secondary tabular-nums">{{ w.excercises?.length ?? 0 }} ex</span>
          <ChevronRight class="w-3.5 h-3.5 text-text-secondary opacity-0 group-hover:opacity-60 transition-opacity duration-150" />
        </div>
      </div>
    </div>
  </div>
</template>
