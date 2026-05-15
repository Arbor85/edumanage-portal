<script setup lang="ts">
import { onMounted } from 'vue'
import type { Component } from 'vue'
import { List, LayoutGrid, Calendar } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
  storageKey?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [val: string] }>()

const icons: Record<string, Component> = { list: List, kanban: LayoutGrid, calendar: Calendar }

onMounted(() => {
  if (props.storageKey) {
    const saved = localStorage.getItem(props.storageKey)
    if (saved && props.options.some((o) => o.value === saved)) emit('update:modelValue', saved)
  }
})

function select(val: string) {
  emit('update:modelValue', val)
  if (props.storageKey) localStorage.setItem(props.storageKey, val)
}
</script>

<template>
  <div class="flex items-center gap-1 bg-gray-100 dark:bg-white/10 p-1 rounded-xl">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors min-h-[36px] focus-visible:ring-2 focus-visible:ring-primary"
      :class="modelValue === opt.value
        ? 'bg-white dark:bg-surface-dark text-text-primary dark:text-white shadow-sm'
        : 'text-text-secondary hover:text-text-primary dark:hover:text-white'"
      @click="select(opt.value)"
    >
      <component :is="icons[opt.value]" v-if="icons[opt.value]" class="w-4 h-4" />
      <span class="hidden sm:inline">{{ opt.label }}</span>
    </button>
  </div>
</template>
