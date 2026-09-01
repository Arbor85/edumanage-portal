<script setup lang="ts">
defineProps<{
  modelValue: string | number | null
  label?: string
  placeholder?: string
  type?: string
  error?: string
  disabled?: boolean
  hint?: string
}>()
defineEmits<{ 'update:modelValue': [val: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-semibold text-text-primary dark:text-white">{{ label }}</label>
    <input
      :value="modelValue ?? ''"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :disabled="disabled"
      class="px-3 py-2.5 min-h-[44px] rounded-xl border text-sm bg-white dark:bg-surface-input text-text-primary dark:text-white placeholder:text-text-muted outline-none
        transition-[border-color,box-shadow] duration-150
        hover:border-gray-300 dark:hover:border-white/20
        focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary
        disabled:opacity-50 disabled:cursor-not-allowed"
      :class="error ? 'border-red-400 ring-1 ring-red-400/30' : 'border-gray-200 dark:border-white/10'"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-xs font-medium text-red-500 flex items-center gap-1">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-text-secondary">{{ hint }}</p>
  </div>
</template>
