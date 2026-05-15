<script setup lang="ts">
defineProps<{
  width?: string
  height?: string
  rounded?: boolean
}>()
</script>

<template>
  <div
    class="animate-pulse bg-gray-200 dark:bg-white/10"
    :class="rounded !== false ? 'rounded-xl' : 'rounded'"
    :style="{ width: width ?? '100%', height: height ?? '1rem' }"
  />
</template>
