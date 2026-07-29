<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Play, Pencil, Dumbbell, CalendarDays, CheckCircle2 } from 'lucide-vue-next'
import AppLayout from '../components/layout/AppLayout.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import RoutineFormModal from './RoutinesPage/components/RoutineFormModal.vue'
import { useRoutineStore } from '../stores/routineStore'
import { useExerciseStore } from '../stores/exerciseStore'
import { usePlanStore } from '../stores/planStore'
import { useWorkoutStore } from '../stores/workoutStore'
import type { RoutineOut, PlanWorkoutOutput } from '../types'

const router = useRouter()
const routineStore = useRoutineStore()
const exerciseStore = useExerciseStore()
const planStore = usePlanStore()
const workoutStore = useWorkoutStore()

type Tab = 'routines' | 'plan'
const activeTab = ref<Tab>('routines')

const search = ref('')
const isCreateOpen = ref(false)
const editTarget = ref<RoutineOut | null>(null)

onMounted(() => {
  routineStore.fetch()
  exerciseStore.fetch()
  if (!planStore.plans.length) planStore.fetch()
})

const filtered = computed(() =>
  routineStore.routines.filter(
    (r) => !search.value || r.name?.toLowerCase().includes(search.value.toLowerCase())
  )
)

const activePlan = computed(
  () => planStore.plans.find((p) => p.status === 'active' || p.status === 'draft') ?? null
)

const sortedWorkouts = computed(() => {
  if (!activePlan.value?.workouts) return []
  return [...activePlan.value.workouts]
    .filter((w) => w.date)
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
})

const todayISO = new Date().toISOString().split('T')[0]

function isToday(date: string | null): boolean { return date === todayISO }
function isPast(date: string | null): boolean { return !!date && date < todayISO }

function isCompleted(w: PlanWorkoutOutput): boolean {
  return workoutStore.history.some(
    (h) => h.sourceWorkout?.date === w.date && h.sourceWorkout?.name === w.name
  )
}

function startRoutine(r: RoutineOut) {
  workoutStore.startFromRoutine(r)
  router.push('/workout/active')
}

function startPlanWorkout(w: PlanWorkoutOutput) {
  workoutStore.startFromPlanWorkout(w, activePlan.value?.id ?? '')
  router.push('/workout/active')
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <!-- Page header -->
      <div class="pt-2 pb-4 flex items-end justify-between">
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-1">Your sessions</p>
          <h1 class="text-3xl font-black text-white">Train</h1>
        </div>
        <button
          v-if="activeTab === 'routines'"
          class="flex items-center gap-1.5 px-4 h-10 bg-primary text-white font-bold text-sm rounded-xl
                 shadow-glow hover:bg-primary-dark active:scale-[0.97] transition-all"
          @click="isCreateOpen = true"
        >
          <Plus class="w-4 h-4" />
          New Routine
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 bg-surface-card border border-white/5 rounded-2xl p-1 mb-6">
        <button
          class="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
          :class="activeTab === 'routines'
            ? 'bg-surface-elevated text-white shadow-sm'
            : 'text-text-muted hover:text-text-secondary'"
          @click="activeTab = 'routines'"
        >
          My Routines
        </button>
        <button
          class="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
          :class="activeTab === 'plan'
            ? 'bg-surface-elevated text-white shadow-sm'
            : 'text-text-muted hover:text-text-secondary'"
          @click="activeTab = 'plan'"
        >
          Active Plan
        </button>
      </div>

      <!-- ── My Routines tab ─────────────────────────────── -->
      <div v-if="activeTab === 'routines'">
        <!-- Search -->
        <div class="relative mb-4">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke-width="2" />
              <path d="M21 21l-4.35-4.35" stroke-width="2" stroke-linecap="round" />
            </svg>
          </span>
          <input
            v-model="search"
            placeholder="Search routines…"
            class="w-full pl-10 pr-4 h-11 bg-surface-input border border-white/5 rounded-xl
                   text-sm text-white placeholder:text-text-muted outline-none
                   focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
          />
        </div>

        <!-- Loading -->
        <div v-if="routineStore.isLoading" class="flex flex-col gap-3">
          <SkeletonLoader v-for="i in 4" :key="i" height="80px" rounded="rounded-2xl" />
        </div>

        <!-- Empty state -->
        <div v-else-if="!filtered.length" class="text-center py-16">
          <Dumbbell class="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p class="text-lg font-bold text-white mb-1">
            {{ routineStore.routines.length === 0 ? 'No routines yet' : 'No matches' }}
          </p>
          <p class="text-sm text-text-secondary mb-6">
            {{ routineStore.routines.length === 0
              ? 'Create your first workout routine to get started.'
              : 'Try a different search term.' }}
          </p>
          <button
            v-if="routineStore.routines.length === 0"
            class="px-5 py-2.5 bg-primary/10 border border-primary/30 text-primary font-semibold rounded-xl
                   hover:bg-primary/20 active:scale-[0.97] transition-all text-sm"
            @click="isCreateOpen = true"
          >
            Create Routine
          </button>
        </div>

        <!-- Routine cards -->
        <div v-else class="flex flex-col gap-3">
          <div
            v-for="routine in filtered"
            :key="routine.id ?? ''"
            class="bg-surface-card border border-white/5 rounded-2xl p-4 flex items-center gap-4
                   hover:-translate-y-0.5 hover:border-white/10 hover:shadow-lg
                   active:scale-[0.99] transition-all"
          >
            <!-- Icon -->
            <div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Dumbbell class="w-5 h-5 text-primary" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="font-bold text-white truncate">{{ routine.name }}</p>
              <p class="text-xs text-text-muted mt-0.5">
                {{ routine.excercises?.length ?? 0 }}
                exercise{{ (routine.excercises?.length ?? 0) !== 1 ? 's' : '' }}
                <span v-if="routine.note"> · {{ routine.note }}</span>
              </p>
            </div>

            <!-- Actions -->
            <button
              class="w-8 h-8 rounded-lg text-text-muted hover:text-white hover:bg-white/10
                     flex items-center justify-center transition-all flex-shrink-0"
              @click="editTarget = routine"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>

            <button
              class="flex items-center gap-1.5 px-4 h-9 bg-primary text-white font-bold text-sm
                     rounded-xl shadow-glow hover:bg-primary-dark active:scale-[0.97] transition-all flex-shrink-0"
              @click="startRoutine(routine)"
            >
              <Play class="w-4 h-4" />
              Start
            </button>
          </div>
        </div>
      </div>

      <!-- ── Active Plan tab ────────────────────────────── -->
      <div v-else-if="activeTab === 'plan'">
        <!-- Loading -->
        <div v-if="planStore.isLoading" class="flex flex-col gap-3">
          <SkeletonLoader v-for="i in 5" :key="i" height="96px" rounded="rounded-2xl" />
        </div>

        <!-- No plan -->
        <div v-else-if="!activePlan" class="text-center py-16">
          <CalendarDays class="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p class="text-lg font-bold text-white mb-1">No active plan</p>
          <p class="text-sm text-text-secondary">
            Ask your trainer to create a plan for you, or start a routine from My Routines.
          </p>
        </div>

        <!-- Plan workouts -->
        <div v-else>
          <!-- Plan header -->
          <div class="mb-5">
            <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-1">
              {{ activePlan.status === 'active' ? 'Active plan' : 'Draft plan' }}
            </p>
            <h2 class="text-xl font-black text-white">{{ activePlan.name }}</h2>
            <p v-if="activePlan.note" class="text-sm text-text-secondary mt-0.5">{{ activePlan.note }}</p>
          </div>

          <!-- Workout list -->
          <div v-if="sortedWorkouts.length" class="flex flex-col gap-3">
            <div
              v-for="workout in sortedWorkouts"
              :key="workout.id ?? workout.date ?? ''"
              class="rounded-2xl border p-4 transition-all"
              :class="[
                isToday(workout.date)
                  ? 'border-primary/40 bg-primary/5'
                  : isPast(workout.date)
                    ? 'border-white/5 bg-surface-card opacity-60'
                    : 'border-white/5 bg-surface-card',
              ]"
            >
              <div class="flex items-start gap-3">
                <!-- Status icon -->
                <div class="flex-shrink-0 mt-0.5">
                  <CheckCircle2
                    v-if="isPast(workout.date) && isCompleted(workout)"
                    class="w-5 h-5 text-primary"
                  />
                  <div
                    v-else-if="isToday(workout.date)"
                    class="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <span class="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div v-else class="w-5 h-5 rounded-full border-2 border-white/20" />
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span
                      v-if="isToday(workout.date)"
                      class="text-[10px] font-bold tracking-widest uppercase text-primary"
                    >Today</span>
                    <span
                      v-else
                      class="text-[10px] font-bold tracking-widest uppercase text-text-muted"
                    >{{ fmtDate(workout.date ?? '') }}</span>
                  </div>
                  <p class="font-bold text-white truncate">{{ workout.name ?? 'Workout' }}</p>
                  <p class="text-xs text-text-muted mt-0.5">
                    {{ workout.excercises?.length ?? 0 }} exercises
                  </p>
                </div>

                <!-- Start button (today or past) -->
                <button
                  v-if="isToday(workout.date)"
                  class="flex items-center gap-1.5 px-4 h-9 bg-primary text-white font-bold text-sm
                         rounded-xl shadow-glow hover:bg-primary-dark active:scale-[0.97] transition-all flex-shrink-0"
                  @click="startPlanWorkout(workout)"
                >
                  <Play class="w-4 h-4" />
                  Start
                </button>
                <button
                  v-else-if="isPast(workout.date) && !isCompleted(workout)"
                  class="text-xs text-text-muted px-3 h-8 rounded-lg bg-white/5
                         hover:bg-white/10 active:scale-[0.97] transition-all flex-shrink-0"
                  @click="startPlanWorkout(workout)"
                >
                  Do it now
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 text-text-secondary text-sm">
            This plan has no scheduled workouts yet.
          </div>
        </div>
      </div>
    </div>

    <!-- Routine form modal (create / edit) -->
    <RoutineFormModal
      :open="isCreateOpen || editTarget !== null"
      :routine="editTarget"
      @close="isCreateOpen = false; editTarget = null"
    />
  </AppLayout>
</template>
