<script setup lang="ts">
defineProps<{
  width?: string
  height?: string
  rounded?: string
  class?: string
}>()
</script>

<template>
  <div
    :style="{ width, height }"
    :class="[
      'skeleton-shimmer',
      rounded ?? 'rounded-lg',
      $props.class ?? '',
    ]"
    aria-hidden="true"
  />
</template>
