<template>
  <div
    v-if="isLoading"
    class="mb-3 flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-8 dark:border-slate-700 dark:bg-slate-800"
  >
    <div class="inline-flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
      <LoaderCircle :size="20" class="animate-spin text-emerald-500" aria-hidden="true" />
      <span>{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    isLoading: boolean
    label?: string
  }>(),
  {
    label: 'Loading...'
  }
)
</script>
