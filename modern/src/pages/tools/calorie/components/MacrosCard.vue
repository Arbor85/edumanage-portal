<script setup lang="ts">
import type { CalorieResults, PrimaryGoal } from '../../../../utils/calorieCalc'

const props = defineProps<{
  macros: CalorieResults['macros']
  goal: PrimaryGoal
}>()

interface MacroRow {
  label: string
  range: { low: number; high: number }
  color: string
  bgColor: string
  unit: string
}

const macroRows: MacroRow[] = [
  {
    label: 'Protein',
    range: props.macros.proteinGRange,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-500/20',
    unit: 'g/day',
  },
  {
    label: 'Fat',
    range: props.macros.fatGRange,
    color: 'bg-amber-500',
    bgColor: 'bg-amber-500/20',
    unit: 'g/day',
  },
  {
    label: 'Carbohydrates',
    range: props.macros.carbGRange,
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-500/20',
    unit: 'g/day',
  },
]

// Estimate total grams for proportional bar widths
const totalMid =
  (props.macros.proteinGRange.low + props.macros.proteinGRange.high) / 2 * 4 +
  (props.macros.fatGRange.low + props.macros.fatGRange.high) / 2 * 9 +
  (props.macros.carbGRange.low + props.macros.carbGRange.high) / 2 * 4

function macroCalKcal(row: MacroRow): number {
  const midG = (row.range.low + row.range.high) / 2
  if (row.label === 'Fat') return midG * 9
  return midG * 4
}

function barWidth(row: MacroRow): string {
  if (totalMid === 0) return '33%'
  return `${Math.round((macroCalKcal(row) / totalMid) * 100)}%`
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="macro in macroRows"
      :key="macro.label"
      class="space-y-2"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold text-text-primary dark:text-white">{{ macro.label }}</span>
        <span class="text-sm font-semibold text-text-secondary">
          {{ macro.range.low }}–{{ macro.range.high }} {{ macro.unit }}
        </span>
      </div>
      <!-- Proportional bar -->
      <div class="w-full h-2 rounded-full" :class="macro.bgColor">
        <div
          class="h-full rounded-full transition-all"
          :class="macro.color"
          :style="{ width: barWidth(macro) }"
        />
      </div>
    </div>

    <!-- Note -->
    <p v-if="goal === 'loss'" class="text-xs text-text-muted mt-4 leading-relaxed">
      Prioritise protein to preserve muscle mass during a calorie deficit. Aim for the upper end of the range on training days.
    </p>
    <p v-else-if="goal === 'gain'" class="text-xs text-text-muted mt-4 leading-relaxed">
      Adequate protein is essential for muscle protein synthesis. Distribute intake evenly across meals for optimal results.
    </p>
    <p v-else class="text-xs text-text-muted mt-4 leading-relaxed">
      These ranges are starting estimates. Adjust based on satiety, energy levels, and performance over time.
    </p>
  </div>
</template>
