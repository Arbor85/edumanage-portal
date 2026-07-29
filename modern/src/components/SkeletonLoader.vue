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
      'animate-pulse bg-surface-input dark:bg-surface-input',
      rounded ?? 'rounded-lg',
      $props.class ?? '',
    ]"
    aria-hidden="true"
  />
</template>
