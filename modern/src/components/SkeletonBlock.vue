<script setup lang="ts">
defineProps<{
  width?: string
  height?: string
  rounded?: boolean
}>()
</script>

<template>
  <div
    class="skeleton-shimmer"
    :class="rounded !== false ? 'rounded-xl' : 'rounded'"
    :style="{ width: width ?? '100%', height: height ?? '1rem' }"
    aria-hidden="true"
  />
</template>
