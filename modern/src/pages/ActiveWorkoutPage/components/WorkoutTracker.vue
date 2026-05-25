<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useWorkoutStore } from '../../../stores/workoutStore'
import { useRouter } from 'vue-router'
import ActiveExerciseCard from './ActiveExerciseCard.vue'
import WorkoutExerciseQueue from './WorkoutExerciseQueue.vue'
import BaseButton from '../../../components/BaseButton.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import ExerciseSetupDialog from '../../../components/ExerciseSetupDialog.vue'
import { Timer, Play, Pause, Pencil } from 'lucide-vue-next'

const store = useWorkoutStore()
const router = useRouter()
const confirmFinish = ref(false)

const editingIndex = ref<number | null>(null)

const editingExercise = computed(() => {
  if (editingIndex.value === null) return null
  return store.activeWorkout?.exercises[editingIndex.value] ?? null
})

function openEdit(i: number) {
  editingIndex.value = i
}

function onEditConfirm(sets: { reps: number | null; weight: number | null }[]) {
  if (editingIndex.value === null) return
  store.updateExerciseSets(editingIndex.value, sets)
  editingIndex.value = null
}

const elapsed = computed(() => {
  const s = store.elapsedSeconds
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
})

let timer: ReturnType<typeof setInterval>
onMounted(() => {
  timer = setInterval(() => {
    if (store.activeWorkout && !store.activeWorkout.paused) {
      store.activeWorkout.elapsedSeconds = (store.activeWorkout.elapsedSeconds ?? 0) + 1
    }
  }, 1000)
})
onUnmounted(() => clearInterval(timer))

async function finish() {
  await store.finishWorkout()
  router.push('/history')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Toolbar -->
    <div class="flex items-center gap-3">
      <p class="text-text-secondary text-sm font-mono tabular-nums flex-1 flex items-center gap-1.5"><Timer class="w-4 h-4" /> {{ elapsed }}</p>
      <BaseButton size="sm" variant="ghost" @click="store.activeWorkout?.paused ? store.resumeWorkout() : store.pauseWorkout()">
        <Play v-if="store.activeWorkout?.paused" class="w-4 h-4" /> <Pause v-else class="w-4 h-4" />
        {{ store.activeWorkout?.paused ? 'Resume' : 'Pause' }}
      </BaseButton>
      <BaseButton size="sm" variant="danger" @click="confirmFinish = true">Finish</BaseButton>
    </div>

    <!-- Main layout: sidebar + active exercise -->
    <div class="flex gap-3 items-start">
      <!-- Left sidebar: exercise queue with progress -->
      <div class="w-36 flex-shrink-0 flex flex-col gap-1 overflow-y-auto max-h-[70dvh] custom-scrollbar">
        <div
          v-for="(ex, i) in store.activeWorkout?.exercises ?? []"
          :key="i"
          class="group flex flex-col gap-1 px-2 py-2 rounded-xl transition-colors"
          :class="[
            i === store.activeWorkout?.currentExerciseIndex
              ? 'bg-primary/10 dark:bg-primary/20'
              : ex.skipped
                ? 'opacity-40'
                : 'opacity-60 hover:opacity-80'
          ]"
        >
          <div class="flex items-start gap-1">
            <p
              class="text-xs font-medium leading-tight truncate flex-1"
              :class="i === store.activeWorkout?.currentExerciseIndex ? 'text-primary' : 'text-text-primary dark:text-white'"
            >{{ ex.name }}</p>
            <button
              class="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-text-secondary hover:text-primary flex-shrink-0"
              @click.stop="openEdit(i)"
            >
              <Pencil class="w-3 h-3" />
            </button>
          </div>
          <div class="flex flex-wrap gap-0.5">
            <span
              v-for="(set, si) in ex.sets"
              :key="si"
              class="w-2 h-2 rounded-full"
              :class="set.completed ? 'bg-green-500' : i === store.activeWorkout?.currentExerciseIndex && si === ex.currentSetIndex ? 'bg-primary' : 'bg-gray-300 dark:bg-white/20'"
            />
          </div>
        </div>
      </div>

      <!-- Right: current exercise only -->
      <div class="flex-1 flex flex-col gap-3 min-w-0">
        <ActiveExerciseCard
          v-if="store.activeWorkout?.exercises[store.activeWorkout.currentExerciseIndex]"
          :exercise="store.activeWorkout.exercises[store.activeWorkout.currentExerciseIndex]"
          :is-current="true"
        />
        <WorkoutExerciseQueue />
      </div>
    </div>

    <ExerciseSetupDialog
      :open="editingIndex !== null"
      :exercise-name="editingExercise?.name ?? ''"
      :is-bodyweight="editingExercise?.isBodyweight"
      :initial-sets="editingExercise?.sets.map(s => ({ reps: s.reps, weight: s.weight }))"
      @confirm="onEditConfirm"
      @close="editingIndex = null"
    />

    <ConfirmDialog
      :open="confirmFinish"
      title="Finish Workout"
      message="Mark this workout as complete and save it?"
      confirm-label="Finish"
      @confirm="finish"
      @cancel="confirmFinish = false"
    />
  </div>
</template>
