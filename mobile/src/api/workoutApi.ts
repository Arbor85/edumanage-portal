import { apiClient } from './apiClient'
import type { CompleteRoutineCreate, WorkoutHistoryOut } from '../types'

export async function completeRoutine(payload: CompleteRoutineCreate): Promise<WorkoutHistoryOut> {
  const { data } = await apiClient.post<WorkoutHistoryOut>('/api/routines/complete', payload)
  return data
}
