<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Trophy, Share2, ArrowRight } from 'lucide-vue-next'
import WorkoutShareCard from './WorkoutShareCard.vue'
import type { WorkoutHistoryOut } from '../types'
import confetti from 'canvas-confetti'

const props = defineProps<{
  historyItem: WorkoutHistoryOut
}>()

const emit = defineEmits<{ done: [] }>()

const isSharing = ref(false)

function fmtDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m`
  return `${m}m`
}

onMounted(() => {
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#FF6B35', '#FFFFFF', '#FFD700'] })
  setTimeout(() => confetti({ particleCount: 60, spread: 50, origin: { x: 0.2, y: 0.4 } }), 300)
  setTimeout(() => confetti({ particleCount: 60, spread: 50, origin: { x: 0.8, y: 0.4 } }), 500)
})

async function share() {
  isSharing.value = true
  try {
    const html2canvas = (await import('html2canvas')).default
    const el = document.getElementById('workout-share-card')
    if (!el) return
    const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 })
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], 'workout.png', { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Workout complete!' })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'workout.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    }, 'image/png')
  } finally {
    isSharing.value = false
  }
}
</script>

<template>
  <div class="workout-complete flex flex-col items-center justify-center min-h-[80dvh] gap-8 px-4 text-center">
    <!-- Trophy icon -->
    <div class="w-24 h-24 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
      <Trophy class="w-12 h-12 text-primary" />
    </div>

    <!-- Headline -->
    <div>
      <p class="text-xs font-bold tracking-widest uppercase text-primary mb-2">Workout complete</p>
      <h1 class="text-4xl font-black text-white leading-tight mb-2">
        {{ historyItem.name ?? historyItem.sourceWorkout?.name ?? 'Great work!' }}
      </h1>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-3 gap-3 w-full max-w-sm">
      <div class="bg-surface-card border border-white/5 rounded-2xl p-4">
        <p class="text-2xl font-black text-primary">{{ fmtDuration(historyItem.durationSeconds) }}</p>
        <p class="text-xs text-text-muted font-semibold uppercase tracking-wide mt-1">Time</p>
      </div>
      <div class="bg-surface-card border border-white/5 rounded-2xl p-4">
        <p class="text-2xl font-black text-primary">{{ historyItem.completedSets }}</p>
        <p class="text-xs text-text-muted font-semibold uppercase tracking-wide mt-1">Sets</p>
      </div>
      <div class="bg-surface-card border border-white/5 rounded-2xl p-4">
        <p class="text-2xl font-black text-primary">{{ (historyItem.excercises ?? []).length }}</p>
        <p class="text-xs text-text-muted font-semibold uppercase tracking-wide mt-1">Exercises</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex flex-col gap-3 w-full max-w-sm">
      <button
        class="w-full h-14 bg-primary text-white font-bold text-base rounded-xl
               shadow-glow flex items-center justify-center gap-2
               hover:bg-primary-dark active:scale-[0.97] transition-all"
        @click="emit('done')"
      >
        See Progress
        <ArrowRight class="w-5 h-5" />
      </button>

      <button
        class="w-full h-12 bg-white/10 text-white font-semibold text-sm rounded-xl
               flex items-center justify-center gap-2
               hover:bg-white/15 active:scale-[0.97] transition-all"
        :disabled="isSharing"
        @click="share"
      >
        <Share2 class="w-4 h-4" />
        {{ isSharing ? 'Preparing…' : 'Share Workout' }}
      </button>
    </div>
  </div>

  <!-- Off-screen share card for html2canvas -->
  <WorkoutShareCard :history-item="historyItem" />
</template>

<style scoped>
.workout-complete {
  transition: opacity 400ms 80ms cubic-bezier(0.23, 1, 0.32, 1), transform 400ms 80ms cubic-bezier(0.23, 1, 0.32, 1);
  @starting-style {
    opacity: 0;
    transform: scale(0.95) translateY(12px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .workout-complete {
    transition: opacity 200ms 80ms ease !important;
    @starting-style { opacity: 0; transform: none; }
  }
}
</style>
