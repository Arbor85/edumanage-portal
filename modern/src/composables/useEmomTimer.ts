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
let autoPauseEveryRounds = 0  // 0 = disabled
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

export function getEmomOverallProgress(): number {
  if (phase.value === 'idle') return 0
  if (phase.value === 'complete') return 1
  const totalMs = (totalRounds * workDurationSecs + Math.max(0, totalRounds - 1) * delaySeconds) * 1000
  if (totalMs <= 0) return 0
  const completedRounds = currentRound.value - 1
  const completedMs =
    completedRounds * workDurationSecs * 1000 +
    completedRounds * delaySeconds * 1000 +
    (phase.value === 'rest' ? workDurationSecs * 1000 : 0)
  const now = isPaused.value ? pausedAt : Date.now()
  const inPhaseMs = Math.min(phaseDurationMs, Math.max(0, now - phaseStartedAt))
  return Math.min(1, Math.max(0, (completedMs + inPhaseMs) / totalMs))
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
      if (autoPauseEveryRounds > 0 && currentRound.value % autoPauseEveryRounds === 0) {
        clearTimer()
        isPaused.value = true
        pausedAt = Date.now()
        sendNotification(
          '⏸ Auto-paused',
          `Completed ${currentRound.value} round${currentRound.value !== 1 ? 's' : ''}. Tap to resume.`,
        )
      }
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
  function start(rounds: number, delay: number, duration = 60, autoPauseEvery = 0) {
    totalRounds = rounds
    delaySeconds = delay
    workDurationSecs = duration
    autoPauseEveryRounds = autoPauseEvery
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
