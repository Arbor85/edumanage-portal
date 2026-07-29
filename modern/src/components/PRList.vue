<script setup lang="ts">
import { Zap } from 'lucide-vue-next'
import type { PR } from '../stores/progressStore'

defineProps<{
  records: PR[]
}>()

function fmtValue(pr: PR): string {
  if (pr.activityTrackType === 'repetitions') {
    if (pr.bestWeight && pr.bestWeight > 0) {
      return `${pr.bestWeight}kg × ${pr.bestReps ?? '?'} reps`
    }
    return `${pr.bestReps ?? '?'} reps`
  }
  if (pr.activityTrackType === 'time') {
    const s = pr.bestDuration ?? 0
    if (s >= 60) return `${Math.floor(s / 60)}m ${s % 60}s`
    return `${s}s`
  }
  if (pr.activityTrackType === 'distance') {
    const m = pr.bestDistance ?? 0
    return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m} m`
  }
  return '—'
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div>
    <!-- Empty state -->
    <div v-if="records.length === 0" class="text-center py-16">
      <Zap class="w-10 h-10 text-text-muted mx-auto mb-3" />
      <p class="text-lg font-bold text-white mb-1">No records yet</p>
      <p class="text-sm text-text-secondary">Complete workouts to set your first PRs.</p>
    </div>

    <!-- Records list -->
    <div v-else class="flex flex-col gap-2">
      <div
        v-for="pr in records"
        :key="pr.exerciseName"
        class="flex items-center gap-4 rounded-2xl bg-surface-card border border-white/5 p-4
               hover:border-white/10 transition-all"
      >
        <!-- Icon -->
        <div class="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Zap class="w-4 h-4 text-accent" />
        </div>

        <!-- Name + value -->
        <div class="flex-1 min-w-0">
          <p class="font-bold text-white truncate">{{ pr.exerciseName }}</p>
          <p class="text-sm text-text-secondary mt-0.5">{{ fmtValue(pr) }}</p>
        </div>

        <!-- Date -->
        <p class="text-xs text-text-muted flex-shrink-0">{{ fmtDate(pr.achievedAt) }}</p>
      </div>
    </div>
  </div>
</template>
