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
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-text-primary dark:text-white">{{ label }}</label>
    <input
      :value="modelValue ?? ''"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :disabled="disabled"
      class="px-3 py-2.5 min-h-[44px] rounded-xl border text-sm bg-white dark:bg-surface-dark text-text-primary dark:text-white placeholder:text-text-secondary outline-none transition-colors
        focus-visible:ring-2 focus-visible:ring-primary
        disabled:opacity-50 disabled:cursor-not-allowed"
      :class="error ? 'border-red-400' : 'border-gray-200 dark:border-white/10'"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-text-secondary">{{ hint }}</p>
  </div>
</template>
