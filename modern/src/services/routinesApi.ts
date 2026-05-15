import apiClient from './apiClient'
import type { RoutineOut, RoutineCreate, RoutineUpdate, CompleteRoutineCreate, WorkoutHistoryOut } from '../types'

export const listRoutines = (): Promise<RoutineOut[]> =>
  apiClient.get<RoutineOut[]>('/api/routines').then((r) => r.data)

export const createRoutine = (d: RoutineCreate): Promise<RoutineOut> =>
  apiClient.post<RoutineOut>('/api/routines', d).then((r) => r.data)

export const updateRoutine = (id: string, d: RoutineUpdate): Promise<RoutineOut> =>
  apiClient.put<RoutineOut>(`/api/routines/${id}`, d).then((r) => r.data)

export const deleteRoutine = (id: string): Promise<void> =>
  apiClient.delete(`/api/routines/${id}`).then(() => undefined)

export const completeRoutine = (d: CompleteRoutineCreate): Promise<WorkoutHistoryOut> =>
  apiClient.post<WorkoutHistoryOut>('/api/routines/complete', d).then((r) => r.data)
