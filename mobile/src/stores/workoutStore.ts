import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as workoutApi from '../api/workoutApi'
import type {
  RoutineOut, ActiveExercise, ActiveSet, ActiveWorkoutState,
  WorkoutStep, ActivityType, ActivityTrackType,
  CompletedRoutineExcercise, CompletedRoutineSet, CompleteRoutineCreate,
  WorkoutHistoryOut,
} from '../types'

const LS_ACTIVE = 'activeWorkout'

function roundHalf(n: number): number {
  return Math.round(n * 2) / 2
}

function computeDropWeights(startWeight: number, count: number, decreasePercent: number): number[] {
  const weights: number[] = [startWeight]
  for (let i = 1; i < count; i++) {
    weights.push(roundHalf(weights[i - 1] * (1 - decreasePercent / 100)))
  }
  return weights
}

function buildActiveExercises(routine: RoutineOut): ActiveExercise[] {
  return (routine.excercises ?? []).map((ex) => {
    const supersetGroupId = ex.supersetGroupId ?? null
    const isDropSet = !!ex.dropConfig
    let sets: ActiveSet[]
    if (isDropSet && ex.dropConfig && ex.sets?.length) {
      const startSet = ex.sets[0]
      const weights = computeDropWeights(startSet.weight ?? 0, ex.dropConfig.count, ex.dropConfig.weightDecreasePercent)
      sets = weights.map((w, i) => ({
        setNumber: i + 1, reps: null, weight: w, duration: null, distance: null,
        targetReps: null, targetWeight: w, targetDuration: null, targetDistance: null,
        actualReps: null, actualWeight: null, actualDuration: null, actualDistance: null,
        completed: false, note: null,
      }))
    } else {
      sets = (ex.sets ?? []).map((s, i) => ({
        setNumber: i + 1, reps: s.reps, weight: s.weight,
        duration: s.duration ?? null, distance: s.distance ?? null,
        targetReps: s.reps, targetWeight: s.weight,
        targetDuration: s.duration ?? null, targetDistance: s.distance ?? null,
        actualReps: null, actualWeight: null, actualDuration: null, actualDistance: null,
        completed: false, note: s.note,
      }))
    }
    return {
      name: ex.name ?? '',
      activityType: ex.activityType ?? 'weighted',
      activityTrackType: ex.activityTrackType ?? 'repetitions',
      skipped: false, sets, supersetGroupId, isDropSet,
    }
  })
}

function computeSteps(exercises: ActiveExercise[]): WorkoutStep[] {
  const steps: WorkoutStep[] = []
  const processedGroups = new Set<string>()
  for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
    const ex = exercises[exIdx]
    const groupId = ex.supersetGroupId
    if (groupId && !processedGroups.has(groupId)) {
      processedGroups.add(groupId)
      const groupExercises = exercises.map((e, i) => ({ e, i })).filter(({ e }) => e.supersetGroupId === groupId)
      const setCount = groupExercises[0]?.e.sets.length ?? 0
      for (let round = 0; round < setCount; round++) {
        steps.push({
          type: 'superset-round', groupId, roundIndex: round,
          items: groupExercises.map(({ i }) => ({ exerciseIndex: i, setIndex: round, completed: false })),
        })
      }
    } else if (!groupId && ex.isDropSet) {
      for (let setIdx = 0; setIdx < ex.sets.length; setIdx++) {
        steps.push({ type: 'drop-set', exerciseIndex: exIdx, setIndex: setIdx, isLastDrop: setIdx === ex.sets.length - 1 })
      }
    } else if (!groupId) {
      for (let setIdx = 0; setIdx < ex.sets.length; setIdx++) {
        steps.push({ type: 'normal-set', exerciseIndex: exIdx, setIndex: setIdx })
      }
    }
  }
  return steps
}

interface WorkoutStore {
  activeWorkout: ActiveWorkoutState | null
  elapsedSeconds: number
  restSecondsLeft: number | null
  restTotalSeconds: number
  isResting: boolean
  completedWorkout: WorkoutHistoryOut | null
  startFromRoutine: (routine: RoutineOut) => void
  completeSet: (actualReps?: number | null, actualWeight?: number | null, note?: string, actualDuration?: number | null) => void
  completeSupersetItem: (actualReps: number | null, actualWeight: number | null, actualDuration?: number | null) => void
  skipRest: () => void
  startRest: (seconds?: number) => void
  skipExercise: () => void
  pauseWorkout: () => void
  resumeWorkout: () => void
  finishWorkout: () => Promise<WorkoutHistoryOut>
  clearCompleted: () => void
  restoreFromStorage: () => Promise<void>
}

let timerHandle: ReturnType<typeof setInterval> | null = null
let restHandle: ReturnType<typeof setInterval> | null = null

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  activeWorkout: null,
  elapsedSeconds: 0,
  restSecondsLeft: null,
  restTotalSeconds: 90,
  isResting: false,
  completedWorkout: null,

  startFromRoutine(routine: RoutineOut) {
    const exercises = buildActiveExercises(routine)
    const steps = computeSteps(exercises)
    const aw: ActiveWorkoutState = {
      routineName: routine.name ?? '',
      mode: 'routine',
      sourceWorkout: { id: routine.id, name: routine.name, date: new Date().toISOString().split('T')[0] },
      startedAt: new Date().toISOString(),
      pausedAt: null,
      totalPausedSeconds: 0,
      elapsedSeconds: 0,
      exercises,
      steps,
      currentStepIndex: 0,
      paused: false,
      status: 'in_progress',
    }
    set({ activeWorkout: aw, elapsedSeconds: 0 })
    AsyncStorage.setItem(LS_ACTIVE, JSON.stringify(aw))
    if (timerHandle) clearInterval(timerHandle)
    timerHandle = setInterval(() => {
      const { activeWorkout } = get()
      if (!activeWorkout || activeWorkout.status !== 'in_progress') return
      const started = new Date(activeWorkout.startedAt).getTime()
      const paused = activeWorkout.totalPausedSeconds * 1000
      set({ elapsedSeconds: Math.floor((Date.now() - started - paused) / 1000) })
    }, 1000)
  },

  completeSet(actualReps, actualWeight, note, actualDuration) {
    const { activeWorkout } = get()
    if (!activeWorkout) return
    const aw = { ...activeWorkout, exercises: activeWorkout.exercises.map(e => ({ ...e, sets: [...e.sets] })), steps: [...activeWorkout.steps] }
    const step = aw.steps[aw.currentStepIndex]
    if (!step) return
    if (step.type === 'normal-set') {
      const s = aw.exercises[step.exerciseIndex]?.sets[step.setIndex]
      if (!s) return
      s.actualReps = actualReps ?? s.reps
      s.actualWeight = actualWeight ?? s.weight
      s.actualDuration = actualDuration !== undefined ? actualDuration : s.duration
      s.completed = true
      if (note !== undefined) s.note = note
      aw.currentStepIndex++
      set({ activeWorkout: aw })
      AsyncStorage.setItem(LS_ACTIVE, JSON.stringify(aw))
      get().startRest(90)
    } else if (step.type === 'drop-set') {
      const s = aw.exercises[step.exerciseIndex]?.sets[step.setIndex]
      if (!s) return
      s.actualReps = actualReps ?? null
      s.actualWeight = actualWeight ?? s.weight
      s.completed = true
      if (note !== undefined) s.note = note
      aw.currentStepIndex++
      set({ activeWorkout: aw })
      AsyncStorage.setItem(LS_ACTIVE, JSON.stringify(aw))
      if (step.isLastDrop) get().startRest(90)
    }
  },

  completeSupersetItem(actualReps, actualWeight, actualDuration) {
    const { activeWorkout } = get()
    if (!activeWorkout) return
    const aw = { ...activeWorkout, exercises: activeWorkout.exercises.map(e => ({ ...e, sets: [...e.sets] })) }
    const step = aw.steps[aw.currentStepIndex]
    if (!step || step.type !== 'superset-round') return
    const stepCopy = { ...step, items: step.items.map(i => ({ ...i })) }
    const item = stepCopy.items.find(i => !i.completed)
    if (!item) return
    const s = aw.exercises[item.exerciseIndex]?.sets[item.setIndex]
    if (s) {
      s.actualReps = actualReps ?? s.reps
      s.actualWeight = actualWeight ?? s.weight
      s.actualDuration = actualDuration !== undefined ? actualDuration : s.duration
      s.completed = true
    }
    item.completed = true
    const newSteps = [...aw.steps]
    newSteps[aw.currentStepIndex] = stepCopy
    if (stepCopy.items.every(i => i.completed)) {
      aw.currentStepIndex++
      get().startRest(90)
    }
    const newAw = { ...aw, steps: newSteps }
    set({ activeWorkout: newAw })
    AsyncStorage.setItem(LS_ACTIVE, JSON.stringify(newAw))
  },

  skipRest() {
    if (restHandle) clearInterval(restHandle)
    set({ isResting: false, restSecondsLeft: null })
  },

  startRest(seconds = 90) {
    if (restHandle) clearInterval(restHandle)
    set({ restTotalSeconds: seconds, restSecondsLeft: seconds, isResting: true })
    restHandle = setInterval(() => {
      const { restSecondsLeft } = get()
      if (!restSecondsLeft || restSecondsLeft <= 1) {
        get().skipRest()
      } else {
        set({ restSecondsLeft: restSecondsLeft - 1 })
      }
    }, 1000)
  },

  skipExercise() {
    const { activeWorkout } = get()
    if (!activeWorkout) return
    const aw = { ...activeWorkout, exercises: [...activeWorkout.exercises], steps: [...activeWorkout.steps] }
    const step = aw.steps[aw.currentStepIndex]
    if (!step) return
    const toSkip = new Set<number>()
    if (step.type === 'normal-set' || step.type === 'drop-set') toSkip.add(step.exerciseIndex)
    else if (step.type === 'superset-round') step.items.forEach(i => toSkip.add(i.exerciseIndex))
    toSkip.forEach(idx => { aw.exercises[idx] = { ...aw.exercises[idx], skipped: true } })
    while (aw.currentStepIndex < aw.steps.length) {
      const s = aw.steps[aw.currentStepIndex]
      const involves = (
        (s.type === 'normal-set' && toSkip.has(s.exerciseIndex)) ||
        (s.type === 'drop-set' && toSkip.has(s.exerciseIndex)) ||
        (s.type === 'superset-round' && s.items.some(i => toSkip.has(i.exerciseIndex)))
      )
      if (!involves) break
      aw.currentStepIndex++
    }
    set({ activeWorkout: aw })
    AsyncStorage.setItem(LS_ACTIVE, JSON.stringify(aw))
  },

  pauseWorkout() {
    const { activeWorkout } = get()
    if (!activeWorkout) return
    const aw = { ...activeWorkout, pausedAt: new Date().toISOString(), paused: true, status: 'paused' as const }
    set({ activeWorkout: aw })
  },

  resumeWorkout() {
    const { activeWorkout } = get()
    if (!activeWorkout || !activeWorkout.pausedAt) return
    const pausedMs = Date.now() - new Date(activeWorkout.pausedAt).getTime()
    const aw = {
      ...activeWorkout,
      totalPausedSeconds: activeWorkout.totalPausedSeconds + Math.floor(pausedMs / 1000),
      pausedAt: null,
      paused: false,
      status: 'in_progress' as const,
    }
    set({ activeWorkout: aw })
  },

  async finishWorkout() {
    const { activeWorkout, elapsedSeconds } = get()
    if (!activeWorkout) throw new Error('No active workout')
    const aw = activeWorkout
    const completedAt = new Date().toISOString()
    const excercises: CompletedRoutineExcercise[] = aw.exercises.map(ex => ({
      name: ex.name,
      activityType: ex.activityType,
      activityTrackType: ex.activityTrackType,
      sets: ex.sets.map((s): CompletedRoutineSet => ({
        type: ex.isDropSet ? 'drop' : 'normal',
        reps: s.actualReps,
        weight: s.actualWeight,
        duration: s.actualDuration ?? null,
        distance: s.actualDistance ?? null,
        note: s.note,
        completed: s.completed,
      })),
    }))
    const totalSets = aw.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
    const completedSets = aw.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0)
    const payload: CompleteRoutineCreate = {
      mode: aw.mode,
      startedAt: aw.startedAt,
      completedAt,
      durationSeconds: elapsedSeconds,
      totalSets,
      completedSets,
      excercises,
      exercises: excercises,
      sourceWorkout: aw.sourceWorkout,
    }
    let result: WorkoutHistoryOut = {
      id: null,
      name: aw.routineName,
      completedAt,
      durationSeconds: elapsedSeconds,
      totalSets,
      completedSets,
    }
    try { result = await workoutApi.completeRoutine(payload) } catch {}
    if (timerHandle) clearInterval(timerHandle)
    await AsyncStorage.removeItem(LS_ACTIVE)
    set({ activeWorkout: null, elapsedSeconds: 0, completedWorkout: result })
    return result
  },

  clearCompleted() {
    set({ completedWorkout: null })
  },

  async restoreFromStorage() {
    try {
      const raw = await AsyncStorage.getItem(LS_ACTIVE)
      if (raw) {
        const parsed = JSON.parse(raw) as ActiveWorkoutState
        if (parsed.steps && parsed.currentStepIndex !== undefined) {
          set({ activeWorkout: parsed })
        }
      }
    } catch {}
  },
}))
