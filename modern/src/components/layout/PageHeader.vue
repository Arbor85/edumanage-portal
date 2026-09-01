<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'
import DarkModeToggle from '../DarkModeToggle.vue'

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
      class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-card text-text-secondary hover:text-primary hover:border-primary/30 transition-all duration-150 mt-0.5 focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Go back"
      @click="router.push(backTo)"
    >
      <ChevronLeft class="w-5 h-5" />
    </button>
    <div class="flex-1 min-w-0">
      <h1 class="text-2xl font-bold tracking-tight text-text-primary dark:text-white text-balance leading-tight">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-text-secondary mt-1 font-medium">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-2 flex-shrink-0">
      <slot />
      <DarkModeToggle class="lg:hidden" />
    </div>
  </div>
</template>
