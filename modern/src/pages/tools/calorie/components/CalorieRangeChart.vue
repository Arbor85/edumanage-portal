<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import type { CalorieResults, CalorieRange } from '../../../../utils/calorieCalc'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps<{
  scenarios: CalorieResults['scenarios']
  tdeeRange: CalorieRange
}>()

const chartData = computed<ChartData<'bar'>>(() => ({
  labels: ['Weight Loss', 'Maintenance', 'Muscle Gain', 'Recomposition'],
  datasets: [
    {
      label: 'Calorie Range',
      data: [
        [props.scenarios.loss.kcalRange.low, props.scenarios.loss.kcalRange.high],
        [props.scenarios.maintenance.kcalRange.low, props.scenarios.maintenance.kcalRange.high],
        [props.scenarios.gain.kcalRange.low, props.scenarios.gain.kcalRange.high],
        [props.scenarios.recomp.kcalRange.low, props.scenarios.recomp.kcalRange.high],
      ] as [number, number][],
      backgroundColor: [
        'rgba(245, 158, 11, 0.6)',
        'rgba(34, 197, 94, 0.6)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(168, 85, 247, 0.6)',
      ],
      borderColor: [
        'rgba(245, 158, 11, 0.9)',
        'rgba(34, 197, 94, 0.9)',
        'rgba(59, 130, 246, 0.9)',
        'rgba(168, 85, 247, 0.9)',
      ],
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => {
          const raw = context.raw as [number, number]
          return ` ${raw[0].toLocaleString()} – ${raw[1].toLocaleString()} kcal`
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.06)' },
      ticks: {
        color: 'rgba(156, 163, 175, 0.8)',
        font: { size: 11 },
        callback: (value) => `${Number(value).toLocaleString()}`,
      },
    },
    y: {
      grid: { display: false },
      ticks: {
        color: 'rgba(156, 163, 175, 0.8)',
        font: { size: 12, weight: '600' as const },
      },
    },
  },
}))
</script>

<template>
  <div class="h-48">
    <Bar :data="chartData" :options="chartOptions" class="w-full h-full" />
  </div>
</template>
