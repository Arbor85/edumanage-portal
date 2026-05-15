<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div
    class="rounded-full border-2 border-primary border-t-transparent animate-spin"
    :class="{
      'w-4 h-4': !$props.size || $props.size === 'sm',
      'w-7 h-7 border-[3px]': $props.size === 'md',
      'w-10 h-10 border-4': $props.size === 'lg',
    }"
  />
</template>
