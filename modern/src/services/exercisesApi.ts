import apiClient from './apiClient'
import type { ExcerciseOut, ExcerciseWriteRequest } from '../types'

export const listExercises = (): Promise<ExcerciseOut[]> =>
  apiClient.get<ExcerciseOut[]>('/api/excercises').then((r) => r.data)

export const createExercise = (d: ExcerciseWriteRequest): Promise<ExcerciseOut> =>
  apiClient.post<ExcerciseOut>('/api/excercises', d).then((r) => r.data)

export const updateExercise = (id: number, d: ExcerciseWriteRequest): Promise<ExcerciseOut> =>
  apiClient.put<ExcerciseOut>(`/api/excercises/${id}`, d).then((r) => r.data)

export const deleteExercise = (id: number): Promise<void> =>
  apiClient.delete(`/api/excercises/${id}`).then(() => undefined)
