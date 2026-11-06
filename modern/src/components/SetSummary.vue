<script setup lang="ts">
import { computed } from 'vue'
import type { RoutineSet, ActivityTrackType, ActivityType } from '../types'
import { useWeightUnit } from '../composables/useWeightUnit'
import { formatSetDuration, formatSetDistance } from '../composables/useSetCalculations'

const props = defineProps<{
  set: RoutineSet
  activityType?: ActivityType
  activityTrackType?: ActivityTrackType
}>()

const emit = defineEmits<{ click: [] }>()

const { toDisplay, unit } = useWeightUnit()

const trackType = computed(() => props.activityTrackType ?? 'repetitions')
const showWeight = computed(() =>
  (props.activityType === 'weighted' || props.activityType === 'machine' || props.activityType == null)
  && trackType.value === 'repetitions'
)

const label = computed(() => {
  if (trackType.value === 'repetitions') {
    const reps = props.set.reps
    const weight = props.set.weight
    if (reps == null && weight == null) return '—'
    if (showWeight.value && weight != null && reps != null) {
      const w = toDisplay(weight)
      return `${reps}×${w % 1 === 0 ? w : w.toFixed(2)}${unit.value}`
    }
    if (reps != null) return `${reps} reps`
    return '—'
  }
  if (trackType.value === 'time') {
    return props.set.duration != null ? formatSetDuration(props.set.duration) : '—'
  }
  if (trackType.value === 'distance') {
    return props.set.distance != null ? formatSetDistance(props.set.distance) : '—'
  }
  return '—'
})
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-sm font-semibold text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all min-h-[36px] focus-visible:ring-2 focus-visible:ring-primary"
    @click="emit('click')"
  >
    {{ label }}
  </button>
</template>
