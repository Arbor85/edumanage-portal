<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
  storageKey?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [val: string] }>()

const icons: Record<string, string> = { list: '☰', kanban: '⊞', calendar: '📅' }

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
      <span>{{ icons[opt.value] ?? '' }}</span>
      <span class="hidden sm:inline">{{ opt.label }}</span>
    </button>
  </div>
</template>
