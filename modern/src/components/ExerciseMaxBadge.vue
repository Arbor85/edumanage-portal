<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGymProfileStore } from '../stores/gymProfileStore'

const props = defineProps<{ exerciseId: number | null | undefined }>()

const store = useGymProfileStore()
const tooltipVisible = ref(false)

const max = computed(() =>
  props.exerciseId != null ? store.getByExerciseId(props.exerciseId) : undefined,
)

function formatValue(m: NonNullable<typeof max.value>): string {
  if (m.activityTrackType === 'repetitions') {
    if (m.maxWeight != null && m.maxReps != null) return `${m.maxWeight} kg × ${m.maxReps}`
    if (m.maxReps != null) return `${m.maxReps} reps`
  }
  if (m.activityTrackType === 'time' && m.maxDuration != null) {
    const mins = Math.floor(m.maxDuration / 60)
    const secs = Math.floor(m.maxDuration % 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }
  if (m.activityTrackType === 'distance' && m.maxDistance != null) {
    return m.maxDistance >= 1000
      ? `${(m.maxDistance / 1000).toFixed(1)} km`
      : `${m.maxDistance} m`
  }
  return ''
}

function epley1rm(weight: number, reps: number): number {
  return weight * (1 + reps / 30)
}

const label = computed(() => {
  if (!max.value) return ''
  const v = formatValue(max.value)
  return v ? `PR: ${v}` : ''
})

const tooltip = computed(() => {
  if (!max.value) return null
  const m = max.value
  const lines: string[] = []
  lines.push(formatValue(m))
  if (m.activityTrackType === 'repetitions' && m.maxWeight != null && m.maxReps != null) {
    lines.push(`~${Math.round(epley1rm(m.maxWeight, m.maxReps))} kg 1RM`)
  }
  if (m.note) lines.push(m.note)
  const d = new Date(m.updatedAt)
  lines.push(`Updated: ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`)
  return lines
})
</script>

<template>
  <span
    v-if="max && label"
    class="relative inline-flex items-center"
    @mouseenter="tooltipVisible = true"
    @mouseleave="tooltipVisible = false"
    @click.stop="tooltipVisible = !tooltipVisible"
  >
    <span class="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 select-none cursor-default">
      {{ label }}
    </span>

    <Transition name="tooltip">
      <div
        v-if="tooltipVisible && tooltip"
        class="absolute bottom-full left-0 mb-1.5 z-50 w-max max-w-[200px] rounded-xl bg-gray-900 dark:bg-gray-800 text-white text-xs px-3 py-2 shadow-xl pointer-events-none"
      >
        <p v-for="(line, i) in tooltip" :key="i" :class="i === 0 ? 'font-semibold' : 'text-white/70 mt-0.5'">{{ line }}</p>
      </div>
    </Transition>
  </span>
</template>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 120ms ease, transform 120ms ease;
}
.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
