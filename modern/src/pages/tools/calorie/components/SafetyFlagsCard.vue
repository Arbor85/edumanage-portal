<script setup lang="ts">
import { TriangleAlert } from '@lucide/vue'

defineProps<{
  flags: string[]
}>()
</script>

<template>
  <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
        <TriangleAlert class="w-5 h-5 text-amber-500" />
      </div>
      <h3 class="text-base font-bold text-amber-600 dark:text-amber-400">Important Notice</h3>
    </div>

    <ul class="space-y-2 mb-4">
      <li
        v-for="(flag, i) in flags"
        :key="i"
        class="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300 leading-relaxed"
      >
        <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        {{ flag }}
      </li>
    </ul>

    <p class="text-xs text-amber-600/80 dark:text-amber-400/70 border-t border-amber-500/20 pt-3">
      These are estimates only, not medical advice. Please consult a qualified healthcare professional before making significant changes to your diet.
    </p>
  </div>
</template>
