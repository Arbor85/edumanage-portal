<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useWorkoutStore } from '../../../stores/workoutStore'
import { useRouter } from 'vue-router'
import ActiveExerciseCard from './ActiveExerciseCard.vue'
import WorkoutExerciseQueue from './WorkoutExerciseQueue.vue'
import BaseButton from '../../../components/BaseButton.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'

const store = useWorkoutStore()
const router = useRouter()
const confirmFinish = ref(false)

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
      <p class="text-text-secondary text-sm font-mono tabular-nums flex-1">⏱ {{ elapsed }}</p>
      <BaseButton size="sm" variant="ghost" @click="store.activeWorkout?.paused ? store.resumeWorkout() : store.pauseWorkout()">
        {{ store.activeWorkout?.paused ? '▶ Resume' : '⏸ Pause' }}
      </BaseButton>
      <BaseButton size="sm" variant="danger" @click="confirmFinish = true">Finish</BaseButton>
    </div>

    <!-- Exercise cards -->
    <div class="flex flex-col gap-3 custom-scrollbar overflow-y-auto max-h-[60vh]">
      <ActiveExerciseCard
        v-for="(ex, i) in store.activeWorkout?.exercises ?? []"
        :key="i"
        :exercise="ex"
        :is-current="i === store.activeWorkout?.currentExerciseIndex"
      />
    </div>

    <WorkoutExerciseQueue />

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
