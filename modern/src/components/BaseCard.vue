<script setup lang="ts">
defineProps<{
  padding?: 'none' | 'sm' | 'md'
  hoverable?: boolean
}>()
</script>

<template>
  <div
    :class="[
      'bg-surface dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/10',
      padding === 'none' ? '' : padding === 'sm' ? 'p-3' : 'p-5',
      hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : '',
    ]"
  >
    <slot />
  </div>
</template>
