<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronDown, ChevronUp, Trash2, Activity, Zap, Clock, Gauge } from '@lucide/vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import {
  calculateMetrics,
  generateInterpretation,
  saveToHistory,
  loadHistory,
  deleteFromHistory,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ORDER,
  type Sex,
  type HistoryEntry,
} from '../../composables/useCooperTest'

const router = useRouter()

// ── Form state ────────────────────────────────────────────────────────────────
const age      = ref<number | null>(null)
const sex      = ref<Sex>('male')
const distance = ref<number | null>(null)
const testDate = ref(new Date().toISOString().slice(0, 10))
const showOptional = ref(false)

// ── Results state ─────────────────────────────────────────────────────────────
const view    = ref<'form' | 'results'>('form')
const metrics = ref<ReturnType<typeof calculateMetrics>>(null)
const interp  = ref<ReturnType<typeof generateInterpretation> | null>(null)
const history = ref<HistoryEntry[]>(loadHistory())

// ── Validation ────────────────────────────────────────────────────────────────
const errors = ref<{ age?: string; distance?: string }>({})

function validate(): boolean {
  errors.value = {}
  if (!age.value || !Number.isInteger(age.value) || age.value < 1) {
    errors.value.age = 'Enter a valid age (positive integer).'
  }
  if (!distance.value || distance.value <= 0) {
    errors.value.distance = 'Enter a valid distance in meters.'
  }
  return Object.keys(errors.value).length === 0
}

function calculate() {
  if (!validate()) return
  const result = calculateMetrics(distance.value!, age.value!, sex.value)
  if (!result) {
    errors.value.age = 'No reference data available for this age group (supported: 13+).'
    return
  }
  metrics.value = result
  interp.value  = generateInterpretation(result, sex.value)
  view.value    = 'results'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function saveResult() {
  if (!metrics.value) return
  saveToHistory({
    date:     testDate.value,
    age:      age.value!,
    sex:      sex.value,
    distance: metrics.value.distance,
    category: metrics.value.category,
    vo2max:   metrics.value.vo2max,
    pace:     metrics.value.pace,
    speed:    metrics.value.speed,
  })
  history.value = loadHistory()
}

function removeEntry(id: string) {
  deleteFromHistory(id)
  history.value = loadHistory()
}

function reset() {
  view.value    = 'form'
  metrics.value = null
  interp.value  = null
}

// ── Progress bar ──────────────────────────────────────────────────────────────
const segments = CATEGORY_ORDER.map((cat) => ({
  cat,
  label: CATEGORY_LABELS[cat],
  color: CATEGORY_COLORS[cat],
}))

// ── History chart ─────────────────────────────────────────────────────────────
const CHART_W = 400
const CHART_H = 120
const PADDING = { top: 10, right: 10, bottom: 20, left: 36 }

const chartPoints = computed(() => {
  const entries = [...history.value].reverse()
  if (entries.length < 2) return null
  const distances = entries.map(e => e.distance)
  const minD = Math.min(...distances)
  const maxD = Math.max(...distances)
  const rangeD = maxD - minD || 1
  const innerW = CHART_W - PADDING.left - PADDING.right
  const innerH = CHART_H - PADDING.top - PADDING.bottom

  const pts = entries.map((e, i) => ({
    x: PADDING.left + (i / (entries.length - 1)) * innerW,
    y: PADDING.top  + (1 - (e.distance - minD) / rangeD) * innerH,
    entry: e,
  }))

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const area = [
    `${pts[0].x},${CHART_H - PADDING.bottom}`,
    ...pts.map(p => `${p.x},${p.y}`),
    `${pts[pts.length - 1].x},${CHART_H - PADDING.bottom}`,
  ].join(' ')

  return { pts, polyline, area, minD, maxD }
})

const categoryColor = computed(() =>
  metrics.value ? CATEGORY_COLORS[metrics.value.category] : '#22c55e'
)
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto pb-16">

      <!-- Header -->
      <div class="pt-2 pb-6 flex items-center gap-3">
        <button
          class="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          @click="view === 'results' ? reset() : router.push('/tools')"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted">Tools</p>
          <h1 class="text-2xl font-black text-text-primary dark:text-white">Cooper 12-Min Test</h1>
        </div>
      </div>

      <!-- ── FORM VIEW ──────────────────────────────────────────────────── -->
      <template v-if="view === 'form'">
        <div class="bg-surface-card border border-white/8 rounded-2xl p-6 space-y-5">

          <!-- Sex toggle -->
          <div>
            <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Sex (for reference norms)</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="s in (['male', 'female'] as Sex[])"
                :key="s"
                type="button"
                class="py-2.5 rounded-xl text-sm font-semibold border transition-all"
                :class="sex === s
                  ? 'bg-primary text-white border-primary'
                  : 'border-white/10 text-text-secondary hover:border-primary/40 hover:text-text-primary dark:hover:text-white'"
                @click="sex = s"
              >
                {{ s === 'male' ? 'Male' : 'Female' }}
              </button>
            </div>
          </div>

          <!-- Age -->
          <div>
            <label class="block text-sm font-semibold text-text-primary dark:text-white mb-1.5">Age (years)</label>
            <input
              v-model.number="age"
              type="number"
              min="1"
              max="120"
              placeholder="e.g. 28"
              class="w-full px-3 py-2.5 rounded-xl border text-sm bg-white dark:bg-surface-input text-text-primary dark:text-white placeholder:text-text-muted outline-none
                transition-[border-color,box-shadow] duration-150
                hover:border-gray-300 dark:hover:border-white/20
                focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary
                border-gray-200 dark:border-white/10"
            />
            <p v-if="errors.age" class="mt-1 text-xs text-red-500">{{ errors.age }}</p>
          </div>

          <!-- Distance -->
          <div>
            <label class="block text-sm font-semibold text-text-primary dark:text-white mb-1.5">Distance covered (meters)</label>
            <input
              v-model.number="distance"
              type="number"
              min="1"
              placeholder="e.g. 2400"
              class="w-full px-3 py-2.5 rounded-xl border text-sm bg-white dark:bg-surface-input text-text-primary dark:text-white placeholder:text-text-muted outline-none
                transition-[border-color,box-shadow] duration-150
                hover:border-gray-300 dark:hover:border-white/20
                focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary
                border-gray-200 dark:border-white/10"
            />
            <p v-if="errors.distance" class="mt-1 text-xs text-red-500">{{ errors.distance }}</p>
          </div>

          <!-- Optional fields toggle -->
          <div>
            <button
              type="button"
              class="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary dark:hover:text-white transition-colors"
              @click="showOptional = !showOptional"
            >
              <component :is="showOptional ? ChevronUp : ChevronDown" class="w-4 h-4" />
              Optional fields
            </button>

            <div v-if="showOptional" class="mt-4 space-y-4 pl-1">
              <div>
                <label class="block text-sm font-semibold text-text-primary dark:text-white mb-1.5">Test date</label>
                <input
                  v-model="testDate"
                  type="date"
                  class="w-full px-3 py-2.5 rounded-xl border text-sm bg-white dark:bg-surface-input text-text-primary dark:text-white outline-none
                    transition-[border-color,box-shadow] duration-150
                    focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary
                    border-gray-200 dark:border-white/10"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            class="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
            @click="calculate"
          >
            Calculate
          </button>
        </div>

        <!-- History section (shown below form if any) -->
        <template v-if="history.length">
          <div class="mt-8">
            <h2 class="text-lg font-bold text-text-primary dark:text-white mb-4">Your History</h2>

            <!-- Mini chart -->
            <div v-if="chartPoints" class="bg-surface-card border border-white/8 rounded-2xl p-4 mb-4 overflow-hidden">
              <svg :viewBox="`0 0 ${CHART_W} ${CHART_H}`" class="w-full h-28" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#00C896" stop-opacity="0.3" />
                    <stop offset="100%" stop-color="#00C896" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <polygon :points="chartPoints.area" fill="url(#chartGrad)" />
                <polyline
                  :points="chartPoints.polyline"
                  fill="none"
                  stroke="#00C896"
                  stroke-width="2"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                />
                <circle
                  v-for="pt in chartPoints.pts"
                  :key="pt.entry.id"
                  :cx="pt.x"
                  :cy="pt.y"
                  r="3"
                  fill="#00C896"
                />
                <!-- Y axis labels -->
                <text :x="PADDING.left - 4" :y="PADDING.top + 4" text-anchor="end" font-size="9" fill="currentColor" class="text-text-muted" opacity="0.6">{{ chartPoints.maxD }}</text>
                <text :x="PADDING.left - 4" :y="CHART_H - PADDING.bottom" text-anchor="end" font-size="9" fill="currentColor" class="text-text-muted" opacity="0.6">{{ chartPoints.minD }}</text>
              </svg>
            </div>

            <!-- History table -->
            <div class="bg-surface-card border border-white/8 rounded-2xl overflow-hidden">
              <div
                v-for="(entry, i) in history"
                :key="entry.id"
                class="flex items-center gap-3 px-4 py-3"
                :class="i < history.length - 1 ? 'border-b border-white/5' : ''"
              >
                <div
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :style="{ background: CATEGORY_COLORS[entry.category] }"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline gap-2">
                    <span class="font-bold text-sm text-text-primary dark:text-white">{{ entry.distance }} m</span>
                    <span class="text-xs text-text-muted">{{ CATEGORY_LABELS[entry.category] }}</span>
                  </div>
                  <p class="text-xs text-text-muted">{{ entry.date }} · age {{ entry.age }} · VO₂max {{ entry.vo2max }}</p>
                </div>
                <button
                  class="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  @click="removeEntry(entry.id)"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- ── RESULTS VIEW ───────────────────────────────────────────────── -->
      <template v-else-if="view === 'results' && metrics">

        <!-- Category badge + distance -->
        <div class="bg-surface-card border border-white/8 rounded-2xl p-6 mb-4">
          <div class="flex items-start justify-between gap-4 mb-5">
            <div>
              <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-1">
                {{ metrics.ageGroup.label }} · {{ sex === 'male' ? 'Male' : 'Female' }}
              </p>
              <p class="text-5xl font-black text-text-primary dark:text-white leading-none">
                {{ metrics.distance.toLocaleString() }}<span class="text-2xl font-semibold text-text-muted ml-1">m</span>
              </p>
            </div>
            <span
              class="shrink-0 mt-1 px-3 py-1.5 rounded-xl text-sm font-bold text-white"
              :style="{ background: categoryColor }"
            >
              {{ CATEGORY_LABELS[metrics.category] }}
            </span>
          </div>

          <!-- 5-segment progress bar -->
          <div class="mb-2">
            <div class="flex rounded-lg overflow-hidden h-3 gap-0.5">
              <div
                v-for="seg in segments"
                :key="seg.cat"
                class="flex-1 relative"
                :style="{ background: `${seg.color}40` }"
              >
                <div
                  v-if="metrics.category === seg.cat"
                  class="absolute inset-0 opacity-100"
                  :style="{ background: seg.color }"
                />
              </div>
            </div>
            <div class="flex mt-1">
              <span
                v-for="seg in segments"
                :key="seg.cat"
                class="flex-1 text-center text-[9px] font-semibold leading-tight"
                :style="{ color: metrics.category === seg.cat ? seg.color : undefined }"
                :class="metrics.category !== seg.cat ? 'text-text-muted' : ''"
              >
                {{ seg.label.replace(' ', '\u00A0') }}
              </span>
            </div>
          </div>

          <!-- Marker position -->
          <div class="relative h-3 mt-1">
            <div
              class="absolute -translate-x-1/2 w-0 h-0"
              :style="{ left: `${metrics.barPosition * 100}%` }"
            >
              <div class="w-3 h-3 rounded-full border-2 border-white" :style="{ background: categoryColor }" />
            </div>
          </div>
        </div>

        <!-- Metrics row -->
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div class="bg-surface-card border border-white/8 rounded-2xl p-4 flex flex-col items-center gap-1">
            <Gauge class="w-5 h-5 text-primary mb-1" />
            <p class="text-xl font-black text-text-primary dark:text-white">{{ metrics.speed }}</p>
            <p class="text-xs text-text-muted">km/h</p>
          </div>
          <div class="bg-surface-card border border-white/8 rounded-2xl p-4 flex flex-col items-center gap-1">
            <Clock class="w-5 h-5 text-primary mb-1" />
            <p class="text-xl font-black text-text-primary dark:text-white">{{ metrics.pace }}</p>
            <p class="text-xs text-text-muted">min/km</p>
          </div>
          <div class="bg-surface-card border border-white/8 rounded-2xl p-4 flex flex-col items-center gap-1">
            <Activity class="w-5 h-5 text-primary mb-1" />
            <p class="text-xl font-black text-text-primary dark:text-white">{{ metrics.vo2max }}</p>
            <p class="text-xs text-text-muted">VO₂max</p>
          </div>
        </div>

        <!-- Next milestone -->
        <div v-if="metrics.nextCategory && metrics.metersToNext" class="bg-surface-card border border-white/8 rounded-2xl p-5 mb-4">
          <div class="flex items-center gap-2 mb-1">
            <Zap class="w-4 h-4 text-amber-400" />
            <p class="text-sm font-bold text-text-primary dark:text-white">Next milestone</p>
          </div>
          <p class="text-text-secondary text-sm">
            {{ metrics.metersToNext }} m to reach
            <span class="font-semibold" :style="{ color: CATEGORY_COLORS[metrics.nextCategory] }">
              {{ CATEGORY_LABELS[metrics.nextCategory] }}
            </span>
          </p>
          <p v-if="interp" class="mt-2 text-sm text-text-muted">{{ interp.nextStepComment }}</p>
        </div>
        <div v-else class="bg-surface-card border border-white/8 rounded-2xl p-5 mb-4">
          <div class="flex items-center gap-2 mb-1">
            <Zap class="w-4 h-4 text-amber-400" />
            <p class="text-sm font-bold text-text-primary dark:text-white">Top category</p>
          </div>
          <p v-if="interp" class="text-sm text-text-muted">{{ interp.nextStepComment }}</p>
        </div>

        <!-- Interpretation -->
        <div v-if="interp" class="space-y-3 mb-6">
          <div class="bg-surface-card border border-white/8 rounded-2xl p-5">
            <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-2">Performance</p>
            <p class="text-sm text-text-secondary leading-relaxed">{{ interp.categoryComment }}</p>
          </div>
          <div class="bg-surface-card border border-white/8 rounded-2xl p-5">
            <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-2">VO₂max Estimate</p>
            <p class="text-sm text-text-secondary leading-relaxed">{{ interp.vo2maxComment }}</p>
          </div>
          <div class="bg-surface-card border border-white/8 rounded-2xl p-5">
            <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-2">Training Recommendation</p>
            <p class="text-sm text-text-secondary leading-relaxed">{{ interp.recommendation }}</p>
          </div>
        </div>

        <!-- Save button -->
        <div class="flex gap-3">
          <button
            class="flex-1 py-3 rounded-xl border border-white/10 text-sm font-semibold text-text-secondary hover:border-primary/40 hover:text-primary transition-all"
            @click="reset"
          >
            New Test
          </button>
          <button
            class="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
            @click="saveResult"
          >
            Save Result
          </button>
        </div>

        <!-- Disclaimer -->
        <p class="mt-6 text-xs text-text-muted text-center leading-relaxed">
          Performance classification is an indicative assessment only.<br />
          VO₂max is estimated using the Cooper formula — not equivalent to a laboratory measurement.
        </p>
      </template>

    </div>
  </AppLayout>
</template>
