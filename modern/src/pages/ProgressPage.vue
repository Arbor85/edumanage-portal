<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Dumbbell, Clock, Layers, ChevronRight } from 'lucide-vue-next'
import AppLayout from '../components/layout/AppLayout.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import VolumeChart from '../components/VolumeChart.vue'
import TrainingHeatmap from '../components/TrainingHeatmap.vue'
import BodySilhouette from '../components/BodySilhouette.vue'
import PRList from '../components/PRList.vue'
import { useProgressStore } from '../stores/progressStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { useCountUp } from '../composables/useCountUp'
import { useIntersectionReveal } from '../composables/useIntersectionReveal'
import type { WorkoutHistoryOut } from '../types'

const router = useRouter()
const progressStore = useProgressStore()
const workoutStore = useWorkoutStore()

type Tab = 'overview' | 'records' | 'history'
const activeTab = ref<Tab>('overview')

// Workout detail modal
const selected = ref<WorkoutHistoryOut | null>(null)

// Chart data derived from progress store
const chartData = computed(() =>
  progressStore.weeklyData.map((w) => ({ label: w.label, sets: w.sets }))
)

// ── Animated stat counters ─────────────────────────────────
const statsEl = ref<HTMLElement | null>(null)
const { isVisible: statsVisible } = useIntersectionReveal(statsEl)

const workoutsTarget = computed(() => progressStore.totalWorkouts)
const setsTarget = computed(() => progressStore.totalSets)
const hoursTarget = computed(() => progressStore.totalHours)

const { displayValue: workoutsDisplay, trigger: triggerWorkouts } = useCountUp(workoutsTarget)
const { displayValue: setsDisplay, trigger: triggerSets } = useCountUp(setsTarget)
const { displayValue: hoursDisplay, trigger: triggerHours } = useCountUp(hoursTarget)

watch(statsVisible, (v) => {
  if (v) { triggerWorkouts(); triggerSets(); triggerHours() }
})

// ── Section reveal on scroll ───────────────────────────────
const chartEl = ref<HTMLElement | null>(null)
const heatmapEl = ref<HTMLElement | null>(null)
const bodyEl = ref<HTMLElement | null>(null)

const { isVisible: chartVisible } = useIntersectionReveal(chartEl)
const { isVisible: heatmapVisible } = useIntersectionReveal(heatmapEl)
const { isVisible: bodyVisible } = useIntersectionReveal(bodyEl)

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  return `${m}m`
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'records', label: 'Records' },
  { id: 'history', label: 'History' },
]
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <!-- Page header -->
      <div class="pt-2 pb-4">
        <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-1">Your journey</p>
        <h1 class="text-3xl font-black text-white">Progress</h1>
      </div>

      <!-- Quick stat cards (animated count-up) -->
      <div ref="statsEl" class="grid grid-cols-3 gap-3 mb-6">
        <div class="bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
          <p class="text-2xl font-black text-primary tabular-nums">{{ workoutsDisplay }}</p>
          <p class="text-[10px] font-bold tracking-widest uppercase text-text-muted mt-1">Workouts</p>
        </div>
        <div class="bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
          <p class="text-2xl font-black text-primary tabular-nums">{{ setsDisplay }}</p>
          <p class="text-[10px] font-bold tracking-widest uppercase text-text-muted mt-1">Total sets</p>
        </div>
        <div class="bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
          <p class="text-2xl font-black text-primary tabular-nums">{{ hoursDisplay }}h</p>
          <p class="text-[10px] font-bold tracking-widest uppercase text-text-muted mt-1">Active time</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-surface-card border border-white/5 rounded-2xl p-1 mb-6">
        <button
          v-for="tab in TABS"
          :key="tab.id"
          class="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
          :class="activeTab === tab.id
            ? 'bg-surface-elevated text-white shadow-sm'
            : 'text-text-muted hover:text-text-secondary'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ── Overview tab ─────────────────────────────────── -->
      <div v-if="activeTab === 'overview'" class="space-y-6">

        <!-- Volume chart (reveal on scroll) -->
        <section
          ref="chartEl"
          class="bg-surface-card border border-white/5 rounded-2xl p-5 transition-all duration-500"
          :class="chartVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-4">Sets per week</p>
          <VolumeChart v-if="chartData.length" :data="chartData" />
          <SkeletonLoader v-else height="176px" rounded="rounded-xl" />
        </section>

        <!-- Training heatmap (reveal on scroll) -->
        <section
          ref="heatmapEl"
          class="bg-surface-card border border-white/5 rounded-2xl p-5 transition-all duration-500 delay-100"
          :class="heatmapVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-4">
            12 weeks at a glance
          </p>
          <TrainingHeatmap :data="progressStore.heatmapData" />
        </section>

        <!-- Body silhouette / muscle frequency (reveal on scroll) -->
        <section
          ref="bodyEl"
          class="bg-surface-card border border-white/5 rounded-2xl p-5 transition-all duration-500 delay-200"
          :class="bodyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
        >
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-4">
            Muscles trained
          </p>
          <BodySilhouette :muscle-frequency="progressStore.muscleFrequency" />
        </section>
      </div>

      <!-- ── Records tab ──────────────────────────────────── -->
      <div v-else-if="activeTab === 'records'">
        <PRList :records="progressStore.personalRecords" />
      </div>

      <!-- ── History tab ──────────────────────────────────── -->
      <div v-else-if="activeTab === 'history'">
        <!-- Empty state -->
        <div
          v-if="workoutStore.history.length === 0"
          class="text-center py-16"
        >
          <Dumbbell class="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p class="text-lg font-bold text-white mb-1">No workouts yet</p>
          <p class="text-sm text-text-secondary mb-6">Your completed workouts will appear here.</p>
          <button
            class="px-5 py-2.5 bg-primary/10 border border-primary/30 text-primary font-semibold rounded-xl
                   hover:bg-primary/20 active:scale-[0.97] transition-all text-sm"
            @click="router.push('/')"
          >
            Go to Today
          </button>
        </div>

        <!-- Workout list -->
        <div v-else class="flex flex-col gap-3">
          <button
            v-for="workout in workoutStore.history"
            :key="workout.id ?? workout.completedAt ?? ''"
            class="w-full bg-surface-card border border-white/5 rounded-2xl p-4 text-left
                   hover:border-white/10 hover:-translate-y-0.5 hover:shadow-lg
                   active:scale-[0.97] transition-all group"
            @click="selected = workout"
          >
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Dumbbell class="w-5 h-5 text-primary" />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="font-bold text-white truncate">
                  {{ workout.name ?? workout.sourceWorkout?.name ?? 'Workout' }}
                </p>
                <p class="text-xs text-text-muted mt-0.5">{{ fmtDate(workout.completedAt) }}</p>

                <!-- Meta chips -->
                <div class="flex gap-2 mt-2">
                  <span class="flex items-center gap-1 text-xs text-text-secondary">
                    <Layers class="w-3 h-3" />
                    {{ workout.completedSets }} sets
                  </span>
                  <span class="flex items-center gap-1 text-xs text-text-secondary">
                    <Clock class="w-3 h-3" />
                    {{ fmtDuration(workout.durationSeconds) }}
                  </span>
                </div>
              </div>

              <ChevronRight class="w-4 h-4 text-text-muted flex-shrink-0 mt-3
                              group-hover:text-text-secondary transition-colors" />
            </div>
          </button>
        </div>
      </div>

    </div>

    <!-- Workout detail modal (inline) -->
    <Teleport to="body">
      <Transition name="page">
        <div
          v-if="selected"
          class="fixed inset-0 z-50 bg-surface-page/95 backdrop-blur-sm overflow-y-auto"
          @click.self="selected = null"
        >
          <div class="max-w-lg mx-auto px-4 py-8">
            <!-- Header -->
            <div class="flex items-center gap-3 mb-6">
              <button
                class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-text-secondary
                       hover:bg-white/10 active:scale-95 transition-all"
                @click="selected = null"
              >
                ×
              </button>
              <div class="flex-1">
                <p class="font-black text-white">
                  {{ selected.name ?? selected.sourceWorkout?.name ?? 'Workout' }}
                </p>
                <p class="text-xs text-text-muted">{{ fmtDate(selected.completedAt) }}</p>
              </div>
            </div>

            <!-- Stats row -->
            <div class="grid grid-cols-3 gap-3 mb-6">
              <div class="bg-surface-card border border-white/5 rounded-2xl p-3 text-center">
                <p class="text-xl font-black text-primary">{{ fmtDuration(selected.durationSeconds) }}</p>
                <p class="text-[10px] text-text-muted uppercase tracking-widest font-bold mt-0.5">Duration</p>
              </div>
              <div class="bg-surface-card border border-white/5 rounded-2xl p-3 text-center">
                <p class="text-xl font-black text-primary">{{ selected.completedSets }}</p>
                <p class="text-[10px] text-text-muted uppercase tracking-widest font-bold mt-0.5">Sets done</p>
              </div>
              <div class="bg-surface-card border border-white/5 rounded-2xl p-3 text-center">
                <p class="text-xl font-black text-primary">{{ (selected.excercises ?? []).length }}</p>
                <p class="text-[10px] text-text-muted uppercase tracking-widest font-bold mt-0.5">Exercises</p>
              </div>
            </div>

            <!-- Exercise list -->
            <div class="flex flex-col gap-2">
              <div
                v-for="(ex, i) in selected.excercises ?? []"
                :key="i"
                class="bg-surface-card border border-white/5 rounded-2xl p-4"
              >
                <p class="font-bold text-white mb-2">{{ ex.name }}</p>
                <div class="flex flex-col gap-1">
                  <div
                    v-for="(set, si) in ex.sets ?? []"
                    :key="si"
                    class="flex items-center gap-2 text-sm text-text-secondary"
                  >
                    <span class="w-5 text-center text-text-muted text-xs font-bold">{{ si + 1 }}</span>
                    <span>
                      <template v-if="ex.activityTrackType === 'repetitions'">
                        <span v-if="set.weight">{{ set.weight }}kg ×</span>
                        {{ set.reps ?? '—' }} reps
                      </template>
                      <template v-else-if="ex.activityTrackType === 'time'">
                        {{ set.duration ?? '—' }}s
                      </template>
                      <template v-else>
                        {{ set.distance ?? '—' }}m
                      </template>
                    </span>
                    <span
                      v-if="set.completed"
                      class="ml-auto text-xs text-primary font-semibold"
                    >✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AppLayout>
</template>
