<script setup lang="ts">
import type { CourseOut } from '../../../types'
import BaseBadge from '../../../components/BaseBadge.vue'

defineProps<{ course: CourseOut }>()
defineEmits<{ edit: []; delete: [] }>()
</script>

<template>
  <div class="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/10 p-3 group">
    <div class="flex items-start justify-between gap-1">
      <p class="text-sm font-semibold text-text-primary dark:text-white line-clamp-2 flex-1">{{ course.name }}</p>
      <div class="hidden group-hover:flex gap-1">
        <button class="w-6 h-6 flex items-center justify-center text-xs text-text-secondary hover:text-primary" @click="$emit('edit')">✏️</button>
        <button class="w-6 h-6 flex items-center justify-center text-xs text-text-secondary hover:text-red-500" @click="$emit('delete')">🗑️</button>
      </div>
    </div>
    <p v-if="course.description" class="text-xs text-text-secondary mt-1 line-clamp-2">{{ course.description }}</p>
    <div class="flex items-center justify-between mt-2">
      <BaseBadge :label="course.type ?? 'online'" />
      <span class="text-xs text-text-secondary">{{ course.price ? `${course.price.value} ${course.price.currency}` : 'Free' }}</span>
    </div>
  </div>
</template>
