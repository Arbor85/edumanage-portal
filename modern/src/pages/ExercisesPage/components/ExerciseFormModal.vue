<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ExcerciseOut, ExcerciseWriteRequest } from '../../../types'
import { useExerciseStore } from '../../../stores/exerciseStore'
import { useToast } from '../../../composables/useToast'
import BaseModal from '../../../components/BaseModal.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseTextarea from '../../../components/BaseTextarea.vue'
import TagInput from '../../../components/TagInput.vue'
import BaseButton from '../../../components/BaseButton.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'

const props = defineProps<{
  open: boolean
  exercise: ExcerciseOut | null
}>()
const emit = defineEmits<{ close: [] }>()

const exerciseStore = useExerciseStore()
const toast = useToast()

const form = ref<ExcerciseWriteRequest>({ name: null, shortDescription: null, primaryMuscle: null, secondaryMuscles: [], tags: [] })
const saving = ref(false)
const confirmDelete = ref(false)

watch(() => props.open, (val) => {
  if (val) {
    form.value = props.exercise
      ? { name: props.exercise.name, shortDescription: props.exercise.shortDescription, primaryMuscle: props.exercise.primaryMuscle, secondaryMuscles: [...(props.exercise.secondaryMuscles ?? [])], tags: [...(props.exercise.tags ?? [])] }
      : { name: null, shortDescription: null, primaryMuscle: null, secondaryMuscles: [], tags: [] }
  }
})

async function save() {
  saving.value = true
  try {
    if (props.exercise) {
      await exerciseStore.update(props.exercise.id, form.value)
      toast.success('Exercise updated')
    } else {
      await exerciseStore.create(form.value)
      toast.success('Exercise created')
    }
    emit('close')
  } catch {
    toast.error('Failed to save exercise')
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!props.exercise) return
  try {
    await exerciseStore.remove(props.exercise.id)
    toast.success('Exercise deleted')
    confirmDelete.value = false
    emit('close')
  } catch {
    toast.error('Failed to delete exercise')
  }
}
</script>

<template>
  <BaseModal :open="open" :title="exercise ? 'Edit Exercise' : 'New Exercise'" size="md" @close="emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="save">
      <BaseInput v-model="form.name" label="Name" placeholder="e.g. Bench Press" />
      <BaseTextarea v-model="form.shortDescription" label="Description" placeholder="Brief description..." :rows="2" />
      <BaseInput v-model="form.primaryMuscle" label="Primary Muscle" placeholder="e.g. Chest" />
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-text-primary dark:text-white">Secondary Muscles</label>
        <TagInput :model-value="form.secondaryMuscles ?? []" placeholder="Add muscle, press Enter" @update:model-value="form.secondaryMuscles = $event" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-text-primary dark:text-white">Tags <span class="text-text-secondary font-normal">(include difficulty: Beginner / Intermediate / Advanced)</span></label>
        <TagInput :model-value="form.tags ?? []" placeholder="Add tag, press Enter" @update:model-value="form.tags = $event" />
      </div>
    </form>

    <template #footer>
      <div class="flex items-center gap-2">
        <BaseButton v-if="exercise" variant="danger" @click="confirmDelete = true">Delete</BaseButton>
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">{{ exercise ? 'Save' : 'Create' }}</BaseButton>
      </div>
    </template>
  </BaseModal>

  <ConfirmDialog
    :open="confirmDelete"
    title="Delete Exercise"
    message="Are you sure you want to delete this exercise? This action cannot be undone."
    confirm-label="Delete"
    variant="danger"
    @confirm="doDelete"
    @cancel="confirmDelete = false"
  />
</template>
