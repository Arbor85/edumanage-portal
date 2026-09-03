<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Dumbbell, Play } from 'lucide-vue-next'
import AppLayout from '../components/layout/AppLayout.vue'
import DailyChallengeCard from '../components/DailyChallengeCard.vue'
import EffortSnapshotCard from '../components/EffortSnapshotCard.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import StartWorkoutDialog from '../components/StartWorkoutDialog.vue'
import { useRoutineStore } from '../stores/routineStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { usePlanStore } from '../stores/planStore'
import { useChallengeStore } from '../stores/challengeStore'
import { useWorkoutSuggestion } from '../composables/useWorkoutSuggestion'

const router = useRouter()
const routineStore = useRoutineStore()
const workoutStore = useWorkoutStore()
const planStore = usePlanStore()
const challengeStore = useChallengeStore()
const { suggestedRoutine } = useWorkoutSuggestion()

const isStartDialogOpen = ref(false)

onMounted(async () => {
  await Promise.all([
    routineStore.routines.length === 0 ? routineStore.fetch() : Promise.resolve(),
    planStore.plans.length === 0 ? planStore.fetch() : Promise.resolve(),
    challengeStore.fetchTodayChallenge(),
  ])
})

const todayISO = new Date().toISOString().split('T')[0]

const activePlan = computed(() =>
  planStore.plans.find((p) => p.status === 'active' || p.status === 'draft') ?? null
)

const todayPlanWorkout = computed(() => {
  if (!activePlan.value?.workouts) return null
  return activePlan.value.workouts.find((w) => w.date === todayISO) ?? null
})

const heroWorkout = computed(() => {
  if (todayPlanWorkout.value) {
    return {
      name: todayPlanWorkout.value.name ?? 'Today\'s Workout',
      note: todayPlanWorkout.value.note,
      exerciseCount: todayPlanWorkout.value.excercises?.length ?? 0,
      source: 'plan' as const,
    }
  }
  if (suggestedRoutine.value) {
    return {
      name: suggestedRoutine.value.name ?? 'Suggested Workout',
      note: suggestedRoutine.value.note,
      exerciseCount: suggestedRoutine.value.excercises?.length ?? 0,
      source: 'routine' as const,
    }
  }
  return null
})

const isLoading = computed(() => routineStore.isLoading || planStore.isLoading)

// Effort snapshot stats — derived from local history
const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

const setsThisWeek = computed(() =>
  workoutStore.history
    .filter((h) => h.completedAt && new Date(h.completedAt).getTime() > sevenDaysAgo)
    .reduce((acc, h) => acc + (h.completedSets ?? 0), 0)
)

const workoutsThisMonth = computed(() =>
  workoutStore.history.filter(
    (h) => h.completedAt && new Date(h.completedAt).getTime() > thirtyDaysAgo
  ).length
)

const minutesThisWeek = computed(() =>
  Math.round(
    workoutStore.history
      .filter((h) => h.completedAt && new Date(h.completedAt).getTime() > sevenDaysAgo)
      .reduce((acc, h) => acc + (h.durationSeconds ?? 0), 0) / 60
  )
)
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Page header -->
      <div class="pt-2 flex items-end justify-between">
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-1">
            {{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) }}
          </p>
          <h1 class="text-3xl font-black text-white">Today</h1>
        </div>
        <button
          class="flex items-center gap-1.5 px-4 h-10 bg-primary text-white font-bold text-sm rounded-xl
                 shadow-glow hover:bg-primary-dark active:scale-[0.97] transition-all"
          @click="isStartDialogOpen = true"
        >
          <Play class="w-4 h-4" />
          Start Workout
        </button>
      </div>

      <!-- Hero: Today's workout (informational) -->
      <section>
        <template v-if="isLoading">
          <SkeletonLoader height="110px" rounded="rounded-2xl" />
        </template>

        <div
          v-else-if="heroWorkout"
          class="rounded-2xl bg-gradient-to-br from-surface-card to-surface-elevated border border-white/5 p-5 relative overflow-hidden"
        >
          <div class="absolute -top-8 -right-8 w-32 h-32 bg-primary/8 rounded-full blur-2xl pointer-events-none" />

          <div class="relative flex items-center gap-4">
            <div class="w-11 h-11 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Dumbbell class="w-5 h-5 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <p
                class="text-[10px] font-bold tracking-[0.12em] uppercase mb-1"
                :class="heroWorkout.source === 'plan' ? 'text-primary' : 'text-text-muted'"
              >
                {{ heroWorkout.source === 'plan' ? "Today's plan" : 'Suggested for you' }}
              </p>
              <h2 class="text-lg font-black text-white leading-tight truncate">{{ heroWorkout.name }}</h2>
              <p class="text-xs text-text-muted mt-0.5">
                {{ heroWorkout.exerciseCount }} exercise{{ heroWorkout.exerciseCount !== 1 ? 's' : '' }}
                <span v-if="heroWorkout.note"> · {{ heroWorkout.note }}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Daily challenge -->
      <section>
        <DailyChallengeCard />
      </section>

      <!-- Effort snapshot -->
      <section>
        <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-3">Your effort</p>
        <div class="flex gap-3">
          <EffortSnapshotCard
            label="Sets this week"
            :value="setsThisWeek"
            unit="sets completed"
            link-to="/progress"
          />
          <EffortSnapshotCard
            label="This month"
            :value="workoutsThisMonth"
            unit="workouts"
            link-to="/progress"
          />
          <EffortSnapshotCard
            label="Active time"
            :value="minutesThisWeek"
            unit="min this week"
            link-to="/progress"
          />
        </div>
      </section>
    </div>
    <StartWorkoutDialog
      :open="isStartDialogOpen"
      :today-plan-workout="todayPlanWorkout"
      :suggested-routine="suggestedRoutine"
      :plan-id="activePlan?.id ?? ''"
      @close="isStartDialogOpen = false"
    />
  </AppLayout>
</template>
