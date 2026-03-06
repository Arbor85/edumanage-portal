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
        </div>

        <div class="relative mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <div
            class="pointer-events-none absolute inset-y-0 left-0 bg-emerald-200/60 transition-[width] duration-300 dark:bg-emerald-900/30"
            :style="{ width: `${progressPercent}%` }"
            aria-hidden="true"
          />

          <div class="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">Progress</p>
              <p class="text-xs text-slate-600 dark:text-slate-300">
                {{ completedSets }} / {{ totalSets }} sets completed
              </p>
              <p class="text-xs font-medium text-slate-700 dark:text-slate-200">
                Elapsed: {{ elapsedTimeLabel }}
              </p>
            </div>
            <SelectExcercise v-model="selectedExcerciseNames" :options="excercises" button-text="Add excercises" />
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 pb-24 dark:border-slate-700 dark:bg-slate-800">
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
                    class="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
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

        <DialogActionPanel
          primary-label="Finish workout"
          secondary-label="Abandon"
          secondary-variant="default"
          :dialog-mode="true"
          @primary-click="finishWorkout"
          @secondary-click="requestAbandonWorkout"
        />
      </div>
    </div>

    <div
      v-if="showAbandonConfirm"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="showAbandonConfirm = false"
    >
      <div class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">Abandon workout?</h3>
        <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">
          You have completed {{ completedSets }} set{{ completedSets === 1 ? '' : 's' }}. This progress will be discarded.
        </p>

        <div class="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="showAbandonConfirm = false"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmAbandonWorkout"
            class="inline-flex items-center rounded-md border border-rose-500 bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600"
          >
            Abandon
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Check, SkipForward } from 'lucide-vue-next'
import DialogActionPanel from './DialogActionPanel.vue'
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

type StartedWorkoutSession = {
  mode: StartWorkoutMode
  excercises: WorkoutExcercise[]
  startedAt?: string
  updatedAt: string
}

type CompletedWorkoutPayload = {
  mode: StartWorkoutMode
  startedAt: string
  completedAt: string
  durationSeconds: number
  totalSets: number
  completedSets: number
  excercises: WorkoutExcercise[]
  sourceWorkout?: {
    id: string
    name: string
    date: string
  }
}

const props = withDefaults(
  defineProps<{
    open: boolean
    mode: StartWorkoutMode
    plans?: Plan[]
    routines?: Routine[]
    excercises?: Excercise[]
    initialWorkout?: PlanWorkout | null
    initialSession?: StartedWorkoutSession | null
  }>(),
  {
    plans: () => [],
    routines: () => [],
    excercises: () => [],
    initialWorkout: null,
    initialSession: null,
  },
)

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'session-change', payload: StartedWorkoutSession): void
  (event: 'finish', payload: CompletedWorkoutPayload): void
  (event: 'abandon'): void
}>()

const selectedPlanId = ref('')
const selectedWorkoutId = ref('')
const selectedExcerciseNames = ref<string[]>([])
const workoutExcercises = ref<WorkoutExcercise[]>([])
const showAbandonConfirm = ref(false)
const workoutStartedAt = ref('')
const timerNow = ref(Date.now())
let timerHandle: ReturnType<typeof setInterval> | null = null

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

const progressPercent = computed(() => {
  if (totalSets.value === 0) {
    return 0
  }

  return Math.round((completedSets.value / totalSets.value) * 100)
})

const elapsedSeconds = computed(() => {
  if (!workoutStartedAt.value) {
    return 0
  }

  const startedAtMs = new Date(workoutStartedAt.value).getTime()

  if (Number.isNaN(startedAtMs)) {
    return 0
  }

  return Math.max(0, Math.floor((timerNow.value - startedAtMs) / 1000))
})

const elapsedTimeLabel = computed(() => {
  const total = elapsedSeconds.value
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const startTimer = () => {
  timerNow.value = Date.now()

  if (timerHandle) {
    clearInterval(timerHandle)
  }

  timerHandle = setInterval(() => {
    timerNow.value = Date.now()
  }, 1000)
}

const stopTimer = () => {
  if (timerHandle) {
    clearInterval(timerHandle)
    timerHandle = null
  }
}

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

const cloneWorkoutExcercises = (excercises: WorkoutExcercise[]): WorkoutExcercise[] => {
  return excercises.map((excercise) => ({
    ...excercise,
    sets: excercise.sets.map((setItem) => ({ ...setItem })),
  }))
}

const resetForMode = () => {
  selectedPlanId.value = ''
  selectedWorkoutId.value = ''
  selectedExcerciseNames.value = []
  workoutStartedAt.value = props.initialSession?.startedAt || new Date().toISOString()
  startTimer()

  if (props.initialSession) {
    workoutExcercises.value = cloneWorkoutExcercises(props.initialSession.excercises)
    selectedExcerciseNames.value = props.initialSession.excercises.map((excercise) => excercise.name)
    return
  }

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
  showAbandonConfirm.value = false
  stopTimer()
  emit('close')
}

const finishWorkout = () => {
  const normalizedExcercises = cloneWorkoutExcercises(workoutExcercises.value)

  emit('finish', {
    mode: props.mode,
    startedAt: workoutStartedAt.value || new Date().toISOString(),
    completedAt: new Date().toISOString(),
    durationSeconds: elapsedSeconds.value,
    totalSets: totalSets.value,
    completedSets: completedSets.value,
    excercises: normalizedExcercises,
    sourceWorkout: props.initialWorkout
      ? {
        id: props.initialWorkout.id,
        name: props.initialWorkout.name,
        date: props.initialWorkout.date,
      }
      : undefined,
  })
  emitClose()
}

const requestAbandonWorkout = () => {
  if (completedSets.value > 0) {
    showAbandonConfirm.value = true
    return
  }

  confirmAbandonWorkout()
}

const confirmAbandonWorkout = () => {
  showAbandonConfirm.value = false
  emit('abandon')
  emitClose()
}

watch(
  () => [props.open, props.mode] as const,
  ([isOpen]) => {
    if (isOpen) {
      resetForMode()
      return
    }

    stopTimer()
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

    if (props.open) {
      const normalizedExcercises = cloneWorkoutExcercises(list)

      emit('session-change', {
        mode: props.mode,
        excercises: normalizedExcercises,
        startedAt: workoutStartedAt.value,
        updatedAt: new Date().toISOString(),
      })
    }
  },
  { deep: true },
)

onBeforeUnmount(() => {
  stopTimer()
})
</script>
