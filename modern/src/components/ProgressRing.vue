<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  percent: number
  size?: number
  strokeWidth?: number
  label?: string | null
}>()

const S = computed(() => props.size ?? 120)
const SW = computed(() => props.strokeWidth ?? 8)
const R = computed(() => (S.value - SW.value) / 2)
const CIRC = computed(() => 2 * Math.PI * R.value)
const dashOffset = computed(() => CIRC.value * (1 - Math.min(100, Math.max(0, props.percent)) / 100))
</script>

<template>
  <div class="relative inline-flex items-center justify-center">
    <svg :width="S" :height="S" class="-rotate-90">
      <circle :cx="S/2" :cy="S/2" :r="R" fill="none" stroke="#E5E7EB" :stroke-width="SW" />
      <circle
        :cx="S/2" :cy="S/2" :r="R" fill="none" stroke="#00C896" :stroke-width="SW"
        stroke-linecap="round"
        :stroke-dasharray="CIRC"
        :stroke-dashoffset="dashOffset"
        class="transition-all duration-700"
      />
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <slot>
        <span class="text-2xl font-bold text-text-primary dark:text-white">{{ percent }}%</span>
        <span v-if="label" class="text-xs text-text-secondary">{{ label }}</span>
      </slot>
    </div>
  </div>
</template>
