<template>
    <div class="w-full max-w-7xl pb-8">
        <div class="mb-5">
            <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Home</h1>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Start a training session from scratch, an existing plan, or a saved routine.
            </p>
        </div>

        <div
            v-if="errorMessage"
            class="mb-4 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
        >
            {{ errorMessage }}
        </div>

        <div
            v-if="isLoading"
            class="mb-4 flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-8 dark:border-slate-700 dark:bg-slate-800"
        >
            <div class="inline-flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
                <svg class="h-5 w-5 animate-spin text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Loading workout data...</span>
            </div>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div class="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                    type="button"
                    @click="openStartWorkout('empty')"
                    class="inline-flex items-center justify-center rounded-md border border-emerald-500 bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                    Start empty workout
                </button>

                <SelectPlanRoutineButton
                    :plans="plans"
                    button-text="Start planned workout"
                    @select="startPlannedWorkout"
                />

                <SelectRoutineButton
                    :routines="routines"
                    button-text="Start defined routine"
                    @select="startRoutineWorkout"
                />
            </div>

            <div class="grid grid-cols-1 gap-2 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-3">
                <p class="rounded-md bg-slate-100 px-3 py-2 dark:bg-slate-700/40">Plans available: {{ plans.length }}</p>
                <p class="rounded-md bg-slate-100 px-3 py-2 dark:bg-slate-700/40">Routines available: {{ routines.length }}</p>
                <p class="rounded-md bg-slate-100 px-3 py-2 dark:bg-slate-700/40">Excercises available: {{ excercises.length }}</p>
            </div>
        </div>

        <StartWorkout
            :open="showStartWorkout"
            :mode="startMode"
            :plans="plans"
            :routines="routines"
            :excercises="excercises"
            :initial-workout="prefilledWorkout"
            @close="closeStartWorkout"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SelectPlanRoutineButton from '../components/SelectPlanRoutineButton.vue'
import SelectRoutineButton from '../components/SelectRoutineButton.vue'
import StartWorkout from '../components/StartWorkout.vue'
import { usePageTitle } from '../composables/usePageTitle'
import { useExcercisesApi } from '../services/excercisesApi'
import { usePlansApi } from '../services/plansApi'
import { useRoutinesApi } from '../services/routinesApi'
import type { Excercise } from '../types/excercise'
import type { Plan, PlanWorkout } from '../types/plan'
import type { Routine } from '../types/routine'

usePageTitle('Home')

type StartWorkoutMode = 'empty' | 'plan' | 'routine'

const plansApi = usePlansApi()
const routinesApi = useRoutinesApi()
const excercisesApi = useExcercisesApi()

const plans = ref<Plan[]>([])
const routines = ref<Routine[]>([])
const excercises = ref<Excercise[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const showStartWorkout = ref(false)
const startMode = ref<StartWorkoutMode>('empty')
const prefilledWorkout = ref<PlanWorkout | null>(null)

const openStartWorkout = (mode: StartWorkoutMode) => {
    prefilledWorkout.value = null
    startMode.value = mode
    showStartWorkout.value = true
}

const startPlannedWorkout = (workout: PlanWorkout) => {
    prefilledWorkout.value = workout
    startMode.value = 'plan'
    showStartWorkout.value = true
}

const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const startRoutineWorkout = (routine: Routine) => {
    prefilledWorkout.value = {
        id: routine.id,
        name: routine.name,
        excercises: routine.excercises,
        date: formatDateForInput(new Date()),
    }
    startMode.value = 'routine'
    showStartWorkout.value = true
}

const closeStartWorkout = () => {
    showStartWorkout.value = false
    prefilledWorkout.value = null
}

const loadData = async () => {
    isLoading.value = true
    errorMessage.value = ''

    try {
        const [plansResult, routinesResult, excercisesResult] = await Promise.all([
            plansApi.listPlans(),
            routinesApi.listRoutines(),
            excercisesApi.listExcercises(),
        ])

        plans.value = plansResult
        routines.value = routinesResult
        excercises.value = excercisesResult
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Failed to load workout data'
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    loadData()
})
</script>