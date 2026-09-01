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
  const step = workout.steps?.[workout.currentStepIndex]
  if (!step) return workout.routineName ?? 'Workout'
  if (step.type === 'normal-set' || step.type === 'drop-set') {
    return workout.exercises[step.exerciseIndex]?.name ?? workout.routineName ?? 'Workout'
  }
  if (step.type === 'superset-round') {
    return step.items.map(i => workout.exercises[i.exerciseIndex]?.name).filter(Boolean).join(' + ')
  }
  return workout.routineName ?? 'Workout'
})
</script>

<template>
  <Transition name="pill">
    <button
      v-if="workoutStore.activeWorkout"
      class="lg:hidden fixed bottom-[72px] left-1/2 -translate-x-1/2 z-50
             flex items-center gap-2.5 px-4 py-3
             bg-primary text-white rounded-full shadow-glow
             text-sm font-semibold whitespace-nowrap
             active:scale-[0.95] hover:bg-primary-dark hover:shadow-glow
             transition-all duration-150"
      @click="router.push('/workout/active')"
    >
      <span class="w-2 h-2 rounded-full bg-white/90 animate-pulse flex-shrink-0" />
      <Dumbbell class="w-4 h-4 flex-shrink-0" />
      <span class="max-w-[140px] truncate">{{ exerciseName }}</span>
      <span class="font-mono tabular-nums text-white/80 text-xs">{{ elapsed }}</span>
    </button>
  </Transition>
</template>

<style scoped>
.pill-enter-active {
  transition: opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1), transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
.pill-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}
.pill-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(16px) scale(0.9);
}
.pill-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px) scale(0.95);
}

@media (prefers-reduced-motion: reduce) {
  .pill-enter-active, .pill-leave-active {
    transition: opacity 0.15s ease !important;
  }
  .pill-enter-from, .pill-leave-to {
    transform: translateX(-50%) !important;
  }
}
</style>
