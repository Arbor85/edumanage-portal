<template>
  <div class="w-full max-w-7xl pb-24">
    <div class="mb-5">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Courses</h1>
    </div>

    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput v-model="searchQuery" placeholder="Search by name, type or description" />

      <div class="flex items-center gap-2 sm:shrink-0">
        <div class="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-600">
          <button
            type="button"
            @click="viewMode = 'tile'"
            class="px-3 py-1.5 text-xs font-medium"
            :class="viewMode === 'tile' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
          >
            Tile
          </button>
          <button
            type="button"
            @click="viewMode = 'list'"
            class="border-l border-slate-300 px-3 py-1.5 text-xs font-medium dark:border-slate-600"
            :class="viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
          >
            List
          </button>
        </div>

        <button
          type="button"
          @click="loadCourses"
          :disabled="isLoading"
          aria-label="Refresh courses"
          title="Refresh courses"
          class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4" :class="isLoading ? 'animate-spin' : ''">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
        </button>
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="mb-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="isLoading"
      class="mb-3 flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-8 dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="inline-flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
        <svg class="h-5 w-5 animate-spin text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span>Loading courses...</span>
      </div>
    </div>

    <div v-else-if="viewMode === 'tile'" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="course in filteredCourses"
        :key="course.id"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="mb-2 flex items-start justify-between gap-2">
          <h2 class="font-semibold text-slate-900 dark:text-slate-100">{{ course.name }}</h2>
          <div class="flex shrink-0 flex-col items-end gap-1">
            <span
              :class="course.type === 'Group' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'"
              class="rounded-full px-2 py-0.5 text-[10px] font-medium"
            >
              {{ course.type }}
            </span>
            <span v-if="course.type === 'Group' && course.size" class="text-[10px] text-slate-500 dark:text-slate-400">
              Up to {{ course.size }} participants
            </span>
          </div>
        </div>

        <p class="mb-3 text-lg font-bold text-emerald-600 dark:text-emerald-400">
          {{ formatPrice(course.price) }}
        </p>

        <p v-if="course.description" class="mb-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
          {{ course.description }}
        </p>

        <div class="mt-3 flex justify-end gap-2">
          <button
            type="button"
            @click="requestDelete(course)"
            class="inline-flex items-center justify-center gap-2 rounded-md border border-rose-300 bg-white p-2 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-700 dark:text-rose-300 dark:hover:bg-rose-900/30"
            aria-label="Delete course"
            title="Delete course"
          >
            <Trash2 :size="16" />
          </button>
          <button
            type="button"
            @click="openEditDialog(course)"
            class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            <Edit2 :size="14" />
            Edit
          </button>
        </div>
      </article>

      <div
        v-if="filteredCourses.length === 0"
        class="md:col-span-2 xl:col-span-3 rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        <p class="mb-2">No courses found.</p>
        <div class="flex items-center gap-2">
          <button type="button" @click="loadCourses" class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
            Refresh
          </button>
          <button type="button" @click="openCreateDialog" class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">
            Create course
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            <tr>
              <th class="px-4 py-3 font-semibold">Name</th>
              <th class="px-4 py-3 font-semibold">Type</th>
              <th class="px-4 py-3 font-semibold">Size</th>
              <th class="px-4 py-3 font-semibold">Price</th>
              <th class="px-4 py-3 font-semibold">Description</th>
              <th class="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in filteredCourses" :key="course.id" class="border-t border-slate-200 dark:border-slate-700">
              <td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{{ course.name }}</td>
              <td class="px-4 py-3">
                <span
                  :class="course.type === 'Group' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'"
                  class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                >
                  {{ course.type }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ course.size ?? '—' }}</td>
              <td class="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">{{ formatPrice(course.price) }}</td>
              <td class="px-4 py-3 max-w-xs truncate text-slate-600 dark:text-slate-400">{{ course.description ?? '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    @click="requestDelete(course)"
                    class="inline-flex items-center justify-center gap-2 rounded-md border border-rose-300 bg-white p-2 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-700 dark:text-rose-300 dark:hover:bg-rose-900/30"
                    aria-label="Delete course"
                    title="Delete course"
                  >
                    <Trash2 :size="16" />
                  </button>
                  <button
                    type="button"
                    @click="openEditDialog(course)"
                    class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  >
                    <Edit2 :size="14" />
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="filteredCourses.length === 0"
        class="border-t border-slate-200 px-4 py-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
      >
        <p class="mb-2">No courses found.</p>
        <div class="flex items-center gap-2">
          <button type="button" @click="loadCourses" class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
            Refresh
          </button>
          <button type="button" @click="openCreateDialog" class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">
            Create course
          </button>
        </div>
      </div>
    </div>

    <div class="fixed bottom-0 left-56 right-0 z-30 px-6 pb-3">
      <div class="mx-auto w-full max-w-7xl">
        <DialogActionPanel primary-label="Create course" @primary-click="openCreateDialog" />
      </div>
    </div>

    <CourseEditorDialog
      :open="showDialog"
      :title="isEditing ? 'Edit course' : 'Create course'"
      :save-label="isEditing ? 'Save changes' : 'Create course'"
      :initial="editingCourse"
      @cancel="closeDialog"
      @save="saveCourse"
    />

    <ConfirmDialog
      :open="!!courseToDelete"
      title="Delete course"
      :message="courseToDelete ? `Are you sure you want to delete '${courseToDelete.name}'?` : ''"
      @confirm="deleteCourse"
      @cancel="courseToDelete = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Edit2, Trash2 } from 'lucide-vue-next'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import DialogActionPanel from '../../components/DialogActionPanel.vue'
import SearchInput from '../../components/SearchInput.vue'
import { useLocalStorageState } from '../../composables/useLocalStorageState'
import { usePageTitle } from '../../composables/usePageTitle'
import { useCoursesApi } from '../../services/coursesApi'
import type { Course, CoursePrice, CourseWritePayload } from '../../types/course'
import CourseEditorDialog from './components/CourseEditorDialog.vue'

usePageTitle('Courses')

const coursesApi = useCoursesApi()

const courses = ref<Course[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const viewMode = useLocalStorageState<'tile' | 'list'>('courses:viewMode', 'tile')

const showDialog = ref(false)
const isEditing = ref(false)
const editingCourse = ref<Course | null>(null)
const courseToDelete = ref<Course | null>(null)

const filteredCourses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return courses.value
  return courses.value.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q),
  )
})

const formatPrice = (price: CoursePrice) => {
  return `${price.currency} ${price.value.toFixed(2)}`
}

const openCreateDialog = () => {
  isEditing.value = false
  editingCourse.value = null
  showDialog.value = true
}

const openEditDialog = (course: Course) => {
  isEditing.value = true
  editingCourse.value = course
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  isEditing.value = false
  editingCourse.value = null
}

const saveCourse = async (payload: CourseWritePayload) => {
  errorMessage.value = ''
  try {
    if (isEditing.value && editingCourse.value) {
      const updated = await coursesApi.editCourse(editingCourse.value.id, payload)
      const index = courses.value.findIndex((c) => c.id === updated.id)
      if (index !== -1) courses.value[index] = updated
    } else {
      const created = await coursesApi.addCourse(payload)
      courses.value.push(created)
    }
    closeDialog()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save course'
  }
}

const requestDelete = (course: Course) => {
  courseToDelete.value = course
}

const deleteCourse = async () => {
  if (!courseToDelete.value) return
  errorMessage.value = ''
  try {
    await coursesApi.deleteCourse(courseToDelete.value.id)
    courses.value = courses.value.filter((c) => c.id !== courseToDelete.value?.id)
    courseToDelete.value = null
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to delete course'
    courseToDelete.value = null
  }
}

const loadCourses = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    courses.value = await coursesApi.listCourses()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load courses'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadCourses()
})
</script>
