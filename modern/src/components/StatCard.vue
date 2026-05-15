<script setup lang="ts">
import type { Component } from 'vue'
defineProps<{
  label: string
  value: string | number
  icon?: Component
  iconBg?: string
  delta?: string | null
  deltaPositive?: boolean
}>()
</script>

<template>
  <div class="bg-surface dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-5 relative">
    <!-- Delta badge -->
    <span
      v-if="delta"
      class="absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-full"
      :class="deltaPositive ? 'bg-delta-positive/20 text-delta-positive' : 'bg-delta-negative/20 text-delta-negative'"
    >
      {{ delta }}
    </span>

    <!-- Icon -->
    <div v-if="icon" class="w-10 h-10 rounded-full flex items-center justify-center mb-3" :class="iconBg ?? 'bg-primary/10'">
      <component :is="icon" class="w-5 h-5 text-text-secondary dark:text-white/60" />
    </div>

    <!-- Value -->
    <p class="text-3xl font-bold text-text-primary dark:text-white">{{ value }}</p>
    <p class="text-sm text-text-secondary mt-0.5">{{ label }}</p>
  </div>
</template>
