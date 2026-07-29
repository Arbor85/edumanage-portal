<script setup lang="ts">
import type { HeatmapDay } from '../stores/progressStore'

const props = defineProps<{
  data: HeatmapDay[]
}>()

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Group 84 days into 12 columns (weeks), each with 7 rows (Mon–Sun)
const weeks = (() => {
  const cols: HeatmapDay[][] = []
  for (let i = 0; i < props.data.length; i += 7) {
    cols.push(props.data.slice(i, i + 7))
  }
  return cols
})()

function cellClass(intensity: 0 | 1 | 2 | 3): string {
  switch (intensity) {
    case 1: return 'bg-primary/25'
    case 2: return 'bg-primary/55'
    case 3: return 'bg-primary'
    default: return 'bg-white/5'
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div>
    <!-- Day labels -->
    <div class="flex gap-px mb-1.5 pl-0">
      <div class="flex flex-col gap-px mr-1">
        <div
          v-for="label in DAY_LABELS"
          :key="label"
          class="w-3 h-3 flex items-center justify-center text-[9px] font-bold text-text-muted"
        >{{ label }}</div>
      </div>

      <!-- Week columns -->
      <div class="flex gap-px flex-1 overflow-hidden">
        <div
          v-for="(week, wi) in weeks"
          :key="wi"
          class="flex flex-col gap-px flex-1"
        >
          <div
            v-for="(day, di) in week"
            :key="di"
            class="rounded-[2px] w-full aspect-square transition-colors"
            :class="cellClass(day.intensity)"
            :title="day.intensity > 0 ? formatDate(day.date) : ''"
          />
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-2 justify-end mt-2">
      <span class="text-[10px] text-text-muted">Less</span>
      <div class="w-3 h-3 rounded-[2px] bg-white/5" />
      <div class="w-3 h-3 rounded-[2px] bg-primary/25" />
      <div class="w-3 h-3 rounded-[2px] bg-primary/55" />
      <div class="w-3 h-3 rounded-[2px] bg-primary" />
      <span class="text-[10px] text-text-muted">More</span>
    </div>
  </div>
</template>
