<script setup lang="ts">
import { useWorkoutStore } from '../../../stores/workoutStore'
import { useRouter } from 'vue-router'
import BaseButton from '../../../components/BaseButton.vue'
import { Dumbbell, ArrowRight } from 'lucide-vue-next'

const store = useWorkoutStore()
const router = useRouter()
</script>

<template>
  <Transition name="banner">
    <div
      v-if="store.activeWorkout"
      class="bg-primary rounded-2xl p-4 flex items-center gap-4 text-white cursor-pointer hover:bg-primary-dark transition-all duration-150 shadow-glow active:scale-[0.99]"
      @click="router.push('/workout/active')"
    >
      <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
        <Dumbbell class="w-5 h-5" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-bold tracking-tight">Active workout</p>
        <p class="text-sm opacity-80 truncate">{{ store.activeWorkout.routineName ?? 'Workout' }} in progress</p>
      </div>
      <div class="flex items-center gap-1 text-sm font-semibold opacity-90 flex-shrink-0">
        <span>Continue</span>
        <ArrowRight class="w-4 h-4" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.banner-enter-active {
  transition: opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1), transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
.banner-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}
.banner-enter-from, .banner-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .banner-enter-active, .banner-leave-active { transition: opacity 0.15s ease !important; }
  .banner-enter-from, .banner-leave-to { transform: none !important; }
}
</style>
