import { listQueuedWorkouts, deleteQueuedWorkout } from '../services/workoutQueueApi'
import { useRoutineStore } from '../stores/routineStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { useToast } from './useToast'

export function useQueuedWorkoutStart() {
  const routineStore = useRoutineStore()
  const workoutStore = useWorkoutStore()
  const toast = useToast()

  async function consumeOnce() {
    const queue = await listQueuedWorkouts()
    if (queue.length === 0) return

    if (workoutStore.activeWorkout) {
      if (routineStore.routines.length === 0) await routineStore.fetch()
      const name = routineStore.routines.find((r) => r.id === queue[0].routineId)?.name
      toast.info(`Queued workout${name ? ` "${name}"` : ''} will start after your current one finishes.`)
      return
    }

    if (routineStore.routines.length === 0) await routineStore.fetch()
    const next = queue[0]
    const routine = routineStore.routines.find((r) => r.id === next.routineId)
    if (!routine) {
      await deleteQueuedWorkout(next.id)
      toast.error('Queued routine was removed before it could start.')
      return
    }

    workoutStore.startFromRoutine(routine)
    await deleteQueuedWorkout(next.id)
  }

  return { consumeOnce }
}
