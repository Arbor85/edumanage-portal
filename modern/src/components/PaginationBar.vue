<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  page: number
  pageSize: number
  total: number
}>()
const emit = defineEmits<{ 'update:page': [page: number] }>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))
const show = computed(() => props.total > props.pageSize)
</script>

<template>
  <div v-if="show" class="flex items-center justify-center gap-3 py-4">
    <button
      class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-card text-text-secondary hover:text-primary hover:border-primary/30 disabled:opacity-40 disabled:hover:text-text-secondary disabled:hover:border-gray-200 dark:disabled:hover:border-white/10 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary"
      :disabled="page <= 1"
      @click="emit('update:page', page - 1)"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>
    <span class="text-sm font-semibold text-text-secondary dark:text-white/60 tabular-nums min-w-[4rem] text-center">
      {{ page }} / {{ totalPages }}
    </span>
    <button
      class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-card text-text-secondary hover:text-primary hover:border-primary/30 disabled:opacity-40 disabled:hover:text-text-secondary disabled:hover:border-gray-200 dark:disabled:hover:border-white/10 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary"
      :disabled="page >= totalPages"
      @click="emit('update:page', page + 1)"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
  </div>
</template>
