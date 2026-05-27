import apiClient from './apiClient'
import type { DefaultWorkoutOut } from '../types'

export const listDefaultWorkouts = (): Promise<DefaultWorkoutOut[]> =>
  apiClient.get<DefaultWorkoutOut[]>('/api/default-workouts').then((r) => r.data)
