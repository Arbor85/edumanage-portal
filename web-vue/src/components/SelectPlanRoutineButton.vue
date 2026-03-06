<template>
  <div>
    <button
      type="button"
      @click="openDialog"
      :disabled="scheduledWorkouts.length === 0"
      class="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
    >
      {{ buttonText }}
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ dialogTitle }}</h3>
          <button
            type="button"
            @click="closeDialog"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <input
          v-model.trim="searchQuery"
          type="text"
          placeholder="Search by plan, workout, or client..."
          class="mb-3 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />

        <div class="max-h-80 space-y-2 overflow-auto rounded-md border border-slate-300 p-2 dark:border-slate-600">
          <button
            v-for="entry in filteredWorkouts"
            :key="entry.key"
            type="button"
            @click="selectedKey = entry.key"
            :class="[
              'w-full rounded px-3 py-2 text-left transition-colors',
              selectedKey === entry.key
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            ]"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {{ entry.workout.name }}
                </p>
                <p class="truncate text-xs text-slate-600 dark:text-slate-300">
                  {{ entry.planName }} • {{ entry.clientName }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ formatDate(entry.workout.date) }}</p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  {{ entry.workout.excercises.length }} exercise{{ entry.workout.excercises.length === 1 ? '' : 's' }}
                </p>
              </div>
            </div>
          </button>

          <p v-if="scheduledWorkouts.length === 0" class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300">
            No planned workouts available.
          </p>

          <p
            v-else-if="filteredWorkouts.length === 0"
            class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300"
          >
            No planned workouts match your search.
          </p>
        </div>

        <div class="mt-5 flex items-center justify-end gap-2">
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
            :disabled="!selectedWorkout"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start workout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Plan, PlanWorkout } from '../types/plan'

type ScheduledWorkoutEntry = {
  key: string
  planName: string
  clientName: string
  workout: PlanWorkout
}

const props = withDefaults(
  defineProps<{
    plans?: Plan[]
    buttonText?: string
    dialogTitle?: string
  }>(),
  {
    plans: () => [],
    buttonText: 'Start planned workout',
    dialogTitle: 'Select planned workout',
  },
)

const emit = defineEmits<{
  (event: 'select', workout: PlanWorkout): void
}>()

const isOpen = ref(false)
const selectedKey = ref('')
const searchQuery = ref('')

const scheduledWorkouts = computed((): ScheduledWorkoutEntry[] => {
  return props.plans.flatMap((plan) => {
    const clientName = plan.client?.name || plan.clientName || 'Unknown client'

    return plan.workouts.map((workout) => ({
      key: `${plan.id}-${workout.id}-${workout.date}`,
      planName: plan.name,
      clientName,
      workout,
    }))
  })
})

const filteredWorkouts = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()

  if (!normalizedQuery) {
    return scheduledWorkouts.value
  }

  return scheduledWorkouts.value.filter((entry) => {
    return (
      entry.planName.toLowerCase().includes(normalizedQuery) ||
      entry.clientName.toLowerCase().includes(normalizedQuery) ||
      entry.workout.name.toLowerCase().includes(normalizedQuery)
    )
  })
})

const selectedWorkout = computed(() => {
  return scheduledWorkouts.value.find((entry) => entry.key === selectedKey.value)?.workout || null
})

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDateOnly = (value: string) => {
  return value.split('T')[0] || value
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const openDialog = () => {
  const today = formatDateForInput(new Date())
  const todayEntry = scheduledWorkouts.value.find((entry) => getDateOnly(entry.workout.date) === today)

  selectedKey.value = todayEntry?.key || scheduledWorkouts.value[0]?.key || ''
  searchQuery.value = ''
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const applySelection = () => {
  if (!selectedWorkout.value) {
    return
  }

  emit('select', selectedWorkout.value)
  closeDialog()
}
</script>
