<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { Component } from 'vue'
import { useCountUp } from '../composables/useCountUp'

const props = defineProps<{
  label: string
  value: string | number
  icon?: Component
  iconBg?: string
  delta?: string | null
  deltaPositive?: boolean
}>()

const numericTarget = computed(() => typeof props.value === 'number' ? props.value : 0)
const isNumeric = computed(() => typeof props.value === 'number')

const { displayValue, trigger } = useCountUp(numericTarget)

onMounted(() => {
  if (isNumeric.value) trigger()
})
</script>

<template>
  <div class="bg-surface dark:bg-surface-card rounded-2xl shadow-card border border-gray-100/80 dark:border-white/5 p-5 relative overflow-hidden group">
    <!-- Ambient gradient on hover -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-primary/[0.03] to-transparent" />

    <!-- Delta badge -->
    <span
      v-if="delta"
      class="absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-md tabular-nums"
      :class="deltaPositive ? 'bg-delta-positive/15 text-delta-positive' : 'bg-delta-negative/15 text-delta-negative'"
    >
      {{ delta }}
    </span>

    <!-- Icon -->
    <div
      v-if="icon"
      class="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105"
      :class="iconBg ?? 'bg-primary/10'"
    >
      <component :is="icon" class="w-5 h-5 text-text-secondary dark:text-white/60" />
    </div>

    <!-- Value (animated for numbers) -->
    <p class="text-3xl font-bold tracking-tight tabular-nums text-text-primary dark:text-white">
      {{ isNumeric ? displayValue : value }}
    </p>
    <p class="text-sm text-text-secondary mt-1 font-medium">{{ label }}</p>
  </div>
</template>
