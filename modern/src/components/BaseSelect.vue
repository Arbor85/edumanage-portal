<script setup lang="ts">
defineProps<{
  modelValue: string | number | null
  label?: string
  options: { value: string | number; label: string }[]
  error?: string
  disabled?: boolean
  placeholder?: string
}>()
defineEmits<{ 'update:modelValue': [val: string | number] }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-text-primary dark:text-white">{{ label }}</label>
    <select
      :value="modelValue ?? ''"
      :disabled="disabled"
      class="px-3 py-2.5 min-h-[44px] rounded-xl border text-sm bg-white dark:bg-surface-dark text-text-primary dark:text-white outline-none transition-colors
        focus-visible:ring-2 focus-visible:ring-primary
        disabled:opacity-50 disabled:cursor-not-allowed"
      :class="error ? 'border-red-400' : 'border-gray-200 dark:border-white/10'"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
