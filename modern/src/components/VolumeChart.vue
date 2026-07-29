<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import type { ChartOptions } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps<{
  data: { label: string; sets: number }[]
}>()

const chartData = computed(() => ({
  labels: props.data.map((d) => d.label),
  datasets: [
    {
      data: props.data.map((d) => d.sets),
      backgroundColor: 'rgba(0, 200, 150, 0.1)',
      borderColor: '#00C896',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#00C896',
      pointBorderColor: '#0D0F12',
      pointBorderWidth: 2,
    },
  ],
}))

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 800 },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1C2030',
      titleColor: '#8B92A5',
      bodyColor: '#FFFFFF',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 10,
      callbacks: {
        label: (ctx) => ` ${ctx.parsed.y} sets`,
      },
    },
  },
  scales: {
    x: {
      border: { display: false },
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#4A5168', font: { size: 11 } },
    },
    y: {
      min: 0,
      border: { display: false },
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#4A5168', font: { size: 11 }, precision: 0 },
    },
  },
}
</script>

<template>
  <div class="h-44">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
