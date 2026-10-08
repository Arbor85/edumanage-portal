<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePageTitle } from '../../../composables/usePageTitle'
import type { ExcerciseOut, ExcerciseWriteRequest } from '../../../types'
import { useExerciseStore } from '../../../stores/exerciseStore'
import { useToast } from '../../../composables/useToast'
import BaseModal from '../../../components/BaseModal.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseTextarea from '../../../components/BaseTextarea.vue'
import BaseSelect from '../../../components/BaseSelect.vue'
import TagInput from '../../../components/TagInput.vue'
import BaseButton from '../../../components/BaseButton.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'

const ACTIVITY_TYPE_OPTIONS = [
  { value: 'weighted',   label: 'Weighted – free weights, barbells, dumbbells' },
  { value: 'machine',    label: 'Machine – cable/pulley machines, fixed-path equipment' },
  { value: 'bodyweight', label: 'Bodyweight – no added load, uses body weight' },
  { value: 'cardio',     label: 'Cardio – running, cycling, rowing, etc.' },
]

const ACTIVITY_TRACK_OPTIONS = [
  { value: 'repetitions', label: 'Repetitions – count reps per set' },
  { value: 'time',        label: 'Time – track duration in seconds' },
  { value: 'distance',    label: 'Distance – track distance in meters' },
]

const props = defineProps<{
  open: boolean
  exercise: ExcerciseOut | null
}>()
const emit = defineEmits<{ close: [] }>()

usePageTitle(() => props.exercise ? 'Edit Exercise' : 'New Exercise', () => props.open)

const exerciseStore = useExerciseStore()
const toast = useToast()

const form = ref<ExcerciseWriteRequest>({
  name: null, shortDescription: null, primaryMuscle: null,
  secondaryMuscles: [], tags: [],
  activityType: 'weighted', activityTrackType: 'repetitions',
  isActive: true,
})
const saving = ref(false)
const confirmDelete = ref(false)

watch(() => props.open, (val) => {
  if (val) {
    form.value = props.exercise
      ? {
          name: props.exercise.name,
          shortDescription: props.exercise.shortDescription,
          primaryMuscle: props.exercise.primaryMuscle,
          secondaryMuscles: [...(props.exercise.secondaryMuscles ?? [])],
          tags: [...(props.exercise.tags ?? [])],
          activityType: props.exercise.activityType ?? 'weighted',
          activityTrackType: props.exercise.activityTrackType ?? 'repetitions',
          isActive: props.exercise.isActive ?? true,
        }
      : {
          name: null, shortDescription: null, primaryMuscle: null,
          secondaryMuscles: [], tags: [],
          activityType: 'weighted', activityTrackType: 'repetitions',
        }
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
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-text-primary dark:text-white">Primary Muscle</label>
        <TagInput :model-value="!!form.primaryMuscle ? [form.primaryMuscle] : []" placeholder="Add muscle, press Enter" @update:model-value="form.primaryMuscle = $event[0]" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-text-primary dark:text-white">Secondary Muscles</label>
        <TagInput :model-value="form.secondaryMuscles ?? []" placeholder="Add muscle, press Enter" @update:model-value="form.secondaryMuscles = $event" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-text-primary dark:text-white">Tags <span class="text-text-secondary font-normal">(include difficulty: Beginner / Intermediate / Advanced)</span></label>
        <TagInput :model-value="form.tags ?? []" placeholder="Add tag, press Enter" @update:model-value="form.tags = $event" />
      </div>
      <BaseSelect
        :model-value="form.activityType"
        label="Activity Type"
        :options="ACTIVITY_TYPE_OPTIONS"
        @update:model-value="form.activityType = $event as typeof form.activityType"
      />
      <BaseSelect
        :model-value="form.activityTrackType"
        label="Track Type"
        :options="ACTIVITY_TRACK_OPTIONS"
        @update:model-value="form.activityTrackType = $event as typeof form.activityTrackType"
      />

      <div class="flex items-center justify-between rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark px-4 py-3">
        <div>
          <p class="text-sm font-medium text-text-primary dark:text-white">Active</p>
          <p class="text-xs text-text-secondary dark:text-white/50 mt-0.5">Inactive exercises are hidden from regular users</p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="form.isActive"
          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          :class="form.isActive ? 'bg-primary' : 'bg-gray-300 dark:bg-white/20'"
          @click="form.isActive = !form.isActive"
        >
          <span
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="form.isActive ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
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
