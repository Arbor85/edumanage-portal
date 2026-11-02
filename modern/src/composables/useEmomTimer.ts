import { ref } from 'vue'

export type EmomPhase = 'idle' | 'work' | 'rest' | 'complete'

// ── Module-level singletons — survive component unmount ───────────────────────

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function playBeep(frequency = 880, durationMs = 120) {
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + durationMs / 1000)
  } catch {
    // Audio not available
  }
}

function sendNotification(title: string, body: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const sw = navigator.serviceWorker?.controller
  if (sw) {
    sw.postMessage({ type: 'SHOW_NOTIFICATION', title, body })
    return
  }
  try {
    new Notification(title, { body, silent: true })
  } catch {
    // Not supported in this context
  }
}

export async function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

let totalRounds = 0
let delaySeconds = 0
let workDurationSecs = 60
let intervalId: ReturnType<typeof setInterval> | null = null

// ── Timestamp tracking for sub-second smooth progress ────────────────────────
let phaseStartedAt = 0   // Date.now() when current phase began (adjusted after pauses)
let phaseDurationMs = 60000
let pausedAt = 0         // Date.now() when pause() was called

export function getEmomProgress(): number {
  if (phase.value !== 'work' && phase.value !== 'rest') return 0
  const now = isPaused.value ? pausedAt : Date.now()
  return Math.min(1, Math.max(0, (now - phaseStartedAt) / phaseDurationMs))
}

const phase = ref<EmomPhase>('idle')
const currentRound = ref(1)
const secondsLeft = ref(0)
const isPaused = ref(false)
const workDuration = ref(60)

function clearTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function tick() {
  if (secondsLeft.value > 1) {
    secondsLeft.value--
    if (secondsLeft.value <= 3) playBeep()
    return
  }
  if (phase.value === 'work') {
    playBeep(1100, 200)
    if (currentRound.value >= totalRounds) {
      sendNotification(
        '🏁 Workout complete!',
        `All ${totalRounds} round${totalRounds !== 1 ? 's' : ''} finished. Great work!`,
      )
      clearTimer()
      phase.value = 'complete'
    } else {
      sendNotification(
        `💪 Round ${currentRound.value} done!`,
        `${totalRounds - currentRound.value} round${totalRounds - currentRound.value !== 1 ? 's' : ''} remaining — rest now.`,
      )
      phase.value = 'rest'
      secondsLeft.value = delaySeconds
      phaseStartedAt = Date.now()
      phaseDurationMs = delaySeconds * 1000
    }
  } else if (phase.value === 'rest') {
    playBeep(1100, 200)
    sendNotification(
      '⏱ Rest over — go!',
      `Starting round ${currentRound.value + 1} of ${totalRounds}.`,
    )
    currentRound.value++
    phase.value = 'work'
    secondsLeft.value = workDurationSecs
    phaseStartedAt = Date.now()
    phaseDurationMs = workDurationSecs * 1000
  }
}

export { phase as emomPhase, workDuration as emomWorkDuration }

// ── Composable — returns refs to shared singleton state ───────────────────────

export function useEmomTimer() {
  function start(rounds: number, delay: number, duration = 60) {
    totalRounds = rounds
    delaySeconds = delay
    workDurationSecs = duration
    workDuration.value = duration
    clearTimer()
    phase.value = 'work'
    currentRound.value = 1
    secondsLeft.value = duration
    isPaused.value = false
    phaseStartedAt = Date.now()
    phaseDurationMs = duration * 1000
    intervalId = setInterval(tick, 1000)
  }

  function pause() {
    clearTimer()
    isPaused.value = true
    pausedAt = Date.now()
  }

  function resume() {
    // Shift phaseStartedAt forward by the time spent paused so progress stays accurate
    phaseStartedAt += Date.now() - pausedAt
    isPaused.value = false
    intervalId = setInterval(tick, 1000)
  }

  function stop() {
    clearTimer()
    phase.value = 'idle'
    currentRound.value = 1
    secondsLeft.value = 0
    isPaused.value = false
  }

  function resetPhase() {
    secondsLeft.value = phase.value === 'work' ? workDurationSecs : delaySeconds
    phaseStartedAt = Date.now()
  }

  return { phase, currentRound, secondsLeft, isPaused, start, pause, resume, stop, resetPhase }
}
