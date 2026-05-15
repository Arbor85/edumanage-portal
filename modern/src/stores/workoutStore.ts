import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  ActiveWorkoutState,
  ActiveExercise,
  RoutineOut,
  PlanWorkoutOutput,
  WorkoutHistoryOut,
  CompleteRoutineCreate,
  CompletedRoutineExcercise,
  CompletedRoutineSet,
} from '../types'
import * as routinesApi from '../services/routinesApi'

const LS_ACTIVE = 'activeWorkout'
const LS_HISTORY = 'workoutHistory'
const HISTORY_CAP = 100

export const useWorkoutStore = defineStore('workout', () => {
  const activeWorkout = ref<ActiveWorkoutState | null>(null)
  const elapsedSeconds = ref(0)
  const restSecondsLeft = ref<number | null>(null)
  const isResting = ref(false)
  const history = ref<WorkoutHistoryOut[]>([])

  let timerHandle: ReturnType<typeof setInterval> | null = null
  let restHandle: ReturnType<typeof setInterval> | null = null

  function persist() {
    localStorage.setItem(LS_ACTIVE, JSON.stringify(activeWorkout.value))
  }

  function startElapsedTimer() {
    if (timerHandle) clearInterval(timerHandle)
    timerHandle = setInterval(() => {
      if (!activeWorkout.value) return
      if (activeWorkout.value.status === 'in_progress') {
        const started = new Date(activeWorkout.value.startedAt).getTime()
        const now = Date.now()
        const paused = activeWorkout.value.totalPausedSeconds * 1000
        elapsedSeconds.value = Math.floor((now - started - paused) / 1000)
      }
    }, 1000)
  }

  function buildActiveExercises(routine: RoutineOut): ActiveExercise[] {
    return (routine.excercises ?? []).map((ex) => ({
      name: ex.name ?? '',
      isBodyweight: ex.isBodyweight,
      skipped: false,
      currentSetIndex: 0,
      sets: (ex.sets ?? []).map((s, i) => ({
        setNumber: i + 1,
        reps: s.reps,
        weight: s.weight,
        targetReps: s.reps,
        targetWeight: s.weight,
        actualReps: null,
        actualWeight: null,
        completed: false,
        isBodyweight: ex.isBodyweight,
        note: s.note,
      })),
    }))
  }

  function startFromRoutine(routine: RoutineOut) {
    activeWorkout.value = {
      routineName: routine.name,
      mode: 'routine',
      sourceWorkout: { id: routine.id, name: routine.name, date: new Date().toISOString().split('T')[0] },
      startedAt: new Date().toISOString(),
      pausedAt: null,
      totalPausedSeconds: 0,
      elapsedSeconds: 0,
      exercises: buildActiveExercises(routine),
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      paused: false,
      status: 'in_progress',
    }
    persist()
    startElapsedTimer()
  }

  function startFromPlanWorkout(workout: PlanWorkoutOutput, _planId: string) {
    const fakeRoutine: RoutineOut = {
      id: workout.id,
      userId: null,
      name: workout.name,
      note: workout.note,
      excercises: workout.excercises,
    }
    activeWorkout.value = {
      routineName: workout.name,
      mode: 'plan',
      sourceWorkout: { id: workout.id, name: workout.name, date: workout.date ?? new Date().toISOString().split('T')[0] },
      startedAt: new Date().toISOString(),
      pausedAt: null,
      totalPausedSeconds: 0,
      elapsedSeconds: 0,
      exercises: buildActiveExercises(fakeRoutine),
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      paused: false,
      status: 'in_progress',
    }
    persist()
    startElapsedTimer()
  }

  function completeSet(actualReps?: number | null, actualWeight?: number | null, note?: string) {
    if (!activeWorkout.value) return
    const aw = activeWorkout.value
    const exercise = aw.exercises[aw.currentExerciseIndex]
    if (!exercise) return
    const set = exercise.sets[aw.currentSetIndex]
    if (!set) return

    set.actualReps = actualReps ?? set.reps
    set.actualWeight = actualWeight ?? set.weight
    set.completed = true
    set.note = note ?? set.note

    // Advance
    if (aw.currentSetIndex < exercise.sets.length - 1) {
      aw.currentSetIndex++
      exercise.currentSetIndex = aw.currentSetIndex
    } else {
      // Move to next exercise
      let nextIdx = aw.currentExerciseIndex + 1
      while (nextIdx < aw.exercises.length && aw.exercises[nextIdx].skipped) nextIdx++
      if (nextIdx < aw.exercises.length) {
        aw.currentExerciseIndex = nextIdx
        aw.currentSetIndex = 0
      }
    }
    persist()
  }

  function skipRest() {
    if (restHandle) clearInterval(restHandle)
    isResting.value = false
    restSecondsLeft.value = null
  }

  function skipExercise() {
    if (!activeWorkout.value) return
    const aw = activeWorkout.value
    aw.exercises[aw.currentExerciseIndex].skipped = true
    let nextIdx = aw.currentExerciseIndex + 1
    while (nextIdx < aw.exercises.length && aw.exercises[nextIdx].skipped) nextIdx++
    if (nextIdx < aw.exercises.length) {
      aw.currentExerciseIndex = nextIdx
      aw.currentSetIndex = 0
    }
    persist()
  }

  function addAdHocExercise(ex: { name: string; isBodyweight: boolean }) {
    if (!activeWorkout.value) return
    const { name, isBodyweight } = ex
    const newEx: ActiveExercise = {
      name,
      isBodyweight,
      skipped: false,
      currentSetIndex: 0,
      sets: [
        {
          setNumber: 1,
          reps: null,
          weight: null,
          targetReps: null,
          targetWeight: null,
          actualReps: null,
          actualWeight: null,
          completed: false,
          isBodyweight,
          note: null,
        },
      ],
    }
    const insertAt = activeWorkout.value.currentExerciseIndex + 1
    activeWorkout.value.exercises.splice(insertAt, 0, newEx)
    persist()
  }

  function pauseWorkout() {
    if (!activeWorkout.value) return
    activeWorkout.value.pausedAt = new Date().toISOString()
    activeWorkout.value.paused = true
    activeWorkout.value.status = 'paused'
    persist()
  }

  function resumeWorkout() {
    if (!activeWorkout.value || !activeWorkout.value.pausedAt) return
    const pausedMs = Date.now() - new Date(activeWorkout.value.pausedAt).getTime()
    activeWorkout.value.totalPausedSeconds += Math.floor(pausedMs / 1000)
    activeWorkout.value.pausedAt = null
    activeWorkout.value.paused = false
    activeWorkout.value.status = 'in_progress'
    persist()
  }

  async function finishWorkout(): Promise<WorkoutHistoryOut> {
    if (!activeWorkout.value) throw new Error('No active workout')
    const aw = activeWorkout.value
    const completedAt = new Date().toISOString()

    const excercises: CompletedRoutineExcercise[] = aw.exercises.map((ex) => ({
      name: ex.name,
      isBodyweight: ex.isBodyweight,
      sets: ex.sets.map((s): CompletedRoutineSet => ({
        type: 'normal',
        reps: s.actualReps,
        weight: s.actualWeight,
        note: s.note,
        completed: s.completed,
      })),
    }))

    const totalSets = aw.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
    const completedSets = aw.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    )

    const payload: CompleteRoutineCreate = {
      mode: aw.mode,
      startedAt: aw.startedAt,
      completedAt,
      durationSeconds: elapsedSeconds.value,
      totalSets,
      completedSets,
      excercises,
      exercises: excercises,
      sourceWorkout: aw.sourceWorkout,
    }

    const result = await routinesApi.completeRoutine(payload)

    history.value.unshift(result)
    if (history.value.length > HISTORY_CAP) history.value.length = HISTORY_CAP
    localStorage.setItem(LS_HISTORY, JSON.stringify(history.value))
    localStorage.removeItem(LS_ACTIVE)

    activeWorkout.value = null
    if (timerHandle) clearInterval(timerHandle)
    elapsedSeconds.value = 0

    return result
  }

  function restoreFromLocalStorage() {
    try {
      const raw = localStorage.getItem(LS_ACTIVE)
      if (raw) {
        activeWorkout.value = JSON.parse(raw) as ActiveWorkoutState
        if (activeWorkout.value.status === 'in_progress') {
          startElapsedTimer()
        }
      }
    } catch {
      localStorage.removeItem(LS_ACTIVE)
    }

    try {
      const rawH = localStorage.getItem(LS_HISTORY)
      if (rawH) {
        history.value = JSON.parse(rawH) as WorkoutHistoryOut[]
      }
    } catch {
      localStorage.removeItem(LS_HISTORY)
    }
  }

  return {
    activeWorkout,
    elapsedSeconds,
    restSecondsLeft,
    isResting,
    history,
    startFromRoutine,
    startFromPlanWorkout,
    completeSet,
    skipRest,
    skipExercise,
    addAdHocExercise,
    pauseWorkout,
    resumeWorkout,
    finishWorkout,
    restoreFromLocalStorage,
  }
})
