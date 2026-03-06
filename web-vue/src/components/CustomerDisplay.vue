<template>
  <div class="inline-flex items-center gap-2" :title="name">
    <img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="name"
      class="h-7 w-7 rounded-full object-cover border border-slate-200 dark:border-slate-600"
    />
    <span
      v-else
      class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-200 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
      aria-hidden="true"
    >
      {{ nameInitial }}
    </span>

    <span class="hidden max-w-[12rem] truncate text-sm text-slate-700 dark:text-slate-300 sm:inline">
      {{ name }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  imageUrl?: string
}>()

const nameInitial = computed(() => {
  const trimmedName = props.name.trim()
  if (!trimmedName) {
    return '?'
  }

  return trimmedName.charAt(0).toUpperCase()
})
</script>
