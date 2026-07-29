<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutStore } from '../stores/workoutStore'
import { Dumbbell } from 'lucide-vue-next'

const router = useRouter()
const workoutStore = useWorkoutStore()

const elapsed = computed(() => {
  const s = workoutStore.elapsedSeconds
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
})

const exerciseName = computed(() => {
  const workout = workoutStore.activeWorkout
  if (!workout) return ''
  const current = workout.exercises[workout.currentExerciseIndex]
  return current?.name ?? workout.routineName ?? 'Workout'
})
</script>

<template>
  <Transition name="pill">
    <button
      v-if="workoutStore.activeWorkout"
      class="lg:hidden fixed bottom-[72px] left-1/2 -translate-x-1/2 z-50
             flex items-center gap-2.5 px-4 py-2.5
             bg-primary text-white rounded-full shadow-glow
             text-sm font-semibold whitespace-nowrap
             active:scale-[0.97] transition-transform"
      @click="router.push('/workout/active')"
    >
      <span class="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
      <Dumbbell class="w-4 h-4 flex-shrink-0" />
      <span class="max-w-[140px] truncate">{{ exerciseName }}</span>
      <span class="font-mono text-white/80">{{ elapsed }}</span>
    </button>
  </Transition>
</template>

<style scoped>
.pill-enter-active,
.pill-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.pill-enter-from,
.pill-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }
</style>
