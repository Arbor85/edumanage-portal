<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Square, RotateCcw, Pause } from '@lucide/vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import { useEmomTimer, requestNotificationPermission, emomWorkDuration } from '../../composables/useEmomTimer'

const router = useRouter()
const rounds  = ref(20)
const delay   = ref(5)
const workDur = ref(60)

const timer = useEmomTimer()

// SVG geometry constants (viewBox 0 0 280 280, center 140,140)
const RING_R        = 120
const FILL_R        = 108
const CIRCUMFERENCE = 2 * Math.PI * RING_R
const FILL_BOTTOM   = 140 + FILL_R
const FILL_DIAMETER = FILL_R * 2

const progress = computed(() => {
  if (timer.phase.value === 'work') return (emomWorkDuration.value - timer.secondsLeft.value) / emomWorkDuration.value
  if (timer.phase.value === 'rest') return (delay.value - timer.secondsLeft.value) / delay.value
  return 0
})

const fillY            = computed(() => FILL_BOTTOM - progress.value * FILL_DIAMETER)
const fillHeight       = computed(() => Math.max(0, progress.value * FILL_DIAMETER))
const strokeDashoffset = computed(() => CIRCUMFERENCE * (1 - progress.value))

const isWork      = computed(() => timer.phase.value === 'work')
const isRunning   = computed(() => timer.phase.value === 'work' || timer.phase.value === 'rest')
const isLastThree = computed(() => isRunning.value && timer.secondsLeft.value <= 3)

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

// Slider fill percentages
const roundsPct  = computed(() => ((rounds.value - 1)   / (50 - 1))   * 100)
const workDurPct = computed(() => ((workDur.value - 30) / (360 - 30)) * 100)
const delayPct   = computed(() => ((delay.value - 3)    / (30 - 3))   * 100)

// ── Wake Lock ─────────────────────────────────────────────────────────────────

let wakeLock: WakeLockSentinel | null = null

async function acquireWakeLock() {
  if (!('wakeLock' in navigator)) return
  try { wakeLock = await navigator.wakeLock.request('screen') } catch { /* denied */ }
}

function releaseWakeLock() {
  wakeLock?.release().catch(() => {})
  wakeLock = null
}

onMounted(() => {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isRunning.value && !timer.isPaused.value) acquireWakeLock()
  })
  if (isRunning.value && !timer.isPaused.value) acquireWakeLock()
})

onUnmounted(() => releaseWakeLock())

watch([() => timer.phase.value, () => timer.isPaused.value], ([phase, paused]) => {
  if ((phase === 'work' || phase === 'rest') && !paused) acquireWakeLock()
  else releaseWakeLock()
})

// ── Actions ───────────────────────────────────────────────────────────────────

async function handleStart() {
  await requestNotificationPermission()
  timer.start(rounds.value, delay.value, workDur.value)
}
</script>

<template>
  <AppLayout>

    <!-- ── Idle: setup form ────────────────────────────────────────────────── -->
    <div v-if="timer.phase.value === 'idle'" class="max-w-md mx-auto px-4">
      <div class="pt-2 pb-8 flex items-center gap-3">
        <button
          class="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted
                 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          @click="router.push('/tools')"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted">Tools</p>
          <h1 class="text-2xl font-black text-text-primary dark:text-white leading-tight">EMOM</h1>
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <div class="bg-surface-card border border-white/8 rounded-2xl p-6 flex flex-col gap-8">

          <!-- Rounds -->
          <div>
            <div class="flex items-baseline justify-between mb-4">
              <span class="text-sm font-semibold text-text-primary dark:text-white">Rounds</span>
              <span class="text-2xl font-black text-primary tabular-nums">{{ rounds }}</span>
            </div>
            <input v-model.number="rounds" type="range" min="1" max="50" step="1"
              class="emom-slider w-full" :style="{ '--pct': `${roundsPct}%` }" />
            <div class="flex justify-between mt-1.5">
              <span class="text-xs text-text-muted">1</span>
              <span class="text-xs text-text-muted">50</span>
            </div>
          </div>

          <!-- Work duration -->
          <div>
            <div class="flex items-baseline justify-between mb-4">
              <span class="text-sm font-semibold text-text-primary dark:text-white">Work duration</span>
              <span class="text-2xl font-black text-primary tabular-nums">{{ workDur }}s</span>
            </div>
            <input v-model.number="workDur" type="range" min="30" max="360" step="5"
              class="emom-slider w-full" :style="{ '--pct': `${workDurPct}%` }" />
            <div class="flex justify-between mt-1.5">
              <span class="text-xs text-text-muted">30 s</span>
              <span class="text-xs text-text-muted">6 min</span>
            </div>
          </div>

          <!-- Rest -->
          <div>
            <div class="flex items-baseline justify-between mb-4">
              <span class="text-sm font-semibold text-text-primary dark:text-white">Rest between rounds</span>
              <span class="text-2xl font-black text-primary tabular-nums">{{ delay }}s</span>
            </div>
            <input v-model.number="delay" type="range" min="3" max="30" step="1"
              class="emom-slider w-full" :style="{ '--pct': `${delayPct}%` }" />
            <div class="flex justify-between mt-1.5">
              <span class="text-xs text-text-muted">3 s</span>
              <span class="text-xs text-text-muted">30 s</span>
            </div>
          </div>

        </div>

        <p class="text-xs text-text-muted text-center">
          {{ rounds }} rounds · {{ workDur }}s work · {{ delay }}s rest ·
          ~{{ Math.ceil((rounds * workDur + (rounds - 1) * delay) / 60) }} min total
        </p>

        <button
          class="w-full h-14 bg-primary text-white font-bold text-base rounded-2xl
                 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-glow"
          @click="handleStart"
        >
          Start
        </button>
      </div>
    </div>

    <!-- placeholder so v-if/v-else-if chain works inside AppLayout -->
    <div v-else-if="isRunning" />

    <!-- ── Complete ────────────────────────────────────────────────────────── -->
    <div v-else-if="timer.phase.value === 'complete'" class="max-w-md mx-auto px-4">
      <div class="pt-2 pb-8 flex items-center gap-3">
        <button
          class="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted
                 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          @click="router.push('/tools')"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted">Tools</p>
          <h1 class="text-2xl font-black text-text-primary dark:text-white leading-tight">EMOM</h1>
        </div>
      </div>

      <div class="flex flex-col items-center gap-8 pt-4">
        <div class="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <span class="text-4xl">🏁</span>
        </div>
        <div class="text-center">
          <h2 class="text-2xl font-black text-text-primary dark:text-white mb-2">Workout complete!</h2>
          <p class="text-text-muted text-sm">
            {{ rounds }} round{{ rounds !== 1 ? 's' : '' }} · {{ workDur }}s each
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

  <!-- Running state — full-screen overlay, covers sidebar + bottom nav -->
  <Teleport to="body">
    <div
      v-if="isRunning"
      class="fixed inset-0 z-[100] flex flex-col"
      style="background: rgb(var(--color-surface-card))"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 px-4 pt-2 pb-2 flex-shrink-0">
        <button
          class="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted
                 hover:bg-white/5 transition-colors"
          @click="router.push('/tools')"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted">Tools</p>
          <h1 class="text-lg font-black text-text-primary dark:text-white leading-tight">EMOM</h1>
        </div>
      </div>

      <!-- Circle — fills all remaining space, tap to pause/resume -->
      <div class="flex-1 flex items-center justify-center p-4 min-h-0">
        <div
          class="relative w-full aspect-square cursor-pointer select-none transition-colors duration-300"
          :class="[
            isWork ? 'text-primary' : 'text-amber-400',
            isLastThree ? 'emom-glow' : '',
          ]"
          style="max-width: min(calc(100vw - 2rem), calc(100dvh - 14rem))"
          @click="timer.isPaused.value ? timer.resume() : timer.pause()"
        >
          <svg :key="timer.phase.value" viewBox="0 0 280 280" class="w-full h-full" fill="none" overflow="visible">
            <defs>
              <clipPath id="emom-fill-clip">
                <rect x="0" width="280"
                  :style="{
                    y: `${fillY}px`,
                    height: `${fillHeight}px`,
                    transition: 'y 950ms linear, height 950ms linear',
                  }"
                />
              </clipPath>
            </defs>
            <circle cx="140" cy="140" :r="RING_R" stroke="currentColor" stroke-width="10" opacity="0.15" />
            <circle cx="140" cy="140" :r="FILL_R" fill="currentColor" opacity="0.18" clip-path="url(#emom-fill-clip)" />
            <circle
              cx="140" cy="140" :r="RING_R"
              stroke="currentColor" stroke-width="10" stroke-linecap="round"
              :stroke-dasharray="CIRCUMFERENCE" :stroke-dashoffset="strokeDashoffset"
              transform="rotate(-90 140 140)"
              style="transition: stroke-dashoffset 950ms linear;"
            />
            <circle v-if="isLastThree" cx="140" cy="140" :r="RING_R"
              stroke="currentColor" stroke-width="4" fill="none" class="emom-ripple" />
          </svg>

          <!-- Time + round text -->
          <div
            class="absolute inset-0 flex flex-col items-center justify-center gap-1 transition-opacity duration-200"
            :class="timer.isPaused.value ? 'opacity-30' : 'opacity-100'"
          >
            <span class="text-xs font-bold tracking-widest uppercase opacity-80">{{ phaseLabel }}</span>
            <span
              class="font-black tabular-nums leading-none"
              :class="isLastThree ? 'text-5xl emom-text-pulse' : 'text-6xl'"
            >{{ formattedTime }}</span>
            <span class="text-[10px] font-semibold text-text-muted text-center px-4 leading-tight mt-1">
              {{ roundLabel }}
            </span>
          </div>

          <!-- Paused indicator -->
          <Transition name="fade">
            <div v-if="timer.isPaused.value"
              class="absolute inset-0 flex flex-col items-center justify-center gap-2"
            >
              <Pause class="w-10 h-10 opacity-70" />
              <span class="text-xs font-semibold opacity-60">Tap to resume</span>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex gap-3 px-4 pb-8 pt-2 max-w-sm w-full mx-auto flex-shrink-0">
        <button
          class="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl
                 bg-white/5 border border-white/8 text-text-muted font-semibold text-sm
                 hover:border-white/20 hover:text-text-primary active:scale-[0.97] transition-all"
          @click="timer.resetPhase()"
        >
          <RotateCcw class="w-4 h-4" />
          Reset
        </button>
        <button
          class="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl
                 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm
                 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.97] transition-all"
          @click="timer.stop()"
        >
          <Square class="w-4 h-4" />
          Stop
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.emom-slider {
  --primary: #00C896;
  --pct: 0%;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 9999px;
  background: linear-gradient(to right, var(--primary) var(--pct), rgba(255,255,255,0.1) var(--pct));
  outline: none;
  cursor: pointer;
}
.emom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  box-shadow: 0 0 0 4px rgba(0,200,150,0.2), 0 2px 6px rgba(0,0,0,0.4);
  transition: box-shadow 150ms;
}
.emom-slider::-webkit-slider-thumb:active {
  box-shadow: 0 0 0 7px rgba(0,200,150,0.25), 0 2px 6px rgba(0,0,0,0.4);
}
.emom-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary);
  border: none;
  cursor: pointer;
  box-shadow: 0 0 0 4px rgba(0,200,150,0.2);
}
.emom-slider::-moz-range-track {
  height: 6px;
  border-radius: 9999px;
  background: rgba(255,255,255,0.1);
}

.emom-ripple {
  transform-box: fill-box;
  transform-origin: center;
  animation: emom-ripple 0.8s ease-out infinite;
}
@keyframes emom-ripple {
  0%   { transform: scale(1);    opacity: 0.75; }
  100% { transform: scale(1.22); opacity: 0; }
}

.emom-glow { animation: emom-glow 0.65s ease-in-out infinite; }
@keyframes emom-glow {
  0%, 100% { filter: drop-shadow(0 0 6px currentColor); }
  50%       { filter: drop-shadow(0 0 22px currentColor); }
}

.emom-text-pulse { animation: emom-text-pulse 0.65s ease-in-out infinite; }
@keyframes emom-text-pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.08); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 200ms; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .emom-ripple, .emom-glow, .emom-text-pulse { animation: none; }
}
</style>
