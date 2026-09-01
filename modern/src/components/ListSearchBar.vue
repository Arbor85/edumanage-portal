<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, RefreshCw } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  loading?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [val: string]; refresh: [] }>()

const local = ref(props.modelValue)
let debounce: ReturnType<typeof setTimeout> | null = null

watch(local, (val) => {
  if (debounce) clearTimeout(debounce)
  debounce = setTimeout(() => emit('update:modelValue', val), 300)
})

watch(() => props.modelValue, (val) => { if (val !== local.value) local.value = val })
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="relative flex-1">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
        <Search class="w-4 h-4" />
      </span>
      <input
        v-model="local"
        :placeholder="placeholder ?? 'Search...'"
        class="w-full pl-9 pr-4 py-2.5 min-h-[44px] rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-sm text-text-primary dark:text-white placeholder:text-text-secondary outline-none
          transition-[border-color,box-shadow] duration-150
          hover:border-gray-300 dark:hover:border-white/20
          focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
      />
    </div>
    <button
      class="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-text-secondary hover:text-primary hover:border-primary/30 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="Refresh"
      @click="$emit('refresh')"
    >
      <RefreshCw class="w-4 h-4" :class="loading ? 'animate-spin' : ''" />
    </button>
  </div>
</template>
