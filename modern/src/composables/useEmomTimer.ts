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

// SW registration is module-level — persists across component mounts
let swRegistration: ServiceWorkerRegistration | null = null

async function registerTimerSW() {
  if (!('serviceWorker' in navigator)) return
  try {
    swRegistration = await navigator.serviceWorker.register('/timer-sw.js', { scope: '/' })
    // Ensure the SW is active immediately (not just installed)
    if (swRegistration.installing) {
      await new Promise<void>((resolve) => {
        swRegistration!.installing!.addEventListener('statechange', function handler() {
          if (this.state === 'activated') { resolve(); this.removeEventListener('statechange', handler) }
        })
      })
    }
  } catch {
    // SW unavailable (non-HTTPS in some environments, or blocked by browser)
  }
}

function sendNotification(title: string, body: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  // Prefer SW path — creates a real OS notification that reaches paired watches
  const sw = swRegistration?.active ?? navigator.serviceWorker?.controller
  if (sw) {
    sw.postMessage({ type: 'SHOW_NOTIFICATION', title, body })
    return
  }
  // Fallback: basic Web Notification (browser-level only, won't reach watch)
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
  // Register SW after permission granted so showNotification() is allowed
  if (Notification.permission === 'granted') {
    await registerTimerSW()
  }
}

let totalRounds = 0
let delaySeconds = 0
let intervalId: ReturnType<typeof setInterval> | null = null

const phase = ref<EmomPhase>('idle')
const currentRound = ref(1)
const secondsLeft = ref(0)
const isPaused = ref(false)

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
    secondsLeft.value = 60
  }
}

export { phase as emomPhase }

// ── Composable — returns refs to shared singleton state ───────────────────────

export function useEmomTimer() {
  function start(rounds: number, delay: number) {
    totalRounds = rounds
    delaySeconds = delay
    clearTimer()
    phase.value = 'work'
    currentRound.value = 1
    secondsLeft.value = 60
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

  return { phase, currentRound, secondsLeft, isPaused, start, pause, resume, stop }
}
