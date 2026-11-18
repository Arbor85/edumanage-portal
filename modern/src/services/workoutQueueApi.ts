import apiClient from './apiClient'
import type { QueuedWorkoutOut, QueuedWorkoutCreate } from '../types'

export const listQueuedWorkouts = (): Promise<QueuedWorkoutOut[]> =>
  apiClient.get<QueuedWorkoutOut[]>('/api/workouts/queue').then((r) => r.data)

export const queueWorkout = (d: QueuedWorkoutCreate): Promise<QueuedWorkoutOut> =>
  apiClient.post<QueuedWorkoutOut>('/api/workouts/queue', d).then((r) => r.data)

export const deleteQueuedWorkout = (id: string): Promise<void> =>
  apiClient.delete(`/api/workouts/queue/${id}`).then(() => undefined)
