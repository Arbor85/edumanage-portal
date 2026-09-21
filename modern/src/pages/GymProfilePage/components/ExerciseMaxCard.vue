<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UserExerciseMax } from '../../../types'
import { Pencil, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  max: UserExerciseMax
  readonly?: boolean
}>()

const emit = defineEmits<{ edit: []; remove: [] }>()

const FALLBACK = '/images/benchpress.png'
const imgError = ref(false)
const imgSrc = computed(() => imgError.value ? null : (props.max.imagePath ?? FALLBACK))
function onImgError() { imgError.value = true }

function formatValue(m: UserExerciseMax): string {
  if (m.activityTrackType === 'repetitions') {
    if (m.maxWeight != null && m.maxReps != null) return `${m.maxWeight} kg × ${m.maxReps} reps`
    if (m.maxReps != null) return `${m.maxReps} reps`
  }
  if (m.activityTrackType === 'time' && m.maxDuration != null) {
    const mins = Math.floor(m.maxDuration / 60)
    const secs = Math.floor(m.maxDuration % 60)
    return `${mins}:${String(secs).padStart(2, '0')}`
  }
  if (m.activityTrackType === 'distance' && m.maxDistance != null) {
    return m.maxDistance >= 1000
      ? `${(m.maxDistance / 1000).toFixed(1)} km`
      : `${m.maxDistance} m`
  }
  return '—'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-4 flex items-start gap-4">
    <!-- Thumbnail -->
    <div class="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface-input">
      <img
        v-if="imgSrc"
        :src="imgSrc"
        :alt="max.exerciseName"
        class="w-full h-full object-cover"
        @error="onImgError"
      />
    </div>

    <div class="flex-1 min-w-0">
      <p class="font-semibold text-text-primary dark:text-white text-sm truncate">{{ max.exerciseName }}</p>
      <p v-if="max.primaryMuscle" class="text-xs text-text-secondary capitalize mt-0.5">{{ max.primaryMuscle }}</p>
      <p class="text-xl font-bold text-primary mt-2">{{ formatValue(max) }}</p>
      <p v-if="max.note" class="text-xs text-text-secondary mt-1 line-clamp-2">{{ max.note }}</p>
      <p class="text-xs text-text-muted mt-1">Updated: {{ formatDate(max.updatedAt) }}</p>
    </div>

    <div v-if="!readonly" class="flex gap-1.5 flex-shrink-0">
      <button
        class="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
        @click="emit('edit')"
      >
        <Pencil class="w-4 h-4" />
      </button>
      <button
        class="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        @click="emit('remove')"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
