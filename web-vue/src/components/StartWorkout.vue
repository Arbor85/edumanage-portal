<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[90] bg-slate-900/60"
    @click.self="emitClose"
  >
    <div class="h-full w-full bg-slate-100 dark:bg-slate-900">
      <div class="mx-auto flex h-full w-full max-w-7xl flex-col px-4 py-4 sm:px-6">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ dialogTitle }}</h2>
            <p class="text-sm text-slate-600 dark:text-slate-300">Build your workout, track sets, and mark completed sets.</p>
          </div>
          <button
            type="button"
            @click="emitClose"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Close
          </button>
        </div>

        <div class="mb-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">Progress</p>
              <p class="text-xs text-slate-600 dark:text-slate-300">
                {{ completedSets }} / {{ totalSets }} sets completed
              </p>
            </div>
            <SelectExcercise v-model="selectedExcerciseNames" :options="excercises" button-text="Add excercises" />
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <div v-if="workoutExcercises.length === 0" class="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-300">
            No excercises yet. Use "Add excercises" to build this workout.
          </div>

          <div v-else class="space-y-3">
            <article
              v-for="(excercise, excerciseIndex) in workoutExcercises"
              :key="excercise.name"
              class="rounded-md border border-slate-200 p-3 dark:border-slate-700"
            >
              <div class="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ excercise.name }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-300">
                    {{ excercise.isBodyweight ? 'Bodyweight' : 'Weighted' }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="addSet(excerciseIndex)"
                    class="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  >
                    Add set
                  </button>
                  <button
                    v-if="hasIncompleteSets(excercise)"
                    type="button"
                    @click="skipRemainingSets(excerciseIndex)"
                    class="inline-flex items-center rounded-md border border-slate-300 bg-white px-1 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  >
                    <SkipForward :size="12" class="mr-1" />
                    Skip
                  </button>
                </div>
              </div>

              <div v-if="excercise.sets.length === 0" class="text-xs text-slate-500 dark:text-slate-300">
                No sets yet.
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="(setItem, setIndex) in excercise.sets"
                  :key="`${excercise.name}-${setIndex}`"
                  class="grid grid-cols-2 gap-2 rounded-md bg-slate-100/70 p-2 dark:bg-slate-700/40 md:grid-cols-7"
                >
                  <select
                    v-model="setItem.type"
                    class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 md:col-span-2"
                  >
                    <option value="warmup">warmup</option>
                    <option value="normal">normal</option>
                    <option value="fail">fail</option>
                  </select>

                  <input
                    v-model.number="setItem.reps"
                    type="number"
                    min="0"
                    placeholder="Reps"
                    class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />

                  <input
                    v-if="!excercise.isBodyweight"
                    v-model.number="setItem.weight"
                    type="number"
                    min="0"
                    step="0.25"
                    placeholder="Weight"
                    class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />

                  <div
                    v-else
                    class="hidden md:block"
                    aria-hidden="true"
                  />

                  <div class="col-span-2 flex items-center justify-end md:col-span-3">
                    <button
                      type="button"
                      @click="toggleSetCompleted(excerciseIndex, setIndex)"
                      class="inline-flex h-6 w-6 items-center justify-center rounded-md border text-xs font-medium"
                      :class="setItem.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
                      :title="setItem.completed ? 'Mark as not completed' : 'Mark as completed'"
                    >
                      <Check :size="18" />
                    </button>

                    <button
                      v-if="!setItem.completed"
                      type="button"
                      @click="skipSet(excerciseIndex, setIndex)"
                      class="inline-flex ml-2 h-6 w-6 items-center justify-center rounded-md border text-xs font-medium border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                    >
                      <SkipForward :size="18" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, SkipForward } from 'lucide-vue-next'
import SelectExcercise from './SelectExcercise.vue'
import type { Excercise } from '../types/excercise'
import type { Plan, PlanWorkout } from '../types/plan'
import type { Routine, RoutineExcercise, RoutineSet } from '../types/routine'

type StartWorkoutMode = 'empty' | 'plan' | 'routine'

type WorkoutSet = RoutineSet & {
  completed: boolean
}

type WorkoutExcercise = {
  name: string
  isBodyweight: boolean
  sets: WorkoutSet[]
}

const props = withDefaults(
  defineProps<{
    open: boolean
    mode: StartWorkoutMode
    plans?: Plan[]
    routines?: Routine[]
    excercises?: Excercise[]
    initialWorkout?: PlanWorkout | null
  }>(),
  {
    plans: () => [],
    routines: () => [],
    excercises: () => [],
    initialWorkout: null,
  },
)

const emit = defineEmits<{
  (event: 'close'): void
}>()

const selectedPlanId = ref('')
const selectedWorkoutId = ref('')
const selectedExcerciseNames = ref<string[]>([])
const workoutExcercises = ref<WorkoutExcercise[]>([])

const selectedPlan = computed(() => {
  return props.plans.find((plan) => plan.id === selectedPlanId.value)
})

const selectedWorkout = computed(() => {
  return selectedPlan.value?.workouts.find((workout) => workout.id === selectedWorkoutId.value)
})

const dialogTitle = computed(() => {
  if (props.mode === 'plan') {
    return 'Start planned workout'
  }

  if (props.mode === 'routine') {
    return 'Start routine workout'
  }

  return 'Start empty workout'
})

const totalSets = computed(() => {
  return workoutExcercises.value.reduce((total, excercise) => total + excercise.sets.length, 0)
})

const completedSets = computed(() => {
  return workoutExcercises.value.reduce((total, excercise) => {
    return total + excercise.sets.filter((setItem) => setItem.completed).length
  }, 0)
})

const toWorkoutSet = (setItem: RoutineSet): WorkoutSet => {
  return {
    type: setItem.type,
    reps: setItem.reps,
    weight: setItem.weight,
    completed: false,
  }
}

const toWorkoutExcercise = (excercise: RoutineExcercise): WorkoutExcercise => {
  return {
    name: excercise.name,
    isBodyweight: excercise.isBodyweight,
    sets: excercise.sets.map(toWorkoutSet),
  }
}

const createDefaultSet = (isBodyweight: boolean): WorkoutSet => {
  return {
    type: 'normal',
    reps: null,
    weight: isBodyweight ? null : null,
    completed: false,
  }
}

const createExcerciseFromName = (name: string): WorkoutExcercise => {
  const matched = props.excercises.find((excercise) => excercise.name === name)
  const isBodyweight = matched
    ? matched.tags.some((tag) => {
      const normalizedTag = tag.toLowerCase()
      return normalizedTag.includes('bodyweight') || normalizedTag.includes('calisthenics')
    })
    : false

  return {
    name,
    isBodyweight,
    sets: [createDefaultSet(isBodyweight)],
  }
}

const resetForMode = () => {
  selectedPlanId.value = ''
  selectedWorkoutId.value = ''
  selectedExcerciseNames.value = []

  if (props.initialWorkout) {
    applySourceWorkout(props.initialWorkout)
    return
  }

  if (props.mode === 'empty') {
    workoutExcercises.value = []
    return
  }

  if (props.mode === 'plan') {
    workoutExcercises.value = []
    return
  }

  workoutExcercises.value = []
}

const hasIncompleteSets = (excercise: WorkoutExcercise) => {
  return excercise.sets.some((setItem) => !setItem.completed)
}

const addSet = (excerciseIndex: number) => {
  const excercise = workoutExcercises.value[excerciseIndex]

  if (!excercise) {
    return
  }

  excercise.sets.push(createDefaultSet(excercise.isBodyweight))
}

const toggleSetCompleted = (excerciseIndex: number, setIndex: number) => {
  const excercise = workoutExcercises.value[excerciseIndex]

  if (!excercise) {
    return
  }

  const setItem = excercise.sets[setIndex]

  if (!setItem) {
    return
  }

  setItem.completed = !setItem.completed
}

const skipSet = (excerciseIndex: number, setIndex: number) => {
  const excercise = workoutExcercises.value[excerciseIndex]

  if (!excercise) {
    return
  }

  excercise.sets.splice(setIndex, 1)
}

const skipRemainingSets = (excerciseIndex: number) => {
  const excercise = workoutExcercises.value[excerciseIndex]

  if (!excercise) {
    return
  }

  excercise.sets = excercise.sets.filter((setItem) => setItem.completed)
}

const applySourceWorkout = (workout: PlanWorkout | null) => {
  if (!workout) {
    return
  }

  workoutExcercises.value = workout.excercises.map(toWorkoutExcercise)
  selectedExcerciseNames.value = workout.excercises.map((excercise) => excercise.name)
}

const emitClose = () => {
  emit('close')
}

watch(
  () => [props.open, props.mode] as const,
  ([isOpen]) => {
    if (isOpen) {
      resetForMode()
    }
  },
)

watch(selectedWorkout, (workout) => {
  if (props.open && props.mode === 'plan') {
    applySourceWorkout(workout || null)
  }
})

watch(selectedPlanId, () => {
  selectedWorkoutId.value = ''
})

watch(selectedExcerciseNames, (names) => {
  const existingMap = new Map(workoutExcercises.value.map((excercise) => [excercise.name, excercise]))

  workoutExcercises.value = names.map((name) => {
    const existing = existingMap.get(name)
    return existing ? existing : createExcerciseFromName(name)
  })
})

watch(
  workoutExcercises,
  (list) => {
    list.forEach((excercise) => {
      excercise.sets.forEach((setItem) => {
        if (excercise.isBodyweight) {
          setItem.weight = null
        }
      })
    })
  },
  { deep: true },
)
</script>
