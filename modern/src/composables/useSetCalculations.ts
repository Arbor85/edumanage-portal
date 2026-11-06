import { computed } from 'vue'
import type { Ref } from 'vue'
import type { RoutineSet, ActivityTrackType, UserExerciseMax, CompletedRoutineSet } from '../types'
import { useWeightUnit } from './useWeightUnit'

function roundHalf(n: number): number {
  return Math.round(n * 2) / 2
}

function epley1rm(weight: number, reps: number): number {
  return weight * (1 + reps / 30)
}

export function formatSetDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

export function formatSetDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`
}

export interface UseSetCalculationsOptions {
  set: Ref<RoutineSet>
  activityTrackType: ActivityTrackType
  mode: 'planning' | 'active'
  exerciseMax?: UserExerciseMax
  previousSessionSet?: CompletedRoutineSet
  previousSetInSession?: { reps: number | null; weight: number | null }
}

export function useSetCalculations(options: UseSetCalculationsOptions) {
  const { set, activityTrackType, mode, exerciseMax, previousSessionSet, previousSetInSession } = options
  const { toDisplay, unit } = useWeightUnit()

  function formatWeightReps(reps: number | null, weight: number | null): string {
    if (weight != null && reps != null) {
      const w = toDisplay(weight)
      const wStr = w % 1 === 0 ? String(w) : w.toFixed(2)
      return `${reps}×${wStr}${unit.value}`
    }
    if (reps != null) return `${reps} reps`
    return ''
  }

  const lastSession = computed<string | null>(() => {
    if (mode !== 'planning' || !previousSessionSet) return null
    if (activityTrackType === 'repetitions') {
      const label = formatWeightReps(previousSessionSet.reps, previousSessionSet.weight)
      return label ? `Last time: ${label}` : null
    }
    if (activityTrackType === 'time' && previousSessionSet.duration != null) {
      return `Last time: ${formatSetDuration(previousSessionSet.duration)}`
    }
    if (activityTrackType === 'distance' && previousSessionSet.distance != null) {
      return `Last time: ${formatSetDistance(previousSessionSet.distance)}`
    }
    return null
  })

  const percentOfMax = computed<string | null>(() => {
    if (mode !== 'planning' || activityTrackType !== 'repetitions') return null
    const w = set.value.weight
    const maxW = exerciseMax?.maxWeight
    if (w == null || maxW == null || maxW === 0) return null
    return `= ${Math.round((w / maxW) * 100)}% of your max`
  })

  const estimated1RM = computed<string | null>(() => {
    if (mode !== 'planning' || activityTrackType !== 'repetitions') return null
    const w = set.value.weight
    const r = set.value.reps
    if (w == null || r == null || w === 0 || r === 0) return null
    const est = Math.round(epley1rm(w, r))
    const d = toDisplay(est)
    return `~${d % 1 === 0 ? d : d.toFixed(1)}${unit.value} estimated 1RM`
  })

  const suggestion = computed<{ weight: number | null; reps: number } | null>(() => {
    if (mode !== 'planning' || !previousSessionSet || activityTrackType !== 'repetitions') return null
    const prevReps = previousSessionSet.reps
    if (prevReps == null) return null
    if (previousSessionSet.weight != null) {
      return { weight: roundHalf(previousSessionSet.weight + 2.5), reps: prevReps }
    }
    return { weight: null, reps: prevReps + 1 }
  })

  const previousSet = computed<string | null>(() => {
    if (mode !== 'active' || !previousSetInSession) return null
    if (activityTrackType === 'repetitions') {
      const label = formatWeightReps(previousSetInSession.reps, previousSetInSession.weight)
      return label ? `Previous set: ${label}` : null
    }
    return null
  })

  const hasContext = computed(() =>
    lastSession.value !== null ||
    percentOfMax.value !== null ||
    estimated1RM.value !== null ||
    suggestion.value !== null ||
    previousSet.value !== null
  )

  return { lastSession, percentOfMax, estimated1RM, suggestion, previousSet, hasContext }
}
