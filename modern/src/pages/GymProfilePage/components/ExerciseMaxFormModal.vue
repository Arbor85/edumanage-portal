<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { UserExerciseMax, UserExerciseMaxUpsert, ExcerciseOut } from '../../../types'
import BaseModal from '../../../components/BaseModal.vue'
import BaseButton from '../../../components/BaseButton.vue'
import ExercisePickerDialog from '../../../components/ExercisePickerDialog/index.vue'

const props = defineProps<{
  open: boolean
  editing: UserExerciseMax | null
}>()

const emit = defineEmits<{
  close: []
  save: [exerciseId: number, data: UserExerciseMaxUpsert, exerciseName: string]
}>()

const selectedExercise = ref<ExcerciseOut | null>(null)
const isExercisePickerOpen = ref(false)

const weight = ref<string>('')
const reps = ref<string>('')
const durationMins = ref<string>('')
const durationSecs = ref<string>('')
const distance = ref<string>('')
const note = ref<string>('')
const saving = ref(false)

const trackType = computed(() => {
  if (props.editing) return props.editing.activityTrackType
  return selectedExercise.value?.activityTrackType ?? null
})

const activityType = computed(() => {
  if (props.editing) return null
  return selectedExercise.value?.activityType ?? null
})

const showWeight = computed(() =>
  trackType.value === 'repetitions' &&
  (activityType.value === 'weighted' || activityType.value === 'machine' ||
   props.editing?.maxWeight != null)
)

watch(() => props.open, (val) => {
  if (!val) return
  selectedExercise.value = null
  saving.value = false
  if (props.editing) {
    weight.value = props.editing.maxWeight?.toString() ?? ''
    reps.value = props.editing.maxReps?.toString() ?? ''
    if (props.editing.maxDuration != null) {
      durationMins.value = Math.floor(props.editing.maxDuration / 60).toString()
      durationSecs.value = Math.floor(props.editing.maxDuration % 60).toString()
    } else {
      durationMins.value = ''
      durationSecs.value = ''
    }
    distance.value = props.editing.maxDistance?.toString() ?? ''
    note.value = props.editing.note ?? ''
  } else {
    weight.value = ''
    reps.value = ''
    durationMins.value = ''
    durationSecs.value = ''
    distance.value = ''
    note.value = ''
  }
})

function onExercisesAdded(exercises: ExcerciseOut[]) {
  if (exercises.length === 0) return
  selectedExercise.value = exercises[0]
  isExercisePickerOpen.value = false
  weight.value = ''
  reps.value = ''
  durationMins.value = ''
  durationSecs.value = ''
  distance.value = ''
}

async function submit() {
  const exerciseId = props.editing?.exerciseId ?? selectedExercise.value?.id
  const exerciseName = props.editing?.exerciseName ?? selectedExercise.value?.name ?? ''
  if (!exerciseId) return

  const data: UserExerciseMaxUpsert = { note: note.value.trim() || undefined }

  if (trackType.value === 'repetitions') {
    if (weight.value) data.maxWeight = parseFloat(weight.value)
    if (reps.value) data.maxReps = parseInt(reps.value)
  } else if (trackType.value === 'time') {
    const m = parseInt(durationMins.value || '0')
    const s = parseInt(durationSecs.value || '0')
    if (m > 0 || s > 0) data.maxDuration = m * 60 + s
  } else if (trackType.value === 'distance') {
    if (distance.value) data.maxDistance = parseFloat(distance.value)
  }

  saving.value = true
  try {
    emit('save', exerciseId, data, exerciseName)
  } finally {
    saving.value = false
  }
}

const isValid = computed(() => {
  if (!props.editing && !selectedExercise.value) return false
  if (trackType.value === 'repetitions') return !!reps.value || !!weight.value
  if (trackType.value === 'time') return !!durationMins.value || !!durationSecs.value
  if (trackType.value === 'distance') return !!distance.value
  return false
})
</script>

<template>
  <BaseModal :open="open" :title="editing ? 'Edit Max' : 'Add Max'" size="sm" @close="emit('close')">
    <div class="flex flex-col gap-4">
      <!-- Exercise picker (new only) -->
      <div v-if="!editing">
        <label class="block text-xs font-semibold text-text-secondary mb-1">Exercise</label>
        <button
          class="w-full text-left px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm bg-white dark:bg-surface-dark hover:border-primary/50 transition-colors"
          @click="isExercisePickerOpen = true"
        >
          <span v-if="selectedExercise" class="text-text-primary dark:text-white">{{ selectedExercise.name }}</span>
          <span v-else class="text-text-secondary">Pick an exercise…</span>
        </button>
      </div>

      <!-- Repetitions fields -->
      <template v-if="trackType === 'repetitions'">
        <div v-if="showWeight">
          <label class="block text-xs font-semibold text-text-secondary mb-1">Weight (kg)</label>
          <input
            v-model="weight"
            type="number"
            min="0"
            step="0.5"
            placeholder="e.g. 100"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm bg-white dark:bg-surface-dark text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-text-secondary mb-1">Reps</label>
          <input
            v-model="reps"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 5"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm bg-white dark:bg-surface-dark text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </template>

      <!-- Time fields -->
      <template v-else-if="trackType === 'time'">
        <div>
          <label class="block text-xs font-semibold text-text-secondary mb-1">Duration</label>
          <div class="flex items-center gap-2">
            <input
              v-model="durationMins"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm bg-white dark:bg-surface-dark text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span class="text-text-secondary text-sm flex-shrink-0">min</span>
            <input
              v-model="durationSecs"
              type="number"
              min="0"
              max="59"
              placeholder="0"
              class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm bg-white dark:bg-surface-dark text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span class="text-text-secondary text-sm flex-shrink-0">sec</span>
          </div>
        </div>
      </template>

      <!-- Distance fields -->
      <template v-else-if="trackType === 'distance'">
        <div>
          <label class="block text-xs font-semibold text-text-secondary mb-1">Distance (m)</label>
          <input
            v-model="distance"
            type="number"
            min="0"
            step="10"
            placeholder="e.g. 5000"
            class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm bg-white dark:bg-surface-dark text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </template>

      <!-- Note -->
      <div>
        <label class="block text-xs font-semibold text-text-secondary mb-1">Note (optional)</label>
        <input
          v-model="note"
          type="text"
          placeholder="e.g. fresh legs, competition day…"
          class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm bg-white dark:bg-surface-dark text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div class="flex gap-3 justify-end pt-1">
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" :disabled="!isValid || saving" @click="submit">
          {{ saving ? 'Saving…' : 'Save' }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>

  <ExercisePickerDialog
    :open="isExercisePickerOpen"
    @close="isExercisePickerOpen = false"
    @add="onExercisesAdded"
  />
</template>
