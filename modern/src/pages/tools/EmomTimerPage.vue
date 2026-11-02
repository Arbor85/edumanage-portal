<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Play, Pause, Square } from '@lucide/vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import { useEmomTimer, requestNotificationPermission } from '../../composables/useEmomTimer'

const router = useRouter()
const rounds = ref(8)
const delay = ref(10)

const timer = useEmomTimer()

// SVG geometry constants (viewBox 0 0 280 280, center 140,140)
const RING_R = 120
const FILL_R = 108
const CIRCUMFERENCE = 2 * Math.PI * RING_R
const FILL_BOTTOM = 140 + FILL_R
const FILL_DIAMETER = FILL_R * 2

const progress = computed(() => {
  if (timer.phase.value === 'work') return (60 - timer.secondsLeft.value) / 60
  if (timer.phase.value === 'rest') return (delay.value - timer.secondsLeft.value) / delay.value
  return 0
})

const fillY = computed(() => FILL_BOTTOM - progress.value * FILL_DIAMETER)
const fillHeight = computed(() => Math.max(0, progress.value * FILL_DIAMETER))
const strokeDashoffset = computed(() => CIRCUMFERENCE * (1 - progress.value))

const isWork = computed(() => timer.phase.value === 'work')
const isRunning = computed(() => timer.phase.value === 'work' || timer.phase.value === 'rest')
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

// ── Wake Lock — prevent screen sleep while timer is active ────────────────────

let wakeLock: WakeLockSentinel | null = null

async function acquireWakeLock() {
  if (!('wakeLock' in navigator)) return
  try {
    wakeLock = await navigator.wakeLock.request('screen')
  } catch { /* denied or unavailable */ }
}

function releaseWakeLock() {
  wakeLock?.release().catch(() => {})
  wakeLock = null
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible' && isRunning.value && !timer.isPaused.value) {
    acquireWakeLock()
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityChange)
  if (isRunning.value && !timer.isPaused.value) acquireWakeLock()
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  releaseWakeLock()
})

watch([() => timer.phase.value, () => timer.isPaused.value], ([phase, paused]) => {
  const active = (phase === 'work' || phase === 'rest') && !paused
  if (active) acquireWakeLock()
  else releaseWakeLock()
})

// ── Actions ───────────────────────────────────────────────────────────────────

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
          <h1 class="text-2xl font-black text-text-primary dark:text-white leading-tight">EMOM</h1>
        </div>
      </div>

      <!-- Setup state -->
      <div v-if="timer.phase.value === 'idle'" class="flex flex-col gap-6">
        <div class="bg-surface-card border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
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
      <div v-else-if="isRunning" class="flex flex-col items-center gap-8">

        <!-- Timer ring + fill -->
        <!--
          Outer div carries currentColor for drop-shadow glow.
          .emom-glow pulses the filter during last 3 s.
        -->
        <div
          class="relative w-64 h-64 transition-colors duration-300"
          :class="[
            isWork ? 'text-primary' : 'text-amber-400',
            isLastThree ? 'emom-glow' : '',
          ]"
        >
          <!-- key snaps SVG to progress=0 on phase change, avoiding backward animation -->
          <svg
            :key="timer.phase.value"
            viewBox="0 0 280 280"
            class="w-full h-full"
            fill="none"
            overflow="visible"
          >
            <defs>
              <clipPath id="emom-fill-clip">
                <rect
                  x="0"
                  width="280"
                  :style="{
                    y: `${fillY}px`,
                    height: `${fillHeight}px`,
                    transition: 'y 950ms linear, height 950ms linear',
                  }"
                />
              </clipPath>
            </defs>

            <!-- Track ring -->
            <circle
              cx="140" cy="140" :r="RING_R"
              stroke="currentColor"
              stroke-width="10"
              opacity="0.15"
            />

            <!-- Liquid background fill (rises from bottom) -->
            <circle
              cx="140" cy="140" :r="FILL_R"
              fill="currentColor"
              opacity="0.18"
              clip-path="url(#emom-fill-clip)"
            />

            <!-- Progress ring (fills clockwise from top) -->
            <circle
              cx="140" cy="140" :r="RING_R"
              stroke="currentColor"
              stroke-width="10"
              stroke-linecap="round"
              :stroke-dasharray="CIRCUMFERENCE"
              :stroke-dashoffset="strokeDashoffset"
              transform="rotate(-90 140 140)"
              style="transition: stroke-dashoffset 950ms linear;"
            />

            <!-- Ripple ring — pulses outward during last 3 seconds -->
            <circle
              v-if="isLastThree"
              cx="140" cy="140" :r="RING_R"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
              class="emom-ripple"
            />
          </svg>

          <!-- Text overlay -->
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-1 select-none">
            <span class="text-xs font-bold tracking-widest uppercase opacity-80">{{ phaseLabel }}</span>
            <span
              class="font-black tabular-nums leading-none"
              :class="isLastThree ? 'text-5xl emom-text-pulse' : 'text-6xl'"
            >{{ formattedTime }}</span>
            <span class="text-[10px] font-semibold text-text-muted text-center px-4 leading-tight mt-1">
              {{ roundLabel }}
            </span>
          </div>
        </div>

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

<style scoped>
/* Expanding ripple ring that fades out — repeats every 0.8 s */
.emom-ripple {
  transform-box: fill-box;
  transform-origin: center;
  animation: emom-ripple 0.8s ease-out infinite;
}

@keyframes emom-ripple {
  0%   { transform: scale(1);    opacity: 0.75; }
  100% { transform: scale(1.22); opacity: 0; }
}

/* Drop-shadow glow on the container — pulses in/out */
.emom-glow {
  animation: emom-glow 0.65s ease-in-out infinite;
}

@keyframes emom-glow {
  0%, 100% { filter: drop-shadow(0 0 6px currentColor); }
  50%       { filter: drop-shadow(0 0 22px currentColor); }
}

/* Countdown text grows/shrinks slightly in sync */
.emom-text-pulse {
  animation: emom-text-pulse 0.65s ease-in-out infinite;
}

@keyframes emom-text-pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.08); }
}

@media (prefers-reduced-motion: reduce) {
  .emom-ripple,
  .emom-glow,
  .emom-text-pulse { animation: none; }
}
</style>
