<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Pause, Play, Check, ChevronLeft, Dumbbell, SkipForward } from 'lucide-vue-next'
import ActiveWorkoutLayout from '../components/layout/ActiveWorkoutLayout.vue'
import WorkoutCompleteView from '../components/WorkoutCompleteView.vue'
import BottomSheetPicker from '../components/BottomSheetPicker.vue'
import RestTimerOverlay from '../components/RestTimerOverlay.vue'
import MuscleDiagram from '../components/MuscleDiagram.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import WorkoutStartPanel from './ActiveWorkoutPage/components/WorkoutStartPanel.vue'
import SetTimerRow from './ActiveWorkoutPage/components/SetTimerRow.vue'
import { useWorkoutStore } from '../stores/workoutStore'
import { useExerciseStore } from '../stores/exerciseStore'
import type { WorkoutHistoryOut } from '../types'

const store = useWorkoutStore()
const exerciseStore = useExerciseStore()
const router = useRouter()

onMounted(() => exerciseStore.fetch())

// ── State ─────────────────────────────────────────────────
const completedWorkout = ref<WorkoutHistoryOut | null>(null)
const confirmFinish = ref(false)
const isFinishing = ref(false)

type PickerField = 'reps' | 'weight'
const pickerField = ref<PickerField | null>(null)
const editingReps = ref(0)
const editingWeight = ref(0)

// ── Workout / step derived state ──────────────────────────
const workout = computed(() => store.activeWorkout)

const currentStep = computed(() => {
  const aw = workout.value
  if (!aw) return null
  return aw.steps[aw.currentStepIndex] ?? null
})

const isDone = computed(() => {
  const aw = workout.value
  if (!aw) return false
  return aw.currentStepIndex >= aw.steps.length
})

// For normal-set and drop-set steps
const currentEx = computed(() => {
  const step = currentStep.value
  if (!step || !workout.value) return null
  if (step.type === 'normal-set' || step.type === 'drop-set') {
    return workout.value.exercises[step.exerciseIndex] ?? null
  }
  return null
})

const currentSet = computed(() => {
  const step = currentStep.value
  if (!step || !workout.value) return null
  if (step.type === 'normal-set' || step.type === 'drop-set') {
    return workout.value.exercises[step.exerciseIndex]?.sets[step.setIndex] ?? null
  }
  return null
})

// For superset-round steps
const currentSupersetStep = computed(() => {
  const step = currentStep.value
  if (!step || step.type !== 'superset-round') return null
  return step
})

const currentSupersetItem = computed(() => {
  const step = currentSupersetStep.value
  if (!step || !workout.value) return null
  const item = step.items.find(i => !i.completed)
  if (!item) return null
  return { item, exercise: workout.value.exercises[item.exerciseIndex] }
})

const isTimeBased = computed(() => currentEx.value?.activityTrackType === 'time')
const hasWeight = computed(() =>
  currentEx.value?.activityType === 'weighted' || currentEx.value?.activityType === 'machine'
)
const supersetItemHasWeight = computed(() => {
  const ex = currentSupersetItem.value?.exercise
  return ex?.activityType === 'weighted' || ex?.activityType === 'machine'
})

// Exercise index for the queue highlight
const activeExerciseIndex = computed(() => {
  const step = currentStep.value
  if (!step || !workout.value) return workout.value?.currentStepIndex ?? 0
  if (step.type === 'normal-set' || step.type === 'drop-set') return step.exerciseIndex
  if (step.type === 'superset-round') return step.items[0]?.exerciseIndex ?? 0
  return 0
})

const elapsed = computed(() => {
  const s = store.elapsedSeconds
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
})

// Sync editor values when current set changes (normal + drop)
watch(
  currentSet,
  (set) => {
    if (!set) return
    editingReps.value = set.reps ?? 0
    editingWeight.value = set.weight ?? 0
  },
  { immediate: true }
)

// Sync editor values when superset item changes
watch(
  currentSupersetItem,
  (item) => {
    if (!item) return
    const set = item.exercise.sets[item.item.setIndex]
    editingReps.value = set?.reps ?? 0
    editingWeight.value = set?.weight ?? 0
  },
  { immediate: true }
)

// ── Actions ───────────────────────────────────────────────
function openPicker(field: PickerField) {
  pickerField.value = field
}

function updatePickerValue(val: number) {
  if (pickerField.value === 'reps') editingReps.value = val
  else if (pickerField.value === 'weight') editingWeight.value = val
  pickerField.value = null
}

function completeCurrentSet(actualDuration?: number | null) {
  const step = currentStep.value
  if (!step) return

  if (step.type === 'normal-set') {
    const ex = currentEx.value
    if (!ex) return
    const reps = ex.activityTrackType === 'repetitions' ? editingReps.value : null
    const weight = hasWeight.value ? editingWeight.value : null
    store.completeSet(reps, weight, undefined, actualDuration ?? null)

  } else if (step.type === 'drop-set') {
    // Drop set: just reps (to failure), weight is pre-set
    const set = currentSet.value
    store.completeSet(editingReps.value || null, set?.weight ?? null, undefined, null)

  } else if (step.type === 'superset-round') {
    const item = currentSupersetItem.value
    if (!item) return
    const ex = item.exercise
    const reps = ex.activityTrackType === 'repetitions' ? editingReps.value : null
    const weight = supersetItemHasWeight.value ? editingWeight.value : null
    store.completeSupersetItem(reps, weight)
  }
}

async function finish() {
  isFinishing.value = true
  confirmFinish.value = false

  const aw = store.activeWorkout!

  try {
    completedWorkout.value = await store.finishWorkout()
  } catch {
    completedWorkout.value = {
      id: null,
      name: aw.routineName,
      currentUserId: null,
      mode: aw.mode,
      startedAt: aw.startedAt,
      completedAt: new Date().toISOString(),
      durationSeconds: store.elapsedSeconds,
      totalSets: aw.exercises.reduce((a, e) => a + e.sets.length, 0),
      completedSets: aw.exercises.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0),
      excercises: null,
      sourceWorkout: aw.sourceWorkout,
    }
  } finally {
    isFinishing.value = false
  }
}

function onWorkoutDone() {
  completedWorkout.value = null
  router.push('/progress')
}
</script>

<template>
  <ActiveWorkoutLayout>

    <!-- ── No workout: start panel ───────────────────── -->
    <div v-if="!workout && !completedWorkout" class="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
      <WorkoutStartPanel />
    </div>

    <!-- ── Workout complete ──────────────────────────── -->
    <div v-else-if="completedWorkout" class="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">
      <WorkoutCompleteView :history-item="completedWorkout" @done="onWorkoutDone" />
    </div>

    <!-- ── Active workout ────────────────────────────── -->
    <template v-else-if="workout">
      <!-- Fixed header -->
      <header class="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-surface-page/90 backdrop-blur-sm">
        <button
          class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-text-secondary
                 hover:bg-white/10 active:scale-95 transition-all"
          @click="router.push('/')"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>

        <div class="flex-1 min-w-0">
          <p class="font-black text-white truncate">{{ workout.routineName ?? 'Workout' }}</p>
          <p class="text-xs text-text-muted font-mono tabular-nums">{{ elapsed }}</p>
        </div>

        <button
          class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-text-secondary
                 hover:bg-white/10 active:scale-95 transition-all"
          @click="workout.paused ? store.resumeWorkout() : store.pauseWorkout()"
        >
          <Play v-if="workout.paused" class="w-4 h-4" />
          <Pause v-else class="w-4 h-4" />
        </button>

        <button
          class="px-4 h-9 rounded-xl bg-primary text-white font-bold text-sm
                 shadow-glow hover:bg-primary-dark active:scale-95 transition-all"
          :disabled="isFinishing"
          @click="confirmFinish = true"
        >
          {{ isFinishing ? '…' : 'Finish' }}
        </button>
      </header>

      <!-- Exercise queue: horizontal scroll pills -->
      <div class="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none border-b border-white/5 flex-shrink-0">
        <button
          v-for="(ex, i) in workout.exercises"
          :key="i"
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
          :class="[
            ex.skipped
              ? 'bg-white/5 text-text-muted line-through'
              : i === activeExerciseIndex
                ? 'bg-primary text-white shadow-glow'
                : ex.sets.every(s => s.completed)
                  ? 'bg-white/5 text-text-muted'
                  : 'bg-surface-card border border-white/10 text-text-secondary'
          ]"
        >
          {{ ex.name }}
        </button>
      </div>

      <!-- Main content -->
      <div class="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full">

        <!-- ── All done ── -->
        <div v-if="isDone" class="text-center py-12">
          <p class="text-2xl font-black text-white mb-2">All done!</p>
          <p class="text-text-secondary mb-6">Tap Finish to save your workout.</p>
          <button
            class="px-8 h-12 bg-primary text-white font-bold rounded-xl shadow-glow
                   hover:bg-primary-dark active:scale-[0.97] transition-all"
            @click="confirmFinish = true"
          >
            Finish Workout
          </button>
        </div>

        <!-- ── Superset round step ── -->
        <template v-else-if="currentStep?.type === 'superset-round' && currentSupersetStep">
          <div class="mb-5 flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-text-muted mb-0.5">Superset</p>
              <h2 class="text-2xl font-black text-white">
                Round {{ currentSupersetStep.roundIndex + 1 }} of
                {{ currentSupersetStep.items.length > 0
                    ? workout!.exercises[currentSupersetStep.items[0].exerciseIndex]?.sets.length ?? '?'
                    : '?' }}
              </h2>
            </div>
            <button
              class="flex-shrink-0 flex items-center gap-1 text-xs text-text-muted px-2.5 py-1.5 rounded-lg
                     bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
              @click="store.skipExercise()"
            >
              <SkipForward class="w-3.5 h-3.5" />
              Skip
            </button>
          </div>

          <!-- Stacked exercise rows in the round -->
          <div class="rounded-2xl border border-white/10 overflow-hidden">
            <div
              v-for="(item, itemI) in currentSupersetStep.items"
              :key="itemI"
              class="p-4 transition-all"
              :class="[
                item.completed
                  ? 'bg-green-500/5 border-b border-white/5'
                  : currentSupersetItem?.item === item
                    ? 'bg-primary/5 border-b border-primary/20'
                    : 'bg-surface-card border-b border-white/5 opacity-50',
                itemI === currentSupersetStep.items.length - 1 ? 'border-b-0' : '',
              ]"
            >
              <div class="flex items-start gap-3">
                <!-- Status icon -->
                <span
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  :class="item.completed ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-text-secondary'"
                >
                  <Check v-if="item.completed" class="w-3.5 h-3.5" />
                  <span v-else>{{ itemI + 1 }}</span>
                </span>

                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-white mb-1">
                    {{ workout.exercises[item.exerciseIndex]?.name }}
                  </p>

                  <!-- Completed item: show actuals -->
                  <p v-if="item.completed" class="text-xs text-green-400">
                    {{ workout.exercises[item.exerciseIndex]?.sets[item.setIndex]?.actualWeight !== null
                        ? `${workout.exercises[item.exerciseIndex]?.sets[item.setIndex]?.actualWeight}kg × `
                        : '' }}
                    {{ workout.exercises[item.exerciseIndex]?.sets[item.setIndex]?.actualReps }} reps
                  </p>

                  <!-- Current item: edit inputs + done button -->
                  <template v-else-if="currentSupersetItem?.item === item">
                    <div class="flex items-center gap-2 mt-2">
                      <!-- Weight chip -->
                      <button
                        v-if="supersetItemHasWeight"
                        class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-input border border-white/10
                               text-white font-bold text-sm active:scale-95 transition-all"
                        @click="openPicker('weight')"
                      >
                        {{ editingWeight }}<span class="text-text-muted text-xs ml-0.5">kg</span>
                      </button>
                      <span v-if="supersetItemHasWeight" class="text-text-muted text-sm">×</span>

                      <!-- Reps chip -->
                      <button
                        class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-input border border-white/10
                               text-white font-bold text-sm active:scale-95 transition-all"
                        @click="openPicker('reps')"
                      >
                        {{ editingReps }}<span class="text-text-muted text-xs ml-0.5">reps</span>
                      </button>

                      <button
                        class="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-white font-bold text-sm
                               shadow-glow hover:bg-primary-dark active:scale-95 transition-all ml-auto"
                        @click="completeCurrentSet()"
                      >
                        <Check class="w-4 h-4" />
                        Done
                      </button>
                    </div>
                  </template>

                  <!-- Upcoming item: show target -->
                  <p v-else class="text-xs text-text-secondary mt-1">
                    {{ workout.exercises[item.exerciseIndex]?.sets[item.setIndex]?.weight !== null
                        ? `${workout.exercises[item.exerciseIndex]?.sets[item.setIndex]?.weight}kg × `
                        : '' }}
                    {{ workout.exercises[item.exerciseIndex]?.sets[item.setIndex]?.reps }} reps
                  </p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ── Drop set step ── -->
        <template v-else-if="currentStep?.type === 'drop-set' && currentEx">
          <div class="mb-5">
            <div class="flex items-start justify-between gap-3 mb-1">
              <h2 class="text-2xl font-black text-white leading-tight">{{ currentEx.name }}</h2>
              <button
                class="flex-shrink-0 flex items-center gap-1 text-xs text-text-muted px-2.5 py-1.5 rounded-lg
                       bg-white/5 hover:bg-white/10 active:scale-95 transition-all mt-0.5"
                @click="store.skipExercise()"
              >
                <SkipForward class="w-3.5 h-3.5" />
                Skip
              </button>
            </div>
            <p class="text-xs font-bold uppercase tracking-widest text-accent mb-2">↓ Drop set</p>
            <!-- Weight progression display -->
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span
                v-for="(set, si) in currentEx.sets"
                :key="si"
                class="text-sm font-semibold"
                :class="si === (currentStep as any).setIndex ? 'text-white' : set.completed ? 'text-green-400' : 'text-text-muted'"
              >
                {{ set.weight ?? set.targetWeight }}kg<span v-if="si < currentEx.sets.length - 1" class="text-text-muted mx-1">→</span>
              </span>
            </div>
            <p class="text-xs text-text-secondary">
              Drop {{ (currentStep as any).setIndex + 1 }} of {{ currentEx.sets.length }} · to failure
            </p>
          </div>

          <!-- Drop set rows -->
          <div class="flex flex-col gap-2">
            <div
              v-for="(set, si) in currentEx.sets"
              :key="si"
              class="rounded-2xl border p-4 flex items-center gap-3 transition-all"
              :class="set.completed
                ? 'border-green-500/20 bg-green-500/5'
                : si === (currentStep as any).setIndex
                  ? 'border-primary/40 bg-primary/5'
                  : si < (currentStep as any).setIndex
                    ? 'border-white/5 bg-surface-card opacity-50'
                    : 'border-white/5 bg-surface-card opacity-40'"
            >
              <span
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                :class="set.completed ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-text-secondary'"
              >
                <Check v-if="set.completed" class="w-3.5 h-3.5" />
                <span v-else>{{ si + 1 }}</span>
              </span>

              <div class="flex items-center gap-2 flex-1">
                <span class="text-sm font-semibold" :class="set.completed ? 'text-green-400' : 'text-text-secondary'">
                  {{ set.actualWeight ?? set.weight ?? set.targetWeight }}kg
                </span>
                <span class="text-text-muted text-sm">×</span>

                <!-- Current drop: reps input (to failure) -->
                <template v-if="si === (currentStep as any).setIndex && !set.completed">
                  <button
                    class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-input border border-white/10
                           text-white font-bold text-sm active:scale-95 transition-all"
                    @click="openPicker('reps')"
                  >
                    {{ editingReps || '?' }}<span class="text-text-muted text-xs ml-0.5">reps</span>
                  </button>
                  <span class="text-xs text-accent font-medium">to failure</span>
                </template>
                <span v-else class="text-sm font-semibold" :class="set.completed ? 'text-green-400' : 'text-text-secondary'">
                  {{ set.completed ? `${set.actualReps} reps` : 'to failure' }}
                </span>
              </div>

              <button
                v-if="si === (currentStep as any).setIndex && !set.completed"
                class="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-white font-bold text-sm
                       shadow-glow hover:bg-primary-dark active:scale-95 transition-all flex-shrink-0"
                @click="completeCurrentSet()"
              >
                <Check class="w-4 h-4" />
                Done
              </button>
            </div>
          </div>
        </template>

        <!-- ── Normal set step ── -->
        <template v-else-if="currentStep?.type === 'normal-set' && currentEx">
          <!-- Exercise name + muscle tags -->
          <div class="mb-5">
            <div class="flex items-start justify-between gap-3 mb-2">
              <h2 class="text-2xl font-black text-white leading-tight">{{ currentEx.name }}</h2>
              <button
                class="flex-shrink-0 flex items-center gap-1 text-xs text-text-muted px-2.5 py-1.5 rounded-lg
                       bg-white/5 hover:bg-white/10 active:scale-95 transition-all mt-0.5"
                @click="store.skipExercise()"
              >
                <SkipForward class="w-3.5 h-3.5" />
                Skip
              </button>
            </div>
            <MuscleDiagram :exercise-name="currentEx.name" :activity-type="currentEx.activityType" />
          </div>

          <!-- Set rows -->
          <div class="flex flex-col gap-2">
            <!-- Time-based: use SetTimerRow -->
            <template v-if="isTimeBased">
              <div
                v-for="(set, i) in currentEx.sets"
                :key="i"
                class="rounded-2xl border p-3 transition-all"
                :class="set.completed
                  ? 'border-green-500/20 bg-green-500/5'
                  : i === (currentStep as any).setIndex
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-white/5 bg-surface-card opacity-50'"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-text-secondary">
                    {{ i + 1 }}
                  </span>
                  <span v-if="set.completed" class="text-xs text-green-400 font-semibold">Done</span>
                </div>
                <SetTimerRow
                  v-if="!set.completed && i === (currentStep as any).setIndex"
                  :set-index="i"
                  :duration="set.duration"
                  :completed="set.completed"
                  :is-current="true"
                  @complete="(d) => completeCurrentSet(d)"
                />
              </div>
            </template>

            <!-- Repetition / distance sets -->
            <template v-else>
              <div
                v-for="(set, i) in currentEx.sets"
                :key="i"
                class="rounded-2xl border p-4 flex items-center gap-3 transition-all"
                :class="set.completed
                  ? 'border-green-500/20 bg-green-500/5'
                  : i === (currentStep as any).setIndex
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-white/5 bg-surface-card opacity-40'"
              >
                <span
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  :class="set.completed ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-text-secondary'"
                >
                  <Check v-if="set.completed" class="w-3.5 h-3.5" />
                  <span v-else>{{ i + 1 }}</span>
                </span>

                <div class="flex items-center gap-2 flex-1">
                  <!-- Weight chip -->
                  <button
                    v-if="hasWeight && !set.completed && i === (currentStep as any).setIndex"
                    class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-input border border-white/10
                           text-white font-bold text-sm active:scale-95 transition-all"
                    @click="openPicker('weight')"
                  >
                    {{ i === (currentStep as any).setIndex ? editingWeight : (set.weight ?? 0) }}
                    <span class="text-text-muted text-xs">kg</span>
                  </button>
                  <span
                    v-else-if="hasWeight"
                    class="text-sm font-semibold"
                    :class="set.completed ? 'text-green-400' : 'text-text-secondary'"
                  >{{ set.actualWeight ?? set.weight ?? 0 }}kg</span>

                  <span v-if="hasWeight" class="text-text-muted text-sm">×</span>

                  <!-- Reps chip -->
                  <button
                    v-if="!set.completed && i === (currentStep as any).setIndex"
                    class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-input border border-white/10
                           text-white font-bold text-sm active:scale-95 transition-all"
                    @click="openPicker('reps')"
                  >
                    {{ editingReps }}
                    <span class="text-text-muted text-xs">reps</span>
                  </button>
                  <span
                    v-else
                    class="text-sm font-semibold"
                    :class="set.completed ? 'text-green-400' : 'text-text-secondary'"
                  >{{ set.actualReps ?? set.reps ?? 0 }} reps</span>
                </div>

                <!-- Done button -->
                <button
                  v-if="!set.completed && i === (currentStep as any).setIndex"
                  class="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary text-white font-bold text-sm
                         shadow-glow hover:bg-primary-dark active:scale-95 transition-all flex-shrink-0"
                  @click="completeCurrentSet()"
                >
                  <Check class="w-4 h-4" />
                  Done
                </button>
              </div>
            </template>
          </div>

          <!-- Up next hint -->
          <div
            v-if="workout.currentStepIndex < workout.steps.length - 1"
            class="mt-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-card border border-white/5"
          >
            <Dumbbell class="w-4 h-4 text-text-muted flex-shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-text-muted font-semibold uppercase tracking-widest">Up next</p>
              <p class="text-sm text-white font-semibold truncate">
                {{
                  (() => {
                    const next = workout.steps[workout.currentStepIndex + 1]
                    if (!next) return ''
                    if (next.type === 'normal-set' || next.type === 'drop-set') {
                      return workout.exercises[next.exerciseIndex]?.name ?? ''
                    }
                    if (next.type === 'superset-round') {
                      return next.items.map(i => workout!.exercises[i.exerciseIndex]?.name).join(' + ')
                    }
                    return ''
                  })()
                }}
              </p>
            </div>
          </div>
        </template>

      </div>
    </template>

    <!-- Overlays -->
    <RestTimerOverlay />

    <BottomSheetPicker
      v-if="pickerField === 'reps'"
      :model-value="editingReps"
      unit="reps"
      label="Reps"
      :step="1"
      :min="0"
      @update:model-value="updatePickerValue"
      @close="pickerField = null"
    />

    <BottomSheetPicker
      v-if="pickerField === 'weight'"
      :model-value="editingWeight"
      unit="kg"
      label="Weight"
      :step="2.5"
      :min="0"
      @update:model-value="updatePickerValue"
      @close="pickerField = null"
    />

    <ConfirmDialog
      :open="confirmFinish"
      title="Finish Workout"
      message="Mark this workout as complete and save it?"
      confirm-label="Finish"
      @confirm="finish"
      @cancel="confirmFinish = false"
    />

  </ActiveWorkoutLayout>
</template>

<style scoped>
.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
</style>
