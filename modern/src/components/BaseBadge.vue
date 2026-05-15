<script setup lang="ts">
defineProps<{
  label: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary'
}>()
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
    :class="{
      'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/70': !variant || variant === 'default',
      'bg-primary/20 text-primary': variant === 'success' || variant === 'primary',
      'bg-amber-100 text-amber-700': variant === 'warning',
      'bg-red-100 text-red-600': variant === 'danger',
    }"
  >
    {{ label }}
  </span>
</template>
