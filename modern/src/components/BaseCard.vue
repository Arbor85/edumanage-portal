<script setup lang="ts">
defineProps<{
  padding?: 'none' | 'sm' | 'md'
  hoverable?: boolean
}>()
</script>

<template>
  <div
    :class="[
      'bg-surface dark:bg-surface-card rounded-2xl shadow-card border border-gray-100/80 dark:border-white/5',
      padding === 'none' ? '' : padding === 'sm' ? 'p-3' : 'p-5',
      hoverable ? 'hoverable-card cursor-pointer' : '',
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.hoverable-card {
  transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1),
              box-shadow 200ms cubic-bezier(0.23, 1, 0.32, 1),
              border-color 200ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .hoverable-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-raised);
    border-color: rgba(0, 200, 150, 0.15);
  }
  .dark .hoverable-card:hover {
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.hoverable-card:active {
  transform: translateY(-1px);
  transition-duration: 80ms;
}
</style>
