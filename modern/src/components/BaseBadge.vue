<script setup lang="ts">
defineProps<{
  label: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary'
}>()
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide"
    :class="{
      'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/70': !variant || variant === 'default',
      'bg-primary/15 text-primary dark:bg-primary/20': variant === 'success' || variant === 'primary',
      'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-400': variant === 'warning',
      'bg-red-100 text-red-600 dark:bg-red-400/15 dark:text-red-400': variant === 'danger',
    }"
  >
    {{ label }}
  </span>
</template>
