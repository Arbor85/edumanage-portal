<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CourseOut } from '../../../types'
import { useCourseStore } from '../../../stores/courseStore'
import { useToast } from '../../../composables/useToast'
import SkeletonBlock from '../../../components/SkeletonBlock.vue'
import EmptyState from '../../../components/EmptyState.vue'
import BaseBadge from '../../../components/BaseBadge.vue'
import BaseButton from '../../../components/BaseButton.vue'
import PaginationBar from '../../../components/PaginationBar.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'

const props = defineProps<{ courses: CourseOut[]; loading: boolean }>()
const emit = defineEmits<{ edit: [c: CourseOut] }>()

const courseStore = useCourseStore()
const toast = useToast()
const page = ref(1)
const PAGE_SIZE = 20
const deleteTarget = ref<CourseOut | null>(null)
const paginated = computed(() => props.courses.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

async function handleDelete() {
  if (!deleteTarget.value?.id) return
  try {
    await courseStore.remove(deleteTarget.value.id)
    toast.success('Course deleted')
    deleteTarget.value = null
  } catch {
    toast.error('Failed to delete course')
  }
}

function priceLabel(c: CourseOut) {
  if (!c.price) return 'Free'
  return `${c.price.value} ${c.price.currency}`
}
</script>

<template>
  <div>
    <div v-if="loading" class="flex flex-col gap-3">
      <SkeletonBlock v-for="i in 5" :key="i" height="4rem" />
    </div>
    <EmptyState v-else-if="!courses.length" icon="🎓" title="No courses yet" description="Create your first course." />
    <div v-else class="flex flex-col gap-3 custom-scrollbar">
      <div
        v-for="course in paginated"
        :key="course.id ?? ''"
        class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-4 flex items-center gap-4"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="font-semibold text-text-primary dark:text-white">{{ course.name }}</p>
            <BaseBadge :label="course.type ?? ''" />
          </div>
          <p v-if="course.description" class="text-xs text-text-secondary mt-0.5 truncate">{{ course.description }}</p>
          <p class="text-xs text-text-secondary mt-0.5">{{ priceLabel(course) }}</p>
        </div>
        <div class="flex gap-1.5">
          <BaseButton size="sm" variant="ghost" @click="emit('edit', course)">✏️</BaseButton>
          <BaseButton size="sm" variant="ghost" @click="deleteTarget = course">🗑️</BaseButton>
        </div>
      </div>
    </div>
    <PaginationBar :page="page" :page-size="PAGE_SIZE" :total="courses.length" @update:page="page = $event" />
    <ConfirmDialog :open="deleteTarget !== null" title="Delete Course" message="Delete this course?" confirm-label="Delete" variant="danger" @confirm="handleDelete" @cancel="deleteTarget = null" />
  </div>
</template>
