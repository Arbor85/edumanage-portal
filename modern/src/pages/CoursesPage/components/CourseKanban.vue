<script setup lang="ts">
import type { CourseOut } from '../../../types'
import SkeletonBlock from '../../../components/SkeletonBlock.vue'
import CourseKanbanCard from './CourseKanbanCard.vue'

const props = defineProps<{ courses: CourseOut[]; loading: boolean }>()
const emit = defineEmits<{ edit: [c: CourseOut]; delete: [c: CourseOut] }>()

const columns = [
  { key: 'online', label: 'Online' },
  { key: 'in-person', label: 'In-Person' },
  { key: 'hybrid', label: 'Hybrid' },
]

function byType(type: string) {
  return props.courses.filter((c) => c.type === type)
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div v-for="col in columns" :key="col.key" class="bg-gray-50 dark:bg-white/5 rounded-2xl p-3 min-h-[200px]">
      <p class="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">{{ col.label }} ({{ byType(col.key).length }})</p>
      <div v-if="loading" class="flex flex-col gap-2">
        <SkeletonBlock v-for="i in 3" :key="i" height="3.5rem" />
      </div>
      <div class="flex flex-col gap-2">
        <CourseKanbanCard
          v-for="course in byType(col.key)"
          :key="course.id ?? ''"
          :course="course"
          @edit="emit('edit', course)"
          @delete="emit('delete', course)"
        />
      </div>
    </div>
  </div>
</template>
