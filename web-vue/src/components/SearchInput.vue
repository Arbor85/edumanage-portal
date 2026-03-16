<template>
  <div class="relative flex-1 transition-all duration-200" :class="isFocused ? 'scale-[1.015]' : 'scale-100'">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value.trim())"
      @focus="isFocused = true"
      @blur="isFocused = false"
      type="text"
      :placeholder="placeholder"
      :autofocus="autofocus"
      class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-all duration-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      :class="isFocused
        ? 'border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)] dark:shadow-[0_0_0_3px_rgba(16,185,129,0.22)]'
        : 'shadow-sm'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  placeholder?: string
  autofocus?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isFocused = ref(false)
</script>
