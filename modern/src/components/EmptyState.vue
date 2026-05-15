<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description?: string
  actionLabel?: string
}>()
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 gap-3 text-center">
    <div v-if="icon" class="text-4xl">{{ icon }}</div>
    <p class="text-base font-semibold text-text-primary dark:text-white">{{ title }}</p>
    <p v-if="description" class="text-sm text-text-secondary max-w-xs">{{ description }}</p>
    <button
      v-if="actionLabel"
      class="mt-2 px-4 py-2.5 min-h-[44px] bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors focus-visible:ring-2 focus-visible:ring-primary"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
