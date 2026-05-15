<script setup lang="ts">
import { Utensils } from 'lucide-vue-next'
</script>

<template>
  <div class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-4 flex flex-col items-center gap-2 text-center">
    <Utensils class="w-7 h-7 text-text-secondary" />
    <p class="text-sm font-semibold text-text-primary dark:text-white">Today's Meal Plan</p>
    <p class="text-xs text-text-secondary">Nutrition tracking coming soon</p>
  </div>
</template>
