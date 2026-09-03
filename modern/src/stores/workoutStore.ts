import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  ActiveWorkoutState,
  ActiveExercise,
  ActiveSet,
  RoutineOut,
  PlanWorkoutOutput,
  WorkoutHistoryOut,
  CompleteRoutineCreate,
  CompletedRoutineExcercise,
  CompletedRoutineSet,
  WorkoutStep,
  ActivityType,
  ActivityTrackType,
} from '../types'
import * as routinesApi from '../services/routinesApi'

const LS_ACTIVE = 'activeWorkout'
const LS_HISTORY = 'workoutHistory'
const HISTORY_CAP = 100

// Round weight to nearest 0.5 kg
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
        setNumber: i + 1,
        reps: null,
        weight: w,
        duration: null,
        distance: null,
        targetReps: null,
        targetWeight: w,
        targetDuration: null,
        targetDistance: null,
        actualReps: null,
        actualWeight: null,
        actualDuration: null,
        actualDistance: null,
        completed: false,
        note: null,
      }))
    } else {
      sets = (ex.sets ?? []).map((s, i) => ({
        setNumber: i + 1,
        reps: s.reps,
        weight: s.weight,
        duration: s.duration ?? null,
        distance: s.distance ?? null,
        targetReps: s.reps,
        targetWeight: s.weight,
        targetDuration: s.duration ?? null,
        targetDistance: s.distance ?? null,
        actualReps: null,
        actualWeight: null,
        actualDuration: null,
        actualDistance: null,
        completed: false,
        note: s.note,
      }))
    }

    return {
      name: ex.name ?? '',
      activityType: ex.activityType ?? 'weighted',
      activityTrackType: ex.activityTrackType ?? 'repetitions',
      skipped: false,
      sets,
      supersetGroupId,
      isDropSet,
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
      const groupExercises = exercises
        .map((e, i) => ({ e, i }))
        .filter(({ e }) => e.supersetGroupId === groupId)

      const setCount = groupExercises[0]?.e.sets.length ?? 0
      for (let round = 0; round < setCount; round++) {
        steps.push({
          type: 'superset-round',
          groupId,
          roundIndex: round,
          items: groupExercises.map(({ i }) => ({
            exerciseIndex: i,
            setIndex: round,
            completed: false,
          })),
        })
      }
    } else if (!groupId && ex.isDropSet) {
      for (let setIdx = 0; setIdx < ex.sets.length; setIdx++) {
        steps.push({
          type: 'drop-set',
          exerciseIndex: exIdx,
          setIndex: setIdx,
          isLastDrop: setIdx === ex.sets.length - 1,
        })
      }
    } else if (!groupId) {
      for (let setIdx = 0; setIdx < ex.sets.length; setIdx++) {
        steps.push({
          type: 'normal-set',
          exerciseIndex: exIdx,
          setIndex: setIdx,
        })
      }
    }
  }

  return steps
}

export const useWorkoutStore = defineStore('workout', () => {
  const activeWorkout = ref<ActiveWorkoutState | null>(null)
  const elapsedSeconds = ref(0)
  const restSecondsLeft = ref<number | null>(null)
  const restTotalSeconds = ref<number>(90)
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

  function startFromRoutine(routine: RoutineOut) {
    const exercises = buildActiveExercises(routine)
    const steps = computeSteps(exercises)
    activeWorkout.value = {
      routineName: routine.name,
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
      supersetGroups: [],
    }
    const exercises = buildActiveExercises(fakeRoutine)
    const steps = computeSteps(exercises)
    activeWorkout.value = {
      routineName: workout.name,
      mode: 'plan',
      sourceWorkout: { id: workout.id, name: workout.name, date: workout.date ?? new Date().toISOString().split('T')[0] },
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
    persist()
    startElapsedTimer()
  }

  function startEmpty() {
    activeWorkout.value = {
      routineName: 'Empty Workout',
      mode: 'free',
      sourceWorkout: { id: null, name: 'Empty Workout', date: new Date().toISOString().split('T')[0] },
      startedAt: new Date().toISOString(),
      pausedAt: null,
      totalPausedSeconds: 0,
      elapsedSeconds: 0,
      exercises: [],
      steps: [],
      currentStepIndex: 0,
      paused: false,
      status: 'in_progress',
    }
    persist()
    startElapsedTimer()
  }

  // Complete a normal-set or drop-set step, or a specific item within a superset-round step
  function completeSet(actualReps?: number | null, actualWeight?: number | null, note?: string, actualDuration?: number | null) {
    if (!activeWorkout.value) return
    const aw = activeWorkout.value
    const step = aw.steps[aw.currentStepIndex]
    if (!step) return

    if (step.type === 'normal-set') {
      const set = aw.exercises[step.exerciseIndex]?.sets[step.setIndex]
      if (!set) return
      set.actualReps = actualReps ?? set.reps
      set.actualWeight = actualWeight ?? set.weight
      set.actualDuration = actualDuration !== undefined ? actualDuration : set.duration
      set.completed = true
      if (note !== undefined) set.note = note
      aw.currentStepIndex++
      persist()
      startRest(90)

    } else if (step.type === 'drop-set') {
      const set = aw.exercises[step.exerciseIndex]?.sets[step.setIndex]
      if (!set) return
      set.actualReps = actualReps ?? null
      set.actualWeight = actualWeight ?? set.weight
      set.completed = true
      if (note !== undefined) set.note = note
      aw.currentStepIndex++
      persist()
      if (step.isLastDrop) startRest(90)
    }
  }

  // Complete the currently active item within a superset-round step
  function completeSupersetItem(actualReps: number | null, actualWeight: number | null, actualDuration?: number | null) {
    if (!activeWorkout.value) return
    const aw = activeWorkout.value
    const step = aw.steps[aw.currentStepIndex]
    if (!step || step.type !== 'superset-round') return

    const item = step.items.find(i => !i.completed)
    if (!item) return

    const set = aw.exercises[item.exerciseIndex]?.sets[item.setIndex]
    if (set) {
      set.actualReps = actualReps ?? set.reps
      set.actualWeight = actualWeight ?? set.weight
      set.actualDuration = actualDuration !== undefined ? actualDuration : set.duration
      set.completed = true
    }
    item.completed = true

    if (step.items.every(i => i.completed)) {
      aw.currentStepIndex++
      persist()
      startRest(90)
    } else {
      persist()
    }
  }

  function skipRest() {
    if (restHandle) clearInterval(restHandle)
    isResting.value = false
    restSecondsLeft.value = null
  }

  function startRest(seconds = 90) {
    if (restHandle) clearInterval(restHandle)
    restTotalSeconds.value = seconds
    restSecondsLeft.value = seconds
    isResting.value = true
    restHandle = setInterval(() => {
      if (!restSecondsLeft.value || restSecondsLeft.value <= 1) {
        skipRest()
      } else {
        restSecondsLeft.value--
      }
    }, 1000)
  }

  function skipExercise() {
    if (!activeWorkout.value) return
    const aw = activeWorkout.value
    const step = aw.steps[aw.currentStepIndex]
    if (!step) return

    // Collect exercise indices to skip
    const toSkip = new Set<number>()
    if (step.type === 'normal-set' || step.type === 'drop-set') {
      toSkip.add(step.exerciseIndex)
    } else if (step.type === 'superset-round') {
      step.items.forEach(i => toSkip.add(i.exerciseIndex))
    }

    toSkip.forEach(idx => { aw.exercises[idx].skipped = true })

    // Advance past all steps belonging to these exercises
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

    persist()
  }

  // Recompute steps and resync currentStepIndex/completion flags after regrouping exercises
  function resyncSteps(aw: ActiveWorkoutState) {
    const newSteps = computeSteps(aw.exercises)
    let newCurrentIdx = 0
    for (let i = 0; i < newSteps.length; i++) {
      const step = newSteps[i]
      if (step.type === 'normal-set' || step.type === 'drop-set') {
        if (aw.exercises[step.exerciseIndex]?.sets[step.setIndex]?.completed) {
          newCurrentIdx = i + 1
        } else {
          break
        }
      } else if (step.type === 'superset-round') {
        step.items.forEach(item => {
          item.completed = aw.exercises[item.exerciseIndex]?.sets[item.setIndex]?.completed ?? false
        })
        if (step.items.every(item => item.completed)) {
          newCurrentIdx = i + 1
        } else {
          break
        }
      }
    }

    aw.steps = newSteps
    aw.currentStepIndex = newCurrentIdx
    persist()
  }

  // Remove an exercise from its current superset group, dissolving the group if only 1 member remains
  function leaveSuperset(aw: ActiveWorkoutState, ex: ActiveExercise) {
    if (!ex.supersetGroupId) return
    const oldGroupId = ex.supersetGroupId
    ex.supersetGroupId = null
    const remaining = aw.exercises.filter(e => e.supersetGroupId === oldGroupId)
    if (remaining.length <= 1) {
      remaining.forEach(e => { e.supersetGroupId = null })
    }
  }

  // Create a brand-new superset pairing sourceExIdx with targetExIdx
  function addToSuperset(sourceExIdx: number, targetExIdx: number) {
    if (!activeWorkout.value) return
    const aw = activeWorkout.value
    const sourceEx = aw.exercises[sourceExIdx]
    const targetEx = aw.exercises[targetExIdx]
    if (!sourceEx || !targetEx || sourceExIdx === targetExIdx) return

    let groupId: string

    if (targetEx.supersetGroupId) {
      groupId = targetEx.supersetGroupId
    } else {
      groupId = Math.random().toString(36).slice(2) + Date.now().toString(36)
      targetEx.supersetGroupId = groupId
    }

    if (sourceEx.supersetGroupId && sourceEx.supersetGroupId !== groupId) {
      leaveSuperset(aw, sourceEx)
    }

    sourceEx.supersetGroupId = groupId
    resyncSteps(aw)
  }

  // Assign an exercise into an already-existing superset group
  function joinSuperset(sourceExIdx: number, groupId: string) {
    if (!activeWorkout.value) return
    const aw = activeWorkout.value
    const sourceEx = aw.exercises[sourceExIdx]
    if (!sourceEx) return
    const groupExists = aw.exercises.some(e => e.supersetGroupId === groupId)
    if (!groupExists) return

    if (sourceEx.supersetGroupId && sourceEx.supersetGroupId !== groupId) {
      leaveSuperset(aw, sourceEx)
    }

    sourceEx.supersetGroupId = groupId
    resyncSteps(aw)
  }

  function addAdHocExercise(
    ex: { name: string; activityType: ActivityType; activityTrackType: ActivityTrackType },
    sets?: { reps: number | null; weight: number | null; duration: number | null; distance: number | null }[]
  ) {
    if (!activeWorkout.value) return
    const { name, activityType, activityTrackType } = ex
    const rawSets = sets?.length ? sets : [{ reps: null, weight: null, duration: null, distance: null }]
    const newEx: ActiveExercise = {
      name,
      activityType,
      activityTrackType,
      skipped: false,
      supersetGroupId: null,
      isDropSet: false,
      sets: rawSets.map((s, i) => ({
        setNumber: i + 1,
        reps: s.reps,
        weight: s.weight,
        duration: s.duration ?? null,
        distance: s.distance ?? null,
        targetReps: s.reps,
        targetWeight: s.weight,
        targetDuration: s.duration ?? null,
        targetDistance: s.distance ?? null,
        actualReps: null,
        actualWeight: null,
        actualDuration: null,
        actualDistance: null,
        completed: false,
        note: null,
      })),
    }

    const exerciseIndex = activeWorkout.value.exercises.length
    activeWorkout.value.exercises.push(newEx)

    const newSteps: WorkoutStep[] = newEx.sets.map((_, setIdx) => ({
      type: 'normal-set' as const,
      exerciseIndex,
      setIndex: setIdx,
    }))

    const insertAt = activeWorkout.value.currentStepIndex + 1
    activeWorkout.value.steps.splice(insertAt, 0, ...newSteps)
    persist()
  }

  function updateExerciseSets(
    exerciseIndex: number,
    sets: { reps: number | null; weight: number | null; duration: number | null; distance: number | null }[]
  ) {
    if (!activeWorkout.value) return
    const ex = activeWorkout.value.exercises[exerciseIndex]
    if (!ex) return
    ex.sets = sets.map((s, i) => ({
      setNumber: i + 1,
      reps: s.reps,
      weight: s.weight,
      duration: s.duration ?? null,
      distance: s.distance ?? null,
      targetReps: s.reps,
      targetWeight: s.weight,
      targetDuration: s.duration ?? null,
      targetDistance: s.distance ?? null,
      actualReps: ex.sets[i]?.actualReps ?? null,
      actualWeight: ex.sets[i]?.actualWeight ?? null,
      actualDuration: ex.sets[i]?.actualDuration ?? null,
      actualDistance: ex.sets[i]?.actualDistance ?? null,
      completed: ex.sets[i]?.completed ?? false,
      note: ex.sets[i]?.note ?? null,
    }))
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

    const localResult: WorkoutHistoryOut = {
      id: null,
      name: aw.routineName,
      currentUserId: null,
      mode: aw.mode,
      startedAt: aw.startedAt,
      completedAt,
      durationSeconds: elapsedSeconds.value,
      totalSets,
      completedSets,
      excercises,
      sourceWorkout: aw.sourceWorkout,
    }

    let result = localResult
    try {
      result = await routinesApi.completeRoutine(payload)
    } catch {
      // API unavailable — use local result
    }

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
        const parsed = JSON.parse(raw) as ActiveWorkoutState
        // Validate new format (steps array required)
        if (!parsed.steps || parsed.currentStepIndex === undefined) {
          localStorage.removeItem(LS_ACTIVE)
        } else {
          activeWorkout.value = parsed
          if (activeWorkout.value.status === 'in_progress') {
            startElapsedTimer()
          }
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
    restTotalSeconds,
    isResting,
    history,
    startFromRoutine,
    startFromPlanWorkout,
    startEmpty,
    completeSet,
    completeSupersetItem,
    skipRest,
    startRest,
    skipExercise,
    addToSuperset,
    joinSuperset,
    addAdHocExercise,
    updateExerciseSets,
    pauseWorkout,
    resumeWorkout,
    finishWorkout,
    restoreFromLocalStorage,
  }
})
