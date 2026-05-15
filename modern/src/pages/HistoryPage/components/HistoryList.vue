<script setup lang="ts">
import type { WorkoutHistoryOut } from '../../../types'
import BaseButton from '../../../components/BaseButton.vue'
import EmptyState from '../../../components/EmptyState.vue'
import BaseBadge from '../../../components/BaseBadge.vue'

const props = defineProps<{ history: WorkoutHistoryOut[] }>()
const emit = defineEmits<{ view: [w: WorkoutHistoryOut] }>()

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatDuration(s: number | null) {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  return `${m} min`
}
</script>

<template>
  <div>
    <EmptyState v-if="!history.length" icon="📜" title="No workouts yet" description="Complete your first workout to see history." />
    <div v-else class="flex flex-col gap-3 custom-scrollbar">
      <div
        v-for="w in history"
        :key="w.id ?? ''"
        class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-4 flex items-center gap-4 cursor-pointer hover:border-primary transition-colors"
        @click="emit('view', w)"
      >
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-text-primary dark:text-white">{{ w.name ?? 'Workout' }}</p>
          <p class="text-xs text-text-secondary mt-0.5">{{ formatDate(w.completedAt) }} · {{ formatDuration(w.durationSeconds) }}</p>
        </div>
        <BaseBadge :label="`${w.excercises?.length ?? 0} ex`" />
        <BaseButton size="sm" variant="ghost" @click.stop="emit('view', w)">View</BaseButton>
      </div>
    </div>
  </div>
</template>
