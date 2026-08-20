import { apiClient } from './apiClient'
import type { ProgressData, WorkoutHistoryOut } from '../types'

export async function getProgress(): Promise<ProgressData> {
  const { data } = await apiClient.get<ProgressData>('/api/progress')
  return data
}

export async function getWorkoutHistory(): Promise<WorkoutHistoryOut[]> {
  const { data } = await apiClient.get<WorkoutHistoryOut[]>('/api/workout-history')
  return data
}
