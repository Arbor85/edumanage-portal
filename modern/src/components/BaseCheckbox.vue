<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label?: string
  hint?: string
  disabled?: boolean
}>()
defineEmits<{ 'update:modelValue': [val: boolean] }>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label
      class="flex items-center gap-3 cursor-pointer select-none"
      :class="disabled ? 'opacity-50 cursor-not-allowed' : ''"
    >
      <button
        type="button"
        role="switch"
        :aria-checked="modelValue"
        :disabled="disabled"
        class="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        :class="modelValue ? 'bg-primary' : 'bg-gray-200 dark:bg-white/20'"
        @click="!disabled && $emit('update:modelValue', !modelValue)"
      >
        <span
          class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out"
          :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
      <span v-if="label" class="text-sm font-medium text-text-primary dark:text-white">{{ label }}</span>
    </label>
    <p v-if="hint" class="text-xs text-text-secondary pl-14">{{ hint }}</p>
  </div>
</template>
