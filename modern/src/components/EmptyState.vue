<script setup lang="ts">
import type { Component } from 'vue'
defineProps<{
  icon?: Component
  title: string
  description?: string
  actionLabel?: string
}>()
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="empty-state flex flex-col items-center justify-center py-16 gap-4 text-center">
    <div
      v-if="icon"
      class="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5 dark:from-primary/20 dark:to-primary/5 shadow-sm"
    >
      <component :is="icon" class="w-7 h-7 text-primary/70 dark:text-primary/60" />
    </div>
    <div class="flex flex-col gap-1.5 max-w-xs">
      <p class="text-base font-semibold text-text-primary dark:text-white text-balance">{{ title }}</p>
      <p v-if="description" class="text-sm text-text-secondary leading-relaxed text-pretty">{{ description }}</p>
    </div>
    <button
      v-if="actionLabel"
      class="mt-1 px-5 py-2.5 min-h-[44px] bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark shadow-glow-sm hover:shadow-glow transition-all duration-150 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1), transform 300ms cubic-bezier(0.23, 1, 0.32, 1);
  @starting-style {
    opacity: 0;
    transform: translateY(8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .empty-state {
    transition: opacity 150ms ease !important;
    @starting-style { opacity: 0; transform: none; }
  }
}
</style>
