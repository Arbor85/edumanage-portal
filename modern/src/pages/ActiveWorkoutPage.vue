<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Pause, Play, X, Check, ChevronLeft, Dumbbell, SkipForward } from 'lucide-vue-next'
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

// ── Derived ───────────────────────────────────────────────
const workout = computed(() => store.activeWorkout)
const currentEx = computed(() =>
  workout.value?.exercises[workout.value.currentExerciseIndex] ?? null
)
const currentSet = computed(() =>
  currentEx.value?.sets[workout.value?.currentSetIndex ?? 0] ?? null
)
const isTimeBased = computed(() => currentEx.value?.activityTrackType === 'time')
const hasWeight = computed(() =>
  currentEx.value?.activityType === 'weighted' || currentEx.value?.activityType === 'machine'
)

const elapsed = computed(() => {
  const s = store.elapsedSeconds
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
})

// Sync editor values when current set changes
watch(
  currentSet,
  (set) => {
    if (!set) return
    editingReps.value = set.reps ?? 0
    editingWeight.value = set.weight ?? 0
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
  const ex = currentEx.value
  if (!ex) return

  const reps = ex.activityTrackType === 'repetitions' ? editingReps.value : null
  const weight = hasWeight.value ? editingWeight.value : null

  store.completeSet(reps, weight, undefined, actualDuration ?? null)

  if (ex.activityType !== 'cardio') {
    store.startRest(90)
  }
}

async function finish() {
  isFinishing.value = true
  confirmFinish.value = false

  // Snapshot key values before finishWorkout clears state
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
              : i === workout.currentExerciseIndex
                ? 'bg-primary text-white shadow-glow'
                : i < workout.currentExerciseIndex
                  ? 'bg-white/5 text-text-muted'
                  : 'bg-surface-card border border-white/10 text-text-secondary'
          ]"
        >
          {{ ex.name }}
        </button>
      </div>

      <!-- Main content: current exercise -->
      <div class="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full">
        <template v-if="currentEx">
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
                  : i === (workout.currentSetIndex ?? 0)
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
                  v-if="!set.completed && i === (workout.currentSetIndex ?? 0)"
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
                  : i === (workout.currentSetIndex ?? 0)
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-white/5 bg-surface-card opacity-40'"
              >
                <!-- Set number -->
                <span
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  :class="set.completed ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-text-secondary'"
                >
                  <Check v-if="set.completed" class="w-3.5 h-3.5" />
                  <span v-else>{{ i + 1 }}</span>
                </span>

                <!-- Values -->
                <div class="flex items-center gap-2 flex-1">
                  <!-- Weight chip (weighted exercises only) -->
                  <button
                    v-if="hasWeight && !set.completed && i === (workout.currentSetIndex ?? 0)"
                    class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-input border border-white/10
                           text-white font-bold text-sm active:scale-95 transition-all"
                    @click="openPicker('weight')"
                  >
                    {{ i === (workout.currentSetIndex ?? 0) ? editingWeight : (set.weight ?? 0) }}
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
                    v-if="!set.completed && i === (workout.currentSetIndex ?? 0)"
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

                <!-- Done button (current set only) -->
                <button
                  v-if="!set.completed && i === (workout.currentSetIndex ?? 0)"
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

          <!-- Next exercise hint -->
          <div
            v-if="workout.currentExerciseIndex < workout.exercises.length - 1"
            class="mt-6 flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-card border border-white/5"
          >
            <Dumbbell class="w-4 h-4 text-text-muted flex-shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-text-muted font-semibold uppercase tracking-widest">Up next</p>
              <p class="text-sm text-white font-semibold truncate">
                {{ workout.exercises[workout.currentExerciseIndex + 1]?.name }}
              </p>
            </div>
          </div>
        </template>

        <!-- All exercises done -->
        <div v-else class="text-center py-12">
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
