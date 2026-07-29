<script setup lang="ts">
import { computed } from 'vue'
import { SkipForward } from 'lucide-vue-next'
import { useWorkoutStore } from '../stores/workoutStore'

const store = useWorkoutStore()

const RADIUS = 72
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const progress = computed(() => {
  if (!store.restTotalSeconds || !store.restSecondsLeft) return 0
  return store.restSecondsLeft / store.restTotalSeconds
})

const dashOffset = computed(() => CIRCUMFERENCE * (1 - progress.value))
</script>

<template>
  <Teleport to="body">
    <Transition name="rest-overlay">
      <div
        v-if="store.isResting"
        class="fixed inset-0 z-50 bg-surface-page/95 backdrop-blur-md flex flex-col items-center justify-center gap-8"
      >
        <!-- Circular countdown -->
        <div class="relative">
          <svg width="180" height="180" class="-rotate-90">
            <!-- Track -->
            <circle
              cx="90" cy="90" :r="RADIUS"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              stroke-width="8"
            />
            <!-- Progress -->
            <circle
              cx="90" cy="90" :r="RADIUS"
              fill="none"
              stroke="#FF6B35"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="CIRCUMFERENCE"
              :stroke-dashoffset="dashOffset"
              style="transition: stroke-dashoffset 1s linear"
            />
          </svg>

          <!-- Center content -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-5xl font-black tabular-nums text-white">{{ store.restSecondsLeft }}</span>
            <span class="text-xs font-bold tracking-widest uppercase text-text-muted mt-1">Rest</span>
          </div>
        </div>

        <!-- Label -->
        <div class="text-center">
          <p class="text-xl font-black text-white mb-1">Take a breather</p>
          <p class="text-sm text-text-secondary">Next set in {{ store.restSecondsLeft }}s</p>
        </div>

        <!-- Skip -->
        <button
          class="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white font-semibold
                 hover:bg-white/20 active:scale-[0.97] transition-all"
          @click="store.skipRest()"
        >
          <SkipForward class="w-4 h-4" />
          Skip Rest
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.rest-overlay-enter-active,
.rest-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.rest-overlay-enter-from,
.rest-overlay-leave-to {
  opacity: 0;
}
</style>
