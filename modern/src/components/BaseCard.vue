<script setup lang="ts">
defineProps<{
  padding?: 'none' | 'sm' | 'md'
  hoverable?: boolean
}>()
</script>

<template>
  <div
    :class="[
      'bg-surface dark:bg-surface-card rounded-2xl shadow-sm border border-gray-100 dark:border-white/5',
      padding === 'none' ? '' : padding === 'sm' ? 'p-3' : 'p-5',
      hoverable ? 'hover:-translate-y-0.5 hover:shadow-lg hover:border-white/10 transition-all duration-150 cursor-pointer' : '',
    ]"
  >
    <slot />
  </div>
</template>
