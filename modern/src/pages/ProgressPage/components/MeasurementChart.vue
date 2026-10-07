<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { BodyMeasurementOut } from '../../../types'
import {
  Chart, LineController, LineElement, PointElement, LinearScale,
  CategoryScale, Tooltip, Legend,
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

const props = defineProps<{ measurements: BodyMeasurementOut[] }>()

interface MetricDef {
  key: keyof BodyMeasurementOut
  label: string
  unit: string
  color: string
}

const METRICS: MetricDef[] = [
  { key: 'weightKg',      label: 'Weight',    unit: 'kg',   color: '#6c63ff' },
  { key: 'waistCm',       label: 'Waist',     unit: 'cm',   color: '#0891b2' },
  { key: 'thighCm',       label: 'Thigh',     unit: 'cm',   color: '#16a34a' },
  { key: 'bicepCm',       label: 'Bicep',     unit: 'cm',   color: '#d97706' },
  { key: 'chestCm',       label: 'Chest',     unit: 'cm',   color: '#dc2626' },
  { key: 'buttCm',        label: 'Butt',      unit: 'cm',   color: '#db2777' },
  { key: 'systolicMmHg',  label: 'Systolic',  unit: 'mmHg', color: '#7c3aed' },
  { key: 'diastolicMmHg', label: 'Diastolic', unit: 'mmHg', color: '#2563eb' },
]

const availableMetrics = computed(() =>
  METRICS.filter(m => props.measurements.some(e => e[m.key] != null))
)

const active = ref<Set<string>>(new Set())

watch(availableMetrics, (metrics) => {
  metrics.forEach(m => active.value.add(m.key as string))
}, { immediate: true })

function toggle(key: string) {
  if (active.value.has(key)) active.value.delete(key)
  else active.value.add(key)
  buildChart()
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const sorted = computed(() =>
  [...props.measurements].sort((a, b) => a.date.localeCompare(b.date))
)

const labels = computed(() => sorted.value.map(m => {
  const d = new Date(m.date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}))

function buildChart() {
  if (!canvasRef.value) return
  if (chart) chart.destroy()

  const activeMetrics = METRICS.filter(m => active.value.has(m.key as string))
  const scales: Record<string, object> = {
    x: {
      ticks: { color: '#888', font: { size: 10 } },
      grid: { color: '#ffffff08' },
    },
  }

  activeMetrics.forEach((m, i) => {
    const pos = i % 2 === 0 ? 'left' : 'right'
    scales[`y_${m.key}`] = {
      type: 'linear',
      position: pos,
      ticks: { color: m.color, font: { size: 10 }, maxTicksLimit: 5 },
      grid: { color: i === 0 ? '#ffffff08' : 'transparent' },
      title: { display: false },
    }
  })

  const datasets = activeMetrics.map(m => ({
    label: `${m.label} (${m.unit})`,
    yAxisID: `y_${m.key}`,
    data: sorted.value.map(e => e[m.key] as number | null),
    borderColor: m.color,
    backgroundColor: m.color + '22',
    pointBackgroundColor: m.color,
    pointRadius: 4,
    pointHoverRadius: 6,
    tension: 0.3,
    spanGaps: false,
  }))

  chart = new Chart(canvasRef.value, {
    type: 'line',
    data: { labels: labels.value, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e1e2e',
          borderColor: '#ffffff15',
          borderWidth: 1,
          titleColor: '#ccc',
          bodyColor: '#aaa',
        },
      },
      scales,
    },
  })
}

watch([sorted, active], buildChart, { deep: true })
onMounted(buildChart)
onUnmounted(() => chart?.destroy())
</script>

<template>
  <div class="bg-surface-card border border-white/5 rounded-2xl p-5">
    <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-3">Trend</p>

    <!-- Metric toggles -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button
        v-for="m in availableMetrics"
        :key="m.key"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border"
        :style="active.has(m.key as string)
          ? { borderColor: m.color, background: m.color + '22', color: m.color }
          : { borderColor: '#ffffff15', background: 'transparent', color: '#666' }"
        @click="toggle(m.key as string)"
      >
        <span class="w-2 h-2 rounded-full" :style="{ background: active.has(m.key as string) ? m.color : '#444' }" />
        {{ m.label }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="availableMetrics.length === 0" class="flex items-center justify-center h-40 text-text-muted text-sm">
      Log your first measurement to see a chart.
    </div>

    <div v-else class="relative h-52">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>
