<script setup lang="ts">
import type { CalorieResults, CalorieRange, PrimaryGoal } from '../../../../utils/calorieCalc'

const props = defineProps<{
  scenarios: CalorieResults['scenarios']
  tdeeRange: CalorieRange
  selectedGoal: PrimaryGoal
}>()

interface ScenarioRow {
  key: PrimaryGoal
  label: string
}

const rows: ScenarioRow[] = [
  { key: 'loss', label: 'Weight Loss' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'gain', label: 'Muscle Gain' },
  { key: 'recomp', label: 'Recomposition' },
]

function formatKcalRange(range: CalorieRange): string {
  return `${range.low.toLocaleString()} – ${range.high.toLocaleString()} kcal`
}

function formatVsTdee(range: CalorieRange): string {
  const low = range.low
  const high = range.high
  if (low === 0 && high === 0) return '±0 kcal'
  if (low < 0 && high <= 0) {
    return `−${Math.abs(high).toLocaleString()}–${Math.abs(low).toLocaleString()} kcal`
  }
  if (low >= 0 && high >= 0) {
    return `+${low.toLocaleString()}–${high.toLocaleString()} kcal`
  }
  return `${low.toLocaleString()} to ${high.toLocaleString()} kcal`
}

function formatWeeklyChange(range: CalorieRange): string {
  const low = Math.round(range.low * 100) / 100
  const high = Math.round(range.high * 100) / 100
  if (low === 0 && high === 0) return 'No change'
  if (Math.abs(low) < 0.12 && Math.abs(high) < 0.12) return `±0.1 kg`
  if (low < 0) {
    return `${low.toFixed(2)} to ${high.toFixed(2)} kg`
  }
  return `+${low.toFixed(2)} to +${high.toFixed(2)} kg`
}

function vsTdeeClass(key: PrimaryGoal): string {
  if (key === 'loss') return 'text-amber-500 dark:text-amber-400'
  if (key === 'gain') return 'text-blue-500 dark:text-blue-400'
  return 'text-text-muted'
}
</script>

<template>
  <div>
    <!-- Desktop table (md+) -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/8">
            <th class="text-left py-3 pr-4 text-xs font-bold tracking-widest uppercase text-text-muted">Goal</th>
            <th class="text-left py-3 pr-4 text-xs font-bold tracking-widest uppercase text-text-muted">Daily calories</th>
            <th class="text-left py-3 pr-4 text-xs font-bold tracking-widest uppercase text-text-muted">vs TDEE</th>
            <th class="text-left py-3 text-xs font-bold tracking-widest uppercase text-text-muted">Expected weekly change</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.key"
            class="border-b border-white/5 last:border-0 transition-colors"
            :class="selectedGoal === row.key ? 'bg-primary/5' : 'hover:bg-white/2'"
          >
            <td class="py-4 pr-4">
              <div class="flex items-center gap-2">
                <span
                  class="text-sm font-semibold"
                  :class="selectedGoal === row.key ? 'text-primary' : 'text-text-primary dark:text-white'"
                >
                  {{ row.label }}
                </span>
                <span
                  v-if="selectedGoal === row.key"
                  class="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold"
                >
                  Your goal
                </span>
              </div>
            </td>
            <td class="py-4 pr-4 font-semibold text-text-primary dark:text-white">
              {{ formatKcalRange(scenarios[row.key].kcalRange) }}
            </td>
            <td class="py-4 pr-4 font-semibold" :class="vsTdeeClass(row.key)">
              {{ formatVsTdee(scenarios[row.key].deficitOrSurplusRange) }}
            </td>
            <td class="py-4 text-text-secondary">
              {{ formatWeeklyChange(scenarios[row.key].weeklyWeightChangeRange) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile card list (< md) -->
    <div class="md:hidden space-y-3">
      <div
        v-for="row in rows"
        :key="row.key"
        class="rounded-xl border p-4 transition-colors"
        :class="
          selectedGoal === row.key
            ? 'bg-primary/5 border-primary/30'
            : 'bg-surface-input border-white/8'
        "
      >
        <div class="flex items-center justify-between mb-3">
          <span
            class="text-sm font-bold"
            :class="selectedGoal === row.key ? 'text-primary' : 'text-text-primary dark:text-white'"
          >
            {{ row.label }}
          </span>
          <span
            v-if="selectedGoal === row.key"
            class="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold"
          >
            Your goal
          </span>
        </div>
        <div class="grid grid-cols-1 gap-2 text-sm">
          <div class="flex justify-between">
            <span class="text-text-muted text-xs font-semibold uppercase tracking-wide">Daily calories</span>
            <span class="font-semibold text-text-primary dark:text-white">{{ formatKcalRange(scenarios[row.key].kcalRange) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-muted text-xs font-semibold uppercase tracking-wide">vs TDEE</span>
            <span class="font-semibold" :class="vsTdeeClass(row.key)">{{ formatVsTdee(scenarios[row.key].deficitOrSurplusRange) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-muted text-xs font-semibold uppercase tracking-wide">Weekly change</span>
            <span class="text-text-secondary">{{ formatWeeklyChange(scenarios[row.key].weeklyWeightChangeRange) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
