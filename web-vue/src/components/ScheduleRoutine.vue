<template>
  <div>
    <button
      type="button"
      @click="openDialog"
      class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
    >
      {{ buttonText }}
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Schedule workout</h3>
          <button
            type="button"
            @click="closeDialog"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Select routine
            </label>
            <input
              v-model.trim="searchQuery"
              type="text"
              placeholder="Search routines..."
              class="mb-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />

            <div class="max-h-64 space-y-2 overflow-auto rounded-md border border-slate-300 p-2 dark:border-slate-600">
              <div
                v-for="routine in filteredRoutines"
                :key="routine.id"
                @click="selectRoutine(routine)"
                :class="[
                  'cursor-pointer rounded px-3 py-2 transition-colors',
                  draftRoutineId === routine.id
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                ]"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {{ routine.name }}
                    </p>
                    <p class="text-xs text-slate-600 dark:text-slate-400">
                      {{ routine.excercises.length }} exercise{{ routine.excercises.length !== 1 ? 's' : '' }}
                    </p>
                  </div>

                  <div
                    v-if="draftRoutineId === routine.id"
                    class="text-emerald-600 dark:text-emerald-400"
                  >
                    ✓
                  </div>
                </div>

                <!-- Routine Details Preview -->
                <div
                  v-if="draftRoutineId === routine.id && routine.excercises.length > 0"
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

              <p v-if="routines.length === 0" class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300">
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

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Schedule date
            </label>
            <input
              v-model="draftDate"
              type="date"
              class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div class="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="closeDialog"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="applySelection"
            :disabled="!canApply"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Schedule workout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Routine } from '../types/routine'
import type { PlanWorkout } from '../types/plan'

const props = withDefaults(
  defineProps<{
    routines?: Routine[]
    buttonText?: string
  }>(),
  {
    routines: () => [],
    buttonText: 'Add workout',
  },
)

const emit = defineEmits<{
  (event: 'schedule', workout: PlanWorkout): void
}>()

const isOpen = ref(false)
const draftRoutineId = ref<string>('')
const draftDate = ref<string>('')
const searchQuery = ref('')

const filteredRoutines = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()

  if (!normalizedQuery) {
    return props.routines
  }

  return props.routines.filter((routine) => {
    return routine.name.toLowerCase().includes(normalizedQuery)
  })
})

const canApply = computed(() => {
  return draftRoutineId.value && draftDate.value
})

const openDialog = () => {
  draftRoutineId.value = ''
  draftDate.value = new Date().toISOString().split('T')[0] || ''
  searchQuery.value = ''
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const selectRoutine = (routine: Routine) => {
  draftRoutineId.value = routine.id
}

const applySelection = () => {
  if (!canApply.value) return

  const selectedRoutine = props.routines.find(r => r.id === draftRoutineId.value)
  if (!selectedRoutine) return

  const workout: PlanWorkout = {
    id: selectedRoutine.id,
    name: selectedRoutine.name,
    excercises: selectedRoutine.excercises,
    date: draftDate.value,
  }

  emit('schedule', workout)
  closeDialog()
}
</script>
