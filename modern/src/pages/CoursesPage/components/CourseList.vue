<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CourseOut, CourseAvailabilityCreate } from '../../../types'
import { useCourseStore } from '../../../stores/courseStore'
import SkeletonBlock from '../../../components/SkeletonBlock.vue'
import EmptyState from '../../../components/EmptyState.vue'
import PaginationBar from '../../../components/PaginationBar.vue'
import CourseCard from './CourseCard.vue'
import { GraduationCap } from 'lucide-vue-next'

const props = defineProps<{ courses: CourseOut[]; loading: boolean }>()
const emit = defineEmits<{ edit: [c: CourseOut] }>()

const courseStore = useCourseStore()
const page = ref(1)
const PAGE_SIZE = 20
const paginated = computed(() => props.courses.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
</script>

<template>
  <div>
    <div v-if="loading" class="flex flex-col gap-3">
      <SkeletonBlock v-for="i in 5" :key="i" height="4rem" />
    </div>

    <EmptyState
      v-else-if="!courses.length"
      :icon="GraduationCap"
      title="No courses yet"
      description="Create your first course."
    />

    <div v-else class="flex flex-col gap-3">
      <CourseCard
        v-for="course in paginated"
        :key="course.id ?? ''"
        :course="course"
        :availabilities="courseStore.courseAvailabilities[course.id ?? ''] ?? []"
        class="stagger-item"
        @edit="emit('edit', $event)"
        @delete="courseStore.remove($event)"
        @expand="courseStore.fetchCourseAvailability(course.id ?? '')"
        @add-availability="(payload: CourseAvailabilityCreate) => courseStore.addCourseAvailability(course.id ?? '', payload)"
        @delete-availability="(availId: string) => courseStore.deleteCourseAvailability(course.id ?? '', availId)"
      />
    </div>

    <PaginationBar :page="page" :page-size="PAGE_SIZE" :total="courses.length" @update:page="page = $event" />
  </div>
</template>
