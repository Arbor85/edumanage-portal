<script setup lang="ts">
import type { WorkoutHistoryOut } from '../../../types'
import BaseModal from '../../../components/BaseModal.vue'

defineProps<{ open: boolean; workout: WorkoutHistoryOut | null }>()
defineEmits<{ close: [] }>()

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

function formatDuration(s: number | null) {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${sec}s`
}
</script>

<template>
  <BaseModal :open="open" :title="workout?.name ?? 'Workout Detail'" size="md" @close="$emit('close')">
    <div v-if="workout" class="flex flex-col gap-4">
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
          <p class="text-xs text-text-secondary">Date</p>
          <p class="font-semibold text-text-primary dark:text-white text-sm mt-0.5">{{ formatDate(workout.completedAt) }}</p>
        </div>
        <div class="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
          <p class="text-xs text-text-secondary">Duration</p>
          <p class="font-semibold text-text-primary dark:text-white text-sm mt-0.5">{{ formatDuration(workout.durationSeconds) }}</p>
        </div>
      </div>

      <div>
        <p class="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Exercises</p>
        <div class="flex flex-col gap-2">
          <div
            v-for="(ex, i) in workout.excercises ?? []"
            :key="i"
            class="bg-gray-50 dark:bg-white/5 rounded-xl p-3"
          >
            <p class="font-medium text-sm text-text-primary dark:text-white">{{ ex.name }}</p>
            <div class="flex flex-wrap gap-2 mt-1">
              <span
                v-for="(set, j) in ex.sets ?? []"
                :key="j"
                class="text-xs bg-white dark:bg-white/10 rounded-lg px-2 py-0.5 text-text-secondary"
              >
                {{ set.reps ?? '?' }} reps<span v-if="set.weight"> · {{ set.weight }}kg</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
