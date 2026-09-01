<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePageTitle } from '../../../composables/usePageTitle'
import type { CourseOut, CourseCreate, CourseUpdate } from '../../../types'
import { useCourseStore } from '../../../stores/courseStore'
import { useToast } from '../../../composables/useToast'
import BaseModal from '../../../components/BaseModal.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseTextarea from '../../../components/BaseTextarea.vue'
import BaseSelect from '../../../components/BaseSelect.vue'
import BaseButton from '../../../components/BaseButton.vue'
import TagInput from '../../../components/TagInput.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'

const props = defineProps<{ open: boolean; course: CourseOut | null }>()
const emit = defineEmits<{ close: [] }>()

usePageTitle(() => props.course ? 'Edit Course' : 'New Course', () => props.open)

const courseStore = useCourseStore()
const toast = useToast()

const form = ref<{ name: string; description: string | null; type: string | null; tags: string[]; durationMinutes: number }>({
  name: '', description: null, type: 'online', tags: [], durationMinutes: 60,
})
const saving = ref(false)
const confirmDelete = ref(false)

const typeOptions = [
  { value: 'online', label: 'Online' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'hybrid', label: 'Hybrid' },
]

watch(() => props.open, (val) => {
  if (val) {
    if (props.course) {
      form.value = {
        name: props.course.name ?? '',
        description: props.course.description,
        type: props.course.type,
        tags: props.course.tags ?? [],
        durationMinutes: props.course.durationMinutes ?? 60,
      }
    } else {
      form.value = { name: '', description: null, type: 'online', tags: [], durationMinutes: 60 }
    }
  }
})

async function save() {
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      description: form.value.description,
      type: form.value.type,
      size: null,
      durationMinutes: form.value.durationMinutes,
      tags: form.value.tags,
    }
    if (props.course?.id) {
      await courseStore.update(props.course.id, payload as CourseUpdate)
      toast.success('Course updated')
    } else {
      await courseStore.create(payload as CourseCreate)
      toast.success('Course created')
    }
    emit('close')
  } catch {
    toast.error('Failed to save course')
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!props.course?.id) return
  try {
    await courseStore.remove(props.course.id)
    toast.success('Course deleted')
    confirmDelete.value = false
    emit('close')
  } catch {
    toast.error('Failed to delete course')
  }
}
</script>

<template>
  <BaseModal :open="open" :title="course ? 'Edit course' : 'New course'" size="md" @close="emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="save">
      <BaseInput v-model="form.name" label="Name" placeholder="e.g. Morning Yoga" />
      <BaseTextarea v-model="form.description" label="Description" :rows="3" />
      <div class="grid grid-cols-2 gap-4">
        <BaseSelect v-model="form.type" label="Type" :options="typeOptions" />
        <BaseInput
          :model-value="String(form.durationMinutes)"
          label="Duration (min) *"
          type="number"
          placeholder="60"
          min="1"
          required
          @update:model-value="form.durationMinutes = $event ? Math.max(1, Number($event)) : 60"
        />
      </div>
      <TagInput v-model="form.tags" label="Tags" />
    </form>

    <template #footer>
      <div class="flex items-center gap-2">
        <BaseButton v-if="course" variant="danger" @click="confirmDelete = true">Delete</BaseButton>
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">{{ course ? 'Save' : 'Create' }}</BaseButton>
      </div>
    </template>
  </BaseModal>

  <ConfirmDialog
    :open="confirmDelete"
    title="Delete course"
    message="Delete this course? This cannot be undone."
    confirm-label="Delete"
    variant="danger"
    @confirm="doDelete"
    @cancel="confirmDelete = false"
  />
</template>
