<script setup lang="ts">
import type { ActiveExercise } from '../../../types'
import BaseButton from '../../../components/BaseButton.vue'
import SetTimerRow from './SetTimerRow.vue'
import { useWorkoutStore } from '../../../stores/workoutStore'
import { Check } from 'lucide-vue-next'

const props = defineProps<{ exercise: ActiveExercise; isCurrent: boolean }>()
const store = useWorkoutStore()

const isTimeBased = () => props.exercise.activityTrackType === 'time'

function onSetComplete(actualDuration: number | null) {
  store.completeSet(null, null, undefined, actualDuration)
}

function fmtDistance(m: number | null) {
  if (m === null) return '—'
  return m >= 1000 ? `${(m / 1000).toFixed(2)}km` : `${m}m`
}
</script>

<template>
  <div
    class="rounded-2xl border p-4 flex flex-col gap-3 transition-all"
    :class="isCurrent ? 'border-primary bg-primary-light dark:bg-primary/10' : 'border-gray-100 dark:border-white/10 bg-white dark:bg-surface-dark opacity-60'"
  >
    <div class="flex items-center gap-2">
      <p class="font-semibold text-text-primary dark:text-white flex-1">{{ exercise.name }}</p>
      <BaseButton v-if="isCurrent" size="sm" variant="ghost" @click="store.skipExercise()">Skip</BaseButton>
    </div>

    <div class="flex flex-col gap-1.5">
      <!-- Time-based exercise: use timer row for each set -->
      <template v-if="isTimeBased()">
        <SetTimerRow
          v-for="(set, i) in exercise.sets"
          :key="i"
          :set-index="i"
          :duration="set.duration"
          :completed="set.completed"
          :is-current="isCurrent && i === exercise.currentSetIndex"
          @complete="onSetComplete"
        />
      </template>

      <!-- All other track types: standard rows -->
      <template v-else>
        <div
          v-for="(set, i) in exercise.sets"
          :key="i"
          class="flex items-center gap-3 text-sm p-2 rounded-xl"
          :class="[
            set.completed ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 line-through' : '',
            isCurrent && i === exercise.currentSetIndex ? 'ring-1 ring-primary' : '',
          ]"
        >
          <span class="w-5 text-center font-medium text-text-secondary">{{ i + 1 }}</span>
          <span class="flex-1">
            <template v-if="exercise.activityTrackType === 'distance'">
              {{ fmtDistance(set.distance) }}
            </template>
            <template v-else>
              {{ set.reps ?? '—' }} reps
              <span v-if="set.weight"> · {{ set.weight }}kg</span>
            </template>
          </span>
          <BaseButton
            v-if="isCurrent && !set.completed && i === exercise.currentSetIndex"
            size="sm"
            variant="primary"
            @click="store.completeSet()"
          ><Check class="w-4 h-4" /> Done</BaseButton>
          <span v-else-if="set.completed" class="text-xs"><Check class="w-3.5 h-3.5 inline" /></span>
        </div>
      </template>
    </div>
  </div>
</template>
