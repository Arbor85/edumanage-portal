<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue'

const props = defineProps<{
  seconds: number
  autoStart?: boolean
}>()
const emit = defineEmits<{ finish: []; tick: [remaining: number] }>()

const remaining = ref(props.seconds)
let handle: ReturnType<typeof setInterval> | null = null

function start() {
  remaining.value = props.seconds
  if (handle) clearInterval(handle)
  handle = setInterval(() => {
    remaining.value--
    emit('tick', remaining.value)
    if (remaining.value <= 0) {
      clearInterval(handle!)
      emit('finish')
    }
  }, 1000)
}

if (props.autoStart) start()
onUnmounted(() => { if (handle) clearInterval(handle) })

// SVG ring
const SIZE = 120
const STROKE = 8
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const dashOffset = computed(() => CIRCUMFERENCE * (1 - remaining.value / props.seconds))

defineExpose({ start })
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <svg :width="SIZE" :height="SIZE" class="-rotate-90">
      <circle :cx="SIZE/2" :cy="SIZE/2" :r="RADIUS" fill="none" stroke="#E5E7EB" :stroke-width="STROKE" />
      <circle
        :cx="SIZE/2" :cy="SIZE/2" :r="RADIUS" fill="none" stroke="#00C896" :stroke-width="STROKE"
        stroke-linecap="round"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="dashOffset"
        class="transition-all duration-1000"
      />
    </svg>
    <span class="text-3xl font-bold -mt-[74px] mb-[42px] text-text-primary dark:text-white">{{ remaining }}</span>
  </div>
</template>
