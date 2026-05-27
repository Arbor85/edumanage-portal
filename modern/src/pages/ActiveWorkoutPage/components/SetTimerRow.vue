<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { Check, Play, Square } from 'lucide-vue-next'
import BaseButton from '../../../components/BaseButton.vue'

const props = defineProps<{
  setIndex: number
  duration: number | null
  completed: boolean
  isCurrent: boolean
}>()

const emit = defineEmits<{
  complete: [actualDuration: number | null]
}>()

const secondsLeft = ref<number | null>(null)
const running = ref(false)
let handle: ReturnType<typeof setInterval> | null = null

const total = computed(() => props.duration ?? 0)

// progress 0 → 1 as time elapses
const progress = computed(() => {
  if (secondsLeft.value === null || total.value === 0) return 0
  return (total.value - secondsLeft.value) / total.value
})

const RADIUS = 12
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const ringOffset = computed(() => CIRCUMFERENCE * (1 - progress.value))

function fmt(sec: number | null) {
  if (sec === null) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

function playDone() {
  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime
    const notes = [
      { freq: 660, t: 0 },
      { freq: 784, t: 0.2 },
      { freq: 1047, t: 0.4 },
    ]
    notes.forEach(({ freq, t }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0, now + t)
      gain.gain.linearRampToValueAtTime(0.35, now + t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.25)
      osc.start(now + t)
      osc.stop(now + t + 0.28)
    })
  } catch { /* AudioContext unavailable */ }
}

function start() {
  if (handle) clearInterval(handle)
  secondsLeft.value = total.value
  running.value = true
  handle = setInterval(() => {
    if (secondsLeft.value === null) return
    secondsLeft.value--
    if (secondsLeft.value <= 0) {
      clearInterval(handle!)
      handle = null
      secondsLeft.value = 0
      running.value = false
      playDone()
      emit('complete', total.value)
    }
  }, 1000)
}

function stop() {
  if (handle) clearInterval(handle)
  handle = null
  running.value = false
  secondsLeft.value = null
}

function markDone() {
  stop()
  emit('complete', null)
}

onUnmounted(() => { if (handle) clearInterval(handle) })
watch(() => props.completed, (v) => { if (v) stop() })
</script>

<template>
  <div
    class="relative flex items-center gap-2.5 text-sm px-2 py-2 rounded-xl overflow-hidden transition-all"
    :class="[
      completed ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : '',
      isCurrent && !completed ? 'ring-1 ring-primary' : '',
    ]"
  >
    <!-- Background fill bar (grows left → right as time elapses) -->
    <div
      v-if="running"
      class="absolute inset-y-0 left-0 bg-primary/10 dark:bg-primary/20 rounded-xl pointer-events-none"
      :style="{ width: `${progress * 100}%`, transition: 'width 1s linear' }"
    />

    <!-- Circular ring + number -->
    <div class="relative w-7 h-7 flex-shrink-0 z-10">
      <svg
        class="absolute inset-0 -rotate-90"
        width="28" height="28" viewBox="0 0 28 28"
        aria-hidden="true"
      >
        <!-- Track circle -->
        <circle
          cx="14" cy="14" :r="RADIUS"
          fill="none" stroke="currentColor" stroke-width="2"
          class="text-gray-200 dark:text-white/10"
        />
        <!-- Elapsed arc (fills clockwise) -->
        <circle
          v-if="running"
          cx="14" cy="14" :r="RADIUS"
          fill="none"
          stroke="var(--color-primary, #6366f1)"
          stroke-width="2.5"
          stroke-linecap="round"
          :stroke-dasharray="CIRCUMFERENCE"
          :stroke-dashoffset="ringOffset"
          style="transition: stroke-dashoffset 1s linear;"
        />
        <!-- Full green ring when done -->
        <circle
          v-else-if="completed"
          cx="14" cy="14" :r="RADIUS"
          fill="none" stroke="#22c55e" stroke-width="2.5"
          :stroke-dasharray="CIRCUMFERENCE" :stroke-dashoffset="0"
        />
      </svg>
      <span
        class="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
        :class="completed ? 'text-green-600 dark:text-green-400' : 'text-text-primary dark:text-white'"
      >
        <Check v-if="completed" class="w-3 h-3" />
        <template v-else>{{ setIndex + 1 }}</template>
      </span>
    </div>

    <!-- Time label -->
    <span class="flex-1 z-10 tabular-nums" :class="completed ? 'line-through' : ''">
      <template v-if="running && secondsLeft !== null">
        <span class="font-bold text-primary">{{ fmt(secondsLeft) }}</span>
        <span class="text-text-secondary text-xs"> / {{ fmt(total) }}</span>
      </template>
      <template v-else>{{ fmt(total) }}</template>
    </span>

    <!-- Action buttons (only for the current uncompleted set) -->
    <template v-if="isCurrent && !completed">
      <div class="flex items-center gap-1 z-10">
        <!-- Start / Stop -->
        <BaseButton v-if="!running" size="sm" variant="primary" @click="start">
          <Play class="w-3.5 h-3.5" /> Start
        </BaseButton>
        <BaseButton v-else size="sm" variant="ghost" @click="stop">
          <Square class="w-3 h-3 fill-current" /> Stop
        </BaseButton>
        <!-- Manual Done -->
        <BaseButton size="sm" :variant="running ? 'ghost' : 'ghost'" @click="markDone">
          <Check class="w-3.5 h-3.5" /> Done
        </BaseButton>
      </div>
    </template>
  </div>
</template>
