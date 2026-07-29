import { computed } from 'vue'
import { useRoutineStore } from '../stores/routineStore'
import { useWorkoutStore } from '../stores/workoutStore'
import type { RoutineOut } from '../types'

export function useWorkoutSuggestion() {
  const routineStore = useRoutineStore()
  const workoutStore = useWorkoutStore()

  const recentNames = computed((): Set<string> => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
    return new Set(
      workoutStore.history
        .filter((h) => h.completedAt && new Date(h.completedAt).getTime() > threeDaysAgo)
        .map((h) => h.sourceWorkout?.name ?? h.name ?? '')
        .filter(Boolean)
    )
  })

  const suggestedRoutine = computed((): RoutineOut | null => {
    const routines = routineStore.routines
    if (!routines.length) return null
    // Prefer a routine not done in the last 3 days
    const fresh = routines.find((r) => !recentNames.value.has(r.name ?? ''))
    return fresh ?? routines[0]
  })

  return { suggestedRoutine }
}
