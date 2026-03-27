<template>
  <div>
    <label v-if="label" class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {{ label }}
    </label>

    <SearchInput v-model="searchQuery" placeholder="Search routines..." class="mb-2" />

    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span>Loading routines...</span>
      </div>
    </div>

    <div v-else class="custom-scrollbar max-h-64 space-y-2 overflow-auto rounded-md border border-slate-300 p-2 dark:border-slate-600">
      <div
        v-for="routine in filteredRoutines"
        :key="routine.id"
        @click="selectRoutine(routine.id)"
        :class="[
          'cursor-pointer rounded px-3 py-2 transition-colors',
          modelValue === routine.id
            ? 'bg-emerald-100 dark:bg-emerald-900/30'
            : 'hover:bg-slate-100 dark:hover:bg-slate-700'
        ]"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {{ routine.name }}
            </p>
            <p class="text-xs text-slate-600 dark:text-slate-400">
              {{ routine.excercises.length }} exercise{{ routine.excercises.length !== 1 ? 's' : '' }}
            </p>
          </div>

          <div
            v-if="modelValue === routine.id"
            class="text-emerald-600 dark:text-emerald-400"
          >
            ✓
          </div>
        </div>

        <div
          v-if="modelValue === routine.id && routine.excercises.length > 0"
          class="mt-2 space-y-1 border-t border-slate-200 pt-2 dark:border-slate-600"
        >
          <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Exercises:</p>
          <div class="space-y-0.5">
            <div
              v-for="(excercise, index) in routine.excercises"
              :key="`${routine.id}-ex-${index}`"
              class="text-xs text-slate-600 dark:text-slate-400"
            >
              • {{ excercise.name }} ({{ excercise.sets.length }} set{{ excercise.sets.length !== 1 ? 's' : '' }})
            </div>
          </div>
        </div>
      </div>

      <p v-if="currentRoutines.length === 0" class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300">
        No routines available. Create a routine first.
      </p>

      <p
        v-else-if="filteredRoutines.length === 0"
        class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300"
      >
        No routines match your search.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SearchInput from '../SearchInput.vue'
import type { Routine } from '../../types/routine'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    routines?: Routine[]
    label?: string
    fetchFn?: () => Promise<Routine[]>
  }>(),
  {
    modelValue: '',
    routines: () => [],
    label: 'Select routine',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', routineId: string): void
}>()

const searchQuery = ref('')
const isLoading = ref(false)
const localRoutines = ref<Routine[]>(props.routines)
const dataFetched = ref(false)

const currentRoutines = computed(() => localRoutines.value.length > 0 ? localRoutines.value : props.routines)

const filteredRoutines = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()

  if (!normalizedQuery) {
    return currentRoutines.value
  }

  return currentRoutines.value.filter((routine) => routine.name.toLowerCase().includes(normalizedQuery))
})

const selectRoutine = (routineId: string) => {
  emit('update:modelValue', routineId)
}

watch(() => props.routines, (newRoutines) => {
  if (!dataFetched.value) {
    localRoutines.value = newRoutines
  }
})
</script>
