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
      class="px-3 py-2 min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
      :disabled="page <= 1"
      @click="emit('update:page', page - 1)"
    >
      <ChevronLeft class="w-4 h-4" />
    </button>
    <span class="text-sm text-text-secondary dark:text-white/60">
      {{ page }} / {{ totalPages }}
    </span>
    <button
      class="px-3 py-2 min-h-[44px] min-w-[44px] rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
      :disabled="page >= totalPages"
      @click="emit('update:page', page + 1)"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
  </div>
</template>
