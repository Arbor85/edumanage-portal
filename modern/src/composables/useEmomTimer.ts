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
  // Post to the VitePWA service worker — creates a real OS notification
  // that the phone forwards to paired devices (Garmin, Apple Watch, etc.)
  const sw = navigator.serviceWorker?.controller
  if (sw) {
    sw.postMessage({ type: 'SHOW_NOTIFICATION', title, body })
    return
  }
  // Fallback: basic Web Notification (browser-level only, no watch forwarding)
  try {
    new Notification(title, { body, silent: true })
  } catch {
    // Not supported in this context (e.g. iOS Safari outside installed PWA)
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
    intervalId = setInterval(tick, 1000)
  }

  function pause() {
    clearTimer()
    isPaused.value = true
  }

  function resume() {
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
    if (phase.value === 'work') secondsLeft.value = workDurationSecs
    else if (phase.value === 'rest') secondsLeft.value = delaySeconds
  }

  return { phase, currentRound, secondsLeft, isPaused, start, pause, resume, stop, resetPhase }
}
