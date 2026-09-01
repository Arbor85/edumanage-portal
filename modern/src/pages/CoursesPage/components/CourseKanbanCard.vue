<script setup lang="ts">
import type { CourseOut } from '../../../types'
import BaseBadge from '../../../components/BaseBadge.vue'
import { Pencil, Trash2, Clock } from 'lucide-vue-next'

defineProps<{ course: CourseOut }>()
defineEmits<{ edit: []; delete: [] }>()

function formatDuration(minutes: number | null) {
  if (!minutes) return null
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
</script>

<template>
  <div class="bg-white dark:bg-surface-elevated rounded-xl border border-gray-100/80 dark:border-white/5 p-3 group shadow-card">
    <div class="flex items-start justify-between gap-1">
      <p class="text-sm font-semibold text-text-primary dark:text-white line-clamp-2 flex-1">{{ course.name }}</p>
      <div class="hidden group-hover:flex gap-1 flex-shrink-0">
        <button class="w-6 h-6 flex items-center justify-center text-text-secondary hover:text-primary transition-colors" aria-label="Edit" @click="$emit('edit')">
          <Pencil class="w-3.5 h-3.5" />
        </button>
        <button class="w-6 h-6 flex items-center justify-center text-text-secondary hover:text-red-500 transition-colors" aria-label="Delete" @click="$emit('delete')">
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
    <p v-if="course.description" class="text-xs text-text-secondary mt-1 line-clamp-2">{{ course.description }}</p>
    <div class="flex items-center justify-between mt-2">
      <BaseBadge :label="course.type ?? 'online'" />
      <span v-if="course.durationMinutes" class="flex items-center gap-1 text-xs text-text-secondary">
        <Clock class="w-3 h-3" />{{ formatDuration(course.durationMinutes) }}
      </span>
    </div>
  </div>
</template>
