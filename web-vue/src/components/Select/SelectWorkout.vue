<template>
  <div>
    <label v-if="label" class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }}
    </label>

    <SearchInput v-model="searchQuery" placeholder="Search workouts..." class="mb-2" />

    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span>Loading workouts...</span>
      </div>
    </div>

    <div v-else class="custom-scrollbar max-h-64 space-y-2 overflow-auto rounded-md border border-slate-300 p-2 dark:border-slate-600">
      <div
        v-for="workout in filteredWorkouts"
        :key="workout.id"
        @click="selectWorkout(workout.id)"
        :class="[
          'cursor-pointer rounded px-3 py-2 transition-colors',
          modelValue === workout.id
            ? 'bg-emerald-100 dark:bg-emerald-900/30'
            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
        ]"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {{ workout.name }}
            </p>
            <p class="text-xs text-slate-600 dark:text-slate-400">
              {{ workout.excercises.length }} exercise{{ workout.excercises.length !== 1 ? 's' : '' }}
            </p>
          </div>

          <div
            v-if="modelValue === workout.id"
            class="text-emerald-600 dark:text-emerald-400"
          >
            ✓
          </div>
        </div>

        <div
          v-if="modelValue === workout.id && workout.excercises.length > 0"
          class="mt-2 space-y-1 border-t border-slate-200 pt-2 dark:border-slate-600"
        >
          <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Exercises:</p>
          <div class="space-y-0.5">
            <div
              v-for="(excercise, index) in workout.excercises"
              :key="`${workout.id}-ex-${index}`"
              class="text-xs text-slate-600 dark:text-slate-400"
            >
              • {{ excercise.name }} ({{ excercise.sets.length }} set{{ excercise.sets.length !== 1 ? 's' : '' }})
            </div>
          </div>
        </div>
      </div>

      <p v-if="currentWorkouts.length === 0" class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300">
        No workouts available. Create a workout first.
      </p>

      <p
        v-else-if="filteredWorkouts.length === 0"
        class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300"
      >
        No workouts match your search.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SearchInput from '../SearchInput.vue'
import type { Workout } from '../../types/workout'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    workouts?: Workout[]
    label?: string
    fetchFn?: () => Promise<Workout[]>
  }>(),
  {
    modelValue: '',
    workouts: () => [],
    label: 'Select workout',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', workoutId: string): void
}>()

const searchQuery = ref('')
const isLoading = ref(false)
const localWorkouts = ref<Workout[]>(props.workouts)
const dataFetched = ref(false)

const currentWorkouts = computed(() => localWorkouts.value.length > 0 ? localWorkouts.value : props.workouts)

const filteredWorkouts = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()

  if (!normalizedQuery) {
    return currentWorkouts.value
  }

  return currentWorkouts.value.filter((workout) => workout.name.toLowerCase().includes(normalizedQuery))
})

const selectWorkout = (workoutId: string) => {
  emit('update:modelValue', workoutId)
}

watch(() => props.workouts, (newWorkouts) => {
  if (!dataFetched.value) {
    localWorkouts.value = newWorkouts
  }
})
</script>
