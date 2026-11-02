<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Play, Pause, Square } from '@lucide/vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import { useEmomTimer, requestNotificationPermission } from '../../composables/useEmomTimer'

const router = useRouter()
const rounds = ref(8)
const delay = ref(10)

const timer = useEmomTimer()

const phaseLabel = computed(() => {
  if (timer.phase.value === 'work') return 'Work'
  if (timer.phase.value === 'rest') return 'Rest'
  return ''
})

const roundLabel = computed(() => {
  if (timer.phase.value === 'work') return `Round ${timer.currentRound.value} of ${rounds.value}`
  if (timer.phase.value === 'rest') return `Round ${timer.currentRound.value + 1} of ${rounds.value} coming up`
  return ''
})

const formattedTime = computed(() => {
  const s = timer.secondsLeft.value
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
})

async function handleStart() {
  await requestNotificationPermission()
  timer.start(rounds.value, delay.value)
}

function handleStop() {
  timer.stop()
}

function handleTogglePause() {
  if (timer.isPaused.value) timer.resume()
  else timer.pause()
}
</script>

<template>
  <AppLayout>
    <div class="max-w-md mx-auto">
      <!-- Back + title -->
      <div class="pt-2 pb-8 flex items-center gap-3">
        <button
          class="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted
                 hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary transition-colors"
          @click="router.push('/tools')"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted">Tools</p>
          <h1 class="text-2xl font-black text-text-primary dark:text-white leading-tight">EMOM Timer</h1>
        </div>
      </div>

      <!-- Setup state -->
      <div v-if="timer.phase.value === 'idle'" class="flex flex-col gap-6">
        <div class="bg-surface-card border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
          <!-- Rounds -->
          <div>
            <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-2">
              Number of rounds
            </label>
            <input
              v-model.number="rounds"
              type="number"
              min="1"
              max="60"
              class="w-full h-12 px-4 bg-surface-input border border-white/8 rounded-xl text-base
                     font-semibold text-text-primary dark:text-white outline-none
                     focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
            />
          </div>

          <!-- Delay -->
          <div>
            <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-2">
              Rest between rounds (seconds)
            </label>
            <input
              v-model.number="delay"
              type="number"
              min="1"
              max="30"
              class="w-full h-12 px-4 bg-surface-input border border-white/8 rounded-xl text-base
                     font-semibold text-text-primary dark:text-white outline-none
                     focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
            />
          </div>
        </div>

        <button
          class="w-full h-14 bg-primary text-white font-bold text-base rounded-2xl
                 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-glow"
          @click="handleStart"
        >
          Start
        </button>
      </div>

      <!-- Running state -->
      <div v-else-if="timer.phase.value === 'work' || timer.phase.value === 'rest'" class="flex flex-col items-center gap-8">
        <!-- Phase badge -->
        <div
          class="px-5 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase transition-colors"
          :class="timer.phase.value === 'work'
            ? 'bg-primary/20 text-primary'
            : 'bg-amber-500/20 text-amber-400'"
        >
          {{ phaseLabel }}
        </div>

        <!-- Countdown -->
        <div class="relative flex items-center justify-center w-64 h-64">
          <div
            class="absolute inset-0 rounded-full border-4 transition-colors"
            :class="timer.phase.value === 'work' ? 'border-primary/20' : 'border-amber-500/20'"
          />
          <span class="text-7xl font-black tabular-nums text-text-primary dark:text-white tracking-tight">
            {{ formattedTime }}
          </span>
        </div>

        <!-- Round label -->
        <p class="text-sm font-semibold text-text-muted text-center">{{ roundLabel }}</p>

        <!-- Controls -->
        <div class="flex items-center gap-4 w-full">
          <button
            class="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl font-bold text-sm
                   transition-all active:scale-[0.97]"
            :class="timer.isPaused.value
              ? 'bg-primary text-white hover:bg-primary/90 shadow-glow'
              : 'bg-surface-card border border-white/8 text-text-primary dark:text-white hover:border-white/20'"
            @click="handleTogglePause"
          >
            <component :is="timer.isPaused.value ? Play : Pause" class="w-5 h-5" />
            {{ timer.isPaused.value ? 'Resume' : 'Pause' }}
          </button>

          <button
            class="w-14 h-14 flex items-center justify-center rounded-2xl bg-surface-card border border-white/8
                   text-text-muted hover:border-red-500/40 hover:text-red-400 active:scale-[0.97] transition-all"
            @click="handleStop"
          >
            <Square class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Complete state -->
      <div v-else-if="timer.phase.value === 'complete'" class="flex flex-col items-center gap-8 pt-8">
        <div class="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <span class="text-4xl">🏁</span>
        </div>

        <div class="text-center">
          <h2 class="text-2xl font-black text-text-primary dark:text-white mb-2">Workout complete!</h2>
          <p class="text-text-muted text-sm">
            {{ rounds }} round{{ rounds !== 1 ? 's' : '' }} finished
          </p>
        </div>

        <div class="flex flex-col gap-3 w-full">
          <button
            class="w-full h-14 bg-primary text-white font-bold text-base rounded-2xl
                   hover:bg-primary/90 active:scale-[0.98] transition-all shadow-glow"
            @click="handleStart"
          >
            Start again
          </button>
          <button
            class="w-full h-12 bg-surface-card border border-white/8 text-text-muted font-semibold
                   text-sm rounded-2xl hover:border-white/20 hover:text-text-primary active:scale-[0.98] transition-all"
            @click="timer.stop()"
          >
            Change settings
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
