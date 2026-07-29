<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircle, Zap, Timer, MoveRight, Flower } from 'lucide-vue-next'
import { useChallengeStore } from '../stores/challengeStore'
import type { Component } from 'vue'
import confetti from 'canvas-confetti'

const store = useChallengeStore()
const marking = ref(false)

const typeIcon: Record<string, Component> = {
  reps: Zap,
  duration: Timer,
  distance: MoveRight,
  flexibility: Flower,
}

async function markDone() {
  if (store.completedToday || marking.value) return
  marking.value = true
  await store.logChallenge()
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#00C896', '#00A67A', '#E6FAF4', '#ffffff'],
    gravity: 1.2,
    scalar: 0.85,
  })
  marking.value = false
}
</script>

<template>
  <div
    class="rounded-2xl border p-5 transition-all duration-500"
    :class="store.completedToday
      ? 'bg-primary/15 border-primary/40 shadow-glow'
      : 'bg-surface-card border-white/5'"
  >
    <!-- Header -->
    <div class="flex items-center gap-2 mb-3">
      <component
        :is="typeIcon[store.todayChallenge.type] ?? Zap"
        class="w-4 h-4 flex-shrink-0 transition-colors"
        :class="store.completedToday ? 'text-primary' : 'text-text-muted'"
      />
      <p class="text-xs font-bold tracking-widest uppercase"
        :class="store.completedToday ? 'text-primary' : 'text-text-muted'">
        Daily Challenge
      </p>
    </div>

    <!-- Content -->
    <p class="text-lg font-bold text-white mb-4 leading-snug">
      {{ store.todayChallenge.description }}
    </p>

    <!-- Done state -->
    <Transition name="challenge-done">
      <div v-if="store.completedToday" class="flex items-center gap-2 text-primary font-semibold">
        <CheckCircle class="w-5 h-5" />
        <span>Done! Great work today.</span>
      </div>
      <button
        v-else
        class="w-full h-11 rounded-xl font-bold text-sm transition-all active:scale-[0.97]"
        :class="marking
          ? 'bg-primary/30 text-primary cursor-wait'
          : 'bg-surface-elevated border border-white/10 text-white hover:border-primary/30 hover:bg-primary/10'"
        :disabled="marking"
        @click="markDone"
      >
        <span v-if="marking" class="flex items-center justify-center gap-2">
          <span class="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Logging…
        </span>
        <span v-else>Mark Done</span>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.challenge-done-enter-active,
.challenge-done-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.challenge-done-enter-from { opacity: 0; transform: translateY(6px); }
.challenge-done-leave-to { opacity: 0; transform: translateY(-6px); position: absolute; }
</style>
