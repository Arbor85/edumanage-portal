<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  title: string
  subtitle?: string
  backTo?: string | null
}>()

const router = useRouter()
</script>

<template>
  <div class="flex items-start gap-3 mb-6">
    <button
      v-if="backTo"
      class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-text-secondary hover:text-primary transition-colors mt-0.5 focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Go back"
      @click="router.push(backTo)"
    >
      ←
    </button>
    <div>
      <h1 class="text-2xl font-bold text-text-primary dark:text-white">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-text-secondary mt-0.5">{{ subtitle }}</p>
    </div>
    <div class="ml-auto flex items-center gap-2">
      <slot />
    </div>
  </div>
</template>
