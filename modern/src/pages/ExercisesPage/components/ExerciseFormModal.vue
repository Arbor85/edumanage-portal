<script setup lang="ts">
import { ref, watch, computed } from 'vue'
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
import ExerciseMuscleView from '../../../components/ExerciseMuscleView.vue'
import ExerciseImagePickerModal from './ExerciseImagePickerModal.vue'
import { MUSCLE_GROUPS, normalizeMuscle } from '../../../utils/muscleGroups'
import { exerciseImageMap } from '../../../data/exerciseImageMap'
import { EXERCISE_IMAGE_FALLBACK } from '../../../utils/exerciseImage'

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

const EQUIPMENT_BY_TYPE: Record<string, string[]> = {
  weighted:   ['Barbell', 'Dumbbell', 'Kettlebell', 'EZ Bar', 'Bench', 'Weight Plate', 'Pull-up Bar', 'Dip Bar'],
  machine:    ['Cable Machine', 'Smith Machine', 'Leg Press Machine', 'Lat Pulldown Machine', 'Row Machine', 'Chest Press Machine', 'Hack Squat Machine'],
  bodyweight: ['Pull-up Bar', 'Parallel Bars', 'Resistance Band', 'Gymnastic Rings', 'Bench'],
  cardio:     ['Treadmill', 'Stationary Bike', 'Rowing Machine', 'Elliptical', 'Jump Rope', 'Battle Ropes'],
}

const props = defineProps<{
  open: boolean
  exercise: ExcerciseOut | null
}>()
const emit = defineEmits<{ close: [] }>()

usePageTitle(() => props.exercise ? 'Edit Exercise' : 'New Exercise', () => props.open)

const exerciseStore = useExerciseStore()
const toast = useToast()

function blankForm(): ExcerciseWriteRequest {
  return {
    name: null, shortDescription: null, primaryMuscle: null,
    secondaryMuscles: [], tags: [],
    activityType: 'weighted', activityTrackType: 'repetitions',
    equipment: null, isActive: true,
  }
}

function formFromExercise(ex: ExcerciseOut): ExcerciseWriteRequest {
  return {
    name: ex.name,
    shortDescription: ex.shortDescription,
    primaryMuscle: ex.primaryMuscle ? normalizeMuscle(ex.primaryMuscle) : null,
    secondaryMuscles: (ex.secondaryMuscles ?? []).map(normalizeMuscle),
    tags: [...(ex.tags ?? [])],
    activityType: ex.activityType ?? 'weighted',
    activityTrackType: ex.activityTrackType ?? 'repetitions',
    equipment: ex.equipment ?? null,
    imagePath: ex.imagePath ?? null,
    gifPath: ex.gifPath ?? null,
    isActive: ex.isActive ?? true,
  }
}

const form = ref<ExcerciseWriteRequest>(blankForm())
const saving = ref(false)
const confirmDelete = ref(false)
const imagePicker = ref(false)

const previewImage = computed(() => {
  if (form.value.imagePath) return form.value.imagePath
  const mapEntry = exerciseImageMap[(form.value.name ?? '').toLowerCase()]
  return mapEntry?.imagePath ?? null
})

function onImageSelected(paths: { imagePath: string; gifPath: string }) {
  form.value.imagePath = paths.imagePath
  form.value.gifPath = paths.gifPath
  imagePicker.value = false
}

function clearImage() {
  form.value.imagePath = null
  form.value.gifPath = null
}

const availableEquipment = computed(() => EQUIPMENT_BY_TYPE[form.value.activityType] ?? [])

watch(() => form.value.activityType, () => {
  if (form.value.equipment && !availableEquipment.value.includes(form.value.equipment)) {
    form.value.equipment = null
  }
})

watch(() => props.open, (val) => {
  if (val) {
    form.value = props.exercise ? formFromExercise(props.exercise) : blankForm()
  }
})

function togglePrimary(key: string) {
  form.value.primaryMuscle = form.value.primaryMuscle === key ? null : key
}

function toggleSecondary(key: string) {
  const list = form.value.secondaryMuscles ?? []
  form.value.secondaryMuscles = list.includes(key) ? list.filter(m => m !== key) : [...list, key]
}

function toggleEquipment(item: string) {
  form.value.equipment = form.value.equipment === item ? null : item
}

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
  <BaseModal :open="open" :title="exercise ? 'Edit Exercise' : 'New Exercise'" size="xl" @close="emit('close')">
    <div class="flex gap-6 h-full">
      <!-- Left: form fields -->
      <form class="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar min-h-0 pr-1" @submit.prevent="save">
        <BaseInput v-model="form.name" label="Name" placeholder="e.g. Bench Press" />
        <BaseTextarea v-model="form.shortDescription" label="Description" placeholder="Brief description..." :rows="2" />

        <!-- Image -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-text-primary dark:text-white">Image</label>
          <div class="flex items-center gap-3">
            <div class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-surface-input border border-gray-200 dark:border-white/10">
              <img
                :src="previewImage ?? EXERCISE_IMAGE_FALLBACK"
                alt="Exercise image"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex flex-col gap-1.5 min-w-0">
              <p v-if="form.imagePath" class="text-xs text-text-secondary truncate">{{ form.imagePath.split('/').pop() }}</p>
              <p v-else-if="previewImage" class="text-xs text-text-secondary italic">Auto-matched from name</p>
              <p v-else class="text-xs text-text-secondary italic">No image selected</p>
              <div class="flex gap-1.5">
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-white/10 bg-surface-card text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-surface-input transition-colors"
                  @click="imagePicker = true"
                >{{ form.imagePath ? 'Change' : 'Select' }}</button>
                <button
                  v-if="form.imagePath"
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-xs font-medium border border-gray-200 dark:border-white/10 bg-surface-card text-text-secondary hover:text-red-500 hover:border-red-300 transition-colors"
                  @click="clearImage"
                >Remove</button>
              </div>
            </div>
          </div>
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

        <!-- Equipment -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-text-primary dark:text-white">Equipment</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="item in availableEquipment"
              :key="item"
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
              :class="form.equipment === item
                ? 'bg-primary border-primary text-white'
                : 'bg-surface-card border-gray-200 dark:border-white/10 text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-surface-input'"
              @click="toggleEquipment(item)"
            >{{ item }}</button>
          </div>
        </div>

        <!-- Primary Muscle -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-text-primary dark:text-white">Primary Muscle</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="m in MUSCLE_GROUPS"
              :key="m.key"
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
              :class="form.primaryMuscle === m.key
                ? 'bg-primary border-primary text-white'
                : 'bg-surface-card border-gray-200 dark:border-white/10 text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-surface-input'"
              @click="togglePrimary(m.key)"
            >{{ m.label }}</button>
          </div>
        </div>

        <!-- Secondary Muscles -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-text-primary dark:text-white">Secondary Muscles</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="m in MUSCLE_GROUPS"
              :key="m.key"
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
              :class="(form.secondaryMuscles ?? []).includes(m.key)
                ? 'bg-primary/15 border-primary/40 text-primary'
                : 'bg-surface-card border-gray-200 dark:border-white/10 text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-surface-input'"
              @click="toggleSecondary(m.key)"
            >{{ m.label }}</button>
          </div>
        </div>

        <!-- Tags -->
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-text-primary dark:text-white">
            Tags <span class="text-text-secondary font-normal">(include difficulty: Beginner / Intermediate / Advanced)</span>
          </label>
          <TagInput :model-value="form.tags ?? []" placeholder="Add tag, press Enter" @update:model-value="form.tags = $event" />
        </div>

        <!-- Active toggle -->
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

      <!-- Right: live muscle visualization -->
      <div class="w-52 flex-shrink-0 hidden sm:flex flex-col gap-2">
        <p class="text-sm font-medium text-text-primary dark:text-white">Muscle Preview</p>
        <div class="rounded-xl bg-gray-900 p-4 flex-1">
          <ExerciseMuscleView
            :primary-muscle="form.primaryMuscle ?? ''"
            :secondary-muscles="(form.secondaryMuscles ?? []) as string[]"
            interactive
            @select="togglePrimary"
          />
        </div>
      </div>
    </div>

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

  <ExerciseImagePickerModal
    :open="imagePicker"
    :current="form.imagePath ?? null"
    @select="onImageSelected"
    @close="imagePicker = false"
  />
</template>
