<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('Courses')
import type { CourseOut, CourseAvailabilityCreate } from '../types'
import { useCourseStore } from '../stores/courseStore'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import ListSearchBar from '../components/ListSearchBar.vue'
import BaseButton from '../components/BaseButton.vue'
import CourseList from './CoursesPage/components/CourseList.vue'
import CourseFormModal from './CoursesPage/components/CourseFormModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useToast } from '../composables/useToast'
import { Plus } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const toast = useToast()

const search = ref('')
const isCreateOpen = ref(false)
const editTarget = ref<CourseOut | null>(null)
const deleteTarget = ref<CourseOut | null>(null)

onMounted(() => courseStore.fetch())

function openEdit(course: CourseOut) {
  editTarget.value = course
  router.push({ query: { edit: course.id! } })
}

function openCreate() {
  isCreateOpen.value = true
  router.push({ query: { new: '1' } })
}

watch(() => route.query, async (query) => {
  if (query.edit) {
    if (editTarget.value?.id === query.edit) return
    try {
      editTarget.value = await courseStore.get(query.edit as string)
      isCreateOpen.value = false
    } catch {
      toast.error('Course not found')
      router.replace({ query: {} })
    }
  } else if (query.new) {
    if (isCreateOpen.value) return
    isCreateOpen.value = true
    editTarget.value = null
  } else {
    isCreateOpen.value = false
    editTarget.value = null
  }
}, { immediate: true })

const filtered = computed(() =>
  courseStore.courses.filter((c) =>
    !search.value || c.name?.toLowerCase().includes(search.value.toLowerCase())
  )
)

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
</script>

<template>
  <AppLayout>
    <PageHeader title="Courses" subtitle="Manage your training programs and courses.">
      <BaseButton variant="primary" @click="openCreate">
        <Plus class="w-4 h-4" /> New Course
      </BaseButton>
    </PageHeader>

    <div class="mb-5">
      <ListSearchBar v-model="search" placeholder="Search courses..." :loading="courseStore.isLoading" @refresh="courseStore.fetch()" />
    </div>

    <CourseList
      :courses="filtered"
      :loading="courseStore.isLoading"
      @edit="openEdit"
    />

    <CourseFormModal
      :open="isCreateOpen || editTarget !== null"
      :course="editTarget"
      @close="router.replace({ query: {} })"
    />

    <ConfirmDialog
      :open="deleteTarget !== null"
      title="Delete Course"
      message="Delete this course? This cannot be undone."
      confirm-label="Delete"
      variant="danger"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />
  </AppLayout>
</template>
