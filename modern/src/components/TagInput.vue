<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string[]
  placeholder?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [val: string[]] }>()

const input = ref('')

function add() {
  const val = input.value.trim()
  if (val && !props.modelValue.includes(val)) {
    emit('update:modelValue', [...props.modelValue, val])
  }
  input.value = ''
}

function remove(tag: string) {
  emit('update:modelValue', props.modelValue.filter((t) => t !== tag))
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    add()
  }
  if (e.key === 'Backspace' && !input.value && props.modelValue.length) {
    emit('update:modelValue', props.modelValue.slice(0, -1))
  }
}
</script>

<template>
  <div class="flex flex-wrap gap-1.5 p-2 min-h-[44px] rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark focus-within:ring-2 focus-within:ring-primary">
    <span
      v-for="tag in modelValue"
      :key="tag"
      class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-lg font-medium"
    >
      {{ tag }}
      <button type="button" class="hover:text-red-500 focus-visible:ring-1 focus-visible:ring-primary rounded" aria-label="Remove tag" @click="remove(tag)">×</button>
    </span>
    <input
      v-model="input"
      :placeholder="modelValue.length ? '' : placeholder"
      class="flex-1 min-w-[80px] text-sm bg-transparent outline-none text-text-primary dark:text-white placeholder:text-text-secondary"
      @keydown="onKeydown"
      @blur="add"
    />
  </div>
</template>
