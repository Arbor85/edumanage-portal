<script setup lang="ts">
defineProps<{
  modelValue: string | null
  label?: string
  rows?: number
  error?: string
  hint?: string
  placeholder?: string
  disabled?: boolean
}>()
defineEmits<{ 'update:modelValue': [val: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-text-primary dark:text-white">{{ label }}</label>
    <textarea
      :value="modelValue ?? ''"
      :rows="rows ?? 3"
      :placeholder="placeholder"
      :disabled="disabled"
      class="px-3 py-2.5 rounded-xl border text-sm bg-white dark:bg-surface-dark text-text-primary dark:text-white placeholder:text-text-secondary outline-none transition-colors resize-y
        focus-visible:ring-2 focus-visible:ring-primary
        disabled:opacity-50 disabled:cursor-not-allowed"
      :class="error ? 'border-red-400' : 'border-gray-200 dark:border-white/10'"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-text-secondary">{{ hint }}</p>
  </div>
</template>
