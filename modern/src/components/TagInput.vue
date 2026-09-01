<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  modelValue: string[]
  label?: string
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
  <div class="flex flex-col gap-1.5">
    <span v-if="label" class="text-sm font-semibold text-text-primary dark:text-white">{{ label }}</span>
    <div class="flex flex-wrap gap-1.5 p-2 min-h-[44px] rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark focus-within:ring-2 focus-within:ring-primary transition-[border-color,box-shadow] duration-150 hover:border-gray-300 dark:hover:border-white/20">
      <span
        v-for="tag in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md font-semibold"
      >
        {{ tag }}
        <button
          type="button"
          class="hover:text-red-500 focus-visible:ring-1 focus-visible:ring-primary rounded leading-none"
          aria-label="Remove tag"
          @click="remove(tag)"
        >×</button>
      </span>
      <input
        v-model="input"
        :placeholder="modelValue.length ? '' : (placeholder ?? 'Add tag…')"
        class="flex-1 min-w-[80px] text-sm bg-transparent outline-none text-text-primary dark:text-white placeholder:text-text-secondary"
        @keydown="onKeydown"
        @blur="add"
      />
    </div>
    <p class="text-xs text-text-secondary">Press Enter to add a tag</p>
  </div>
</template>
