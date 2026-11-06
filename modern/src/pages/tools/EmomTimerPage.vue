<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Square, RotateCcw, Pause } from '@lucide/vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import { useEmomTimer, requestNotificationPermission, getEmomProgress } from '../../composables/useEmomTimer'

const router = useRouter()
const rounds  = ref(20)
const delay   = ref(5)
const workDur = ref(60)

// ── Animated display values (tween toward slider target) ────────────────────
const displayRounds  = ref(rounds.value)
const displayWorkDur = ref(workDur.value)
const displayDelay   = ref(delay.value)

const roundsText  = computed(() => Math.round(displayRounds.value))
const workDurText = computed(() => Math.round(displayWorkDur.value))
const delayText   = computed(() => Math.round(displayDelay.value))

function animateTo(target: Ref<number>, value: number, duration = 220) {
  const startVal = target.value
  const startT = performance.now()
  const step = (now: number) => {
    const p = Math.min(1, (now - startT) / duration)
    const eased = 1 - Math.pow(1 - p, 3)
    target.value = startVal + (value - startVal) * eased
    if (p < 1) requestAnimationFrame(step)
    else target.value = value
  }
  requestAnimationFrame(step)
}

// ── Click sound via Web Audio API ───────────────────────────────────────────
let audioCtx: AudioContext | null = null
function playClick() {
  try {
    if (!audioCtx) {
      const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext
      if (!Ctor) return
      audioCtx = new Ctor()
    }
    const ctx = audioCtx!
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(1600, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.05)
  } catch { /* silent */ }
}

watch(rounds,  (v) => { playClick(); animateTo(displayRounds,  v) })
watch(workDur, (v) => { playClick(); animateTo(displayWorkDur, v) })
watch(delay,   (v) => { playClick(); animateTo(displayDelay,   v) })

// ── Click-to-edit numeric input ─────────────────────────────────────────────
type Field = 'rounds' | 'workDur' | 'delay'
const editing = ref<Field | null>(null)
const editBuffer = ref('')

const limits: Record<Field, { min: number; max: number; ref: Ref<number> }> = {
  rounds:  { min: 1,  max: 50,  ref: rounds  },
  workDur: { min: 30, max: 360, ref: workDur },
  delay:   { min: 3,  max: 30,  ref: delay   },
}

function startEdit(field: Field) {
  editBuffer.value = String(limits[field].ref.value)
  editing.value = field
  nextTick(() => {
    const el = document.getElementById(`emom-edit-${field}`) as HTMLInputElement | null
    el?.focus()
    el?.select()
  })
}

function commitEdit() {
  if (!editing.value) return
  const { min, max, ref: r } = limits[editing.value]
  const n = Math.floor(Number(editBuffer.value))
  if (!isNaN(n)) r.value = Math.max(min, Math.min(max, n))
  editing.value = null
}

function cancelEdit() { editing.value = null }

const timer = useEmomTimer()

// SVG geometry constants (viewBox 0 0 280 280, center 140,140)
const RING_R        = 120
const FILL_R        = 108
const CIRCUMFERENCE = 2 * Math.PI * RING_R
const FILL_BOTTOM   = 140 + FILL_R
const FILL_DIAMETER = FILL_R * 2

// ── Sub-second smooth progress via requestAnimationFrame ─────────────────────
const smoothProgress = ref(0)
let rafId: number | null = null

function rafLoop() {
  smoothProgress.value = getEmomProgress()
  rafId = requestAnimationFrame(rafLoop)
}

const fillY            = computed(() => FILL_BOTTOM - smoothProgress.value * FILL_DIAMETER)
const fillHeight       = computed(() => Math.max(0, smoothProgress.value * FILL_DIAMETER))
const strokeDashoffset = computed(() => CIRCUMFERENCE * (1 - smoothProgress.value))

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
  if (isRunning.value) rafId = requestAnimationFrame(rafLoop)
})

onUnmounted(() => {
  releaseWakeLock()
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
})

watch(isRunning, (running) => {
  if (running && rafId === null) rafId = requestAnimationFrame(rafLoop)
  else if (!running && rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
})

watch([() => timer.phase.value, () => timer.isPaused.value], ([phase, paused]) => {
  if ((phase === 'work' || phase === 'rest') && !paused) acquireWakeLock()
  else releaseWakeLock()
})

// ── Stop confirmation ─────────────────────────────────────────────────────────
const showStopDialog = ref(false)

function requestStop() {
  if (!timer.isPaused.value) timer.pause()
  showStopDialog.value = true
}

function confirmStop() {
  showStopDialog.value = false
  timer.stop()
}

function keepPaused() {
  showStopDialog.value = false
  // timer stays paused — user already paused above
}

function dismissStop() {
  showStopDialog.value = false
  timer.resume()
}

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
              <input
                v-if="editing === 'rounds'"
                id="emom-edit-rounds"
                v-model="editBuffer"
                type="number" min="1" max="50"
                class="emom-num-input text-2xl font-black text-primary tabular-nums"
                @blur="commitEdit"
                @keydown.enter.prevent="commitEdit"
                @keydown.esc.prevent="cancelEdit"
              />
              <button
                v-else
                type="button"
                class="text-2xl font-black text-primary tabular-nums emom-num-btn"
                :key="roundsText"
                @click="startEdit('rounds')"
              >{{ roundsText }}</button>
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
              <div class="flex items-baseline">
                <input
                  v-if="editing === 'workDur'"
                  id="emom-edit-workDur"
                  v-model="editBuffer"
                  type="number" min="30" max="360"
                  class="emom-num-input text-2xl font-black text-primary tabular-nums"
                  @blur="commitEdit"
                  @keydown.enter.prevent="commitEdit"
                  @keydown.esc.prevent="cancelEdit"
                />
                <button
                  v-else
                  type="button"
                  class="text-2xl font-black text-primary tabular-nums emom-num-btn"
                  :key="workDurText"
                  @click="startEdit('workDur')"
                >{{ workDurText }}</button>
                <span class="text-2xl font-black text-primary">s</span>
              </div>
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
              <div class="flex items-baseline">
                <input
                  v-if="editing === 'delay'"
                  id="emom-edit-delay"
                  v-model="editBuffer"
                  type="number" min="3" max="30"
                  class="emom-num-input text-2xl font-black text-primary tabular-nums"
                  @blur="commitEdit"
                  @keydown.enter.prevent="commitEdit"
                  @keydown.esc.prevent="cancelEdit"
                />
                <button
                  v-else
                  type="button"
                  class="text-2xl font-black text-primary tabular-nums emom-num-btn"
                  :key="delayText"
                  @click="startEdit('delay')"
                >{{ delayText }}</button>
                <span class="text-2xl font-black text-primary">s</span>
              </div>
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
                  :style="{ y: `${fillY}px`, height: `${fillHeight}px` }"
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
          @click="requestStop"
        >
          <Square class="w-4 h-4" />
          Stop
        </button>
      </div>

      <!-- Stop confirmation dialog -->
      <Transition name="fade">
        <div
          v-if="showStopDialog"
          class="absolute inset-0 flex items-end justify-center pb-6 z-10"
          style="background: rgba(0,0,0,0.6)"
          @click.self="dismissStop"
        >
          <div class="bg-surface-card border border-white/10 rounded-2xl p-5 mx-4 w-full max-w-sm shadow-2xl">
            <h3 class="text-base font-bold text-text-primary dark:text-white mb-1">Stop workout?</h3>
            <p class="text-sm text-text-muted mb-5">What would you like to do?</p>
            <div class="flex flex-col gap-2">
              <button
                class="w-full h-12 bg-red-500/15 border border-red-500/30 text-red-400 font-semibold
                       text-sm rounded-xl hover:bg-red-500/25 active:scale-[0.98] transition-all"
                @click="confirmStop"
              >
                Yes, stop session
              </button>
              <button
                class="w-full h-12 bg-primary/10 border border-primary/30 text-primary font-semibold
                       text-sm rounded-xl hover:bg-primary/20 active:scale-[0.98] transition-all"
                @click="keepPaused"
              >
                Just pause
              </button>
              <button
                class="w-full h-12 bg-white/5 border border-white/8 text-text-muted font-semibold
                       text-sm rounded-xl hover:border-white/20 hover:text-text-primary active:scale-[0.98] transition-all"
                @click="dismissStop"
              >
                No, continue
              </button>
            </div>
          </div>
        </div>
      </Transition>
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

/* Clickable animated number */
.emom-num-btn {
  background: transparent;
  border: none;
  padding: 0 2px;
  cursor: pointer;
  border-radius: 6px;
  animation: emom-num-pop 220ms ease-out;
  transition: background-color 150ms;
}
.emom-num-btn:hover { background: rgba(0, 200, 150, 0.1); }
@keyframes emom-num-pop {
  0%   { transform: scale(1.18); filter: brightness(1.3); }
  60%  { transform: scale(0.96); }
  100% { transform: scale(1);    filter: brightness(1); }
}

.emom-num-input {
  background: transparent;
  border: none;
  outline: none;
  width: 4ch;
  text-align: right;
  padding: 0 2px;
  border-bottom: 2px solid rgb(var(--color-primary, 0 200 150));
  -moz-appearance: textfield;
}
.emom-num-input::-webkit-outer-spin-button,
.emom-num-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .emom-ripple, .emom-glow, .emom-text-pulse, .emom-num-btn { animation: none; }
}
</style>
