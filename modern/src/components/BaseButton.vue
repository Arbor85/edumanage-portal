<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      size === 'sm' ? 'px-3 py-1.5 text-sm min-h-[36px]' : size === 'lg' ? 'px-6 py-3 text-base min-h-[52px]' : 'px-4 py-2.5 text-sm min-h-[44px]',
      variant === 'primary' ? 'bg-primary text-white hover:bg-primary-dark disabled:opacity-50' :
      variant === 'danger'  ? 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50' :
      variant === 'ghost'   ? 'bg-transparent text-text-secondary hover:bg-gray-100 dark:hover:bg-white/10 disabled:opacity-50' :
                              'bg-gray-100 dark:bg-white/10 text-text-primary dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50',
      fullWidth ? 'w-full' : '',
    ]"
  >
    <span v-if="loading" class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    <slot />
  </button>
</template>
