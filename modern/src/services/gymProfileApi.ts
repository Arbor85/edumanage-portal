import apiClient from './apiClient'
import type { UserExerciseMax, UserExerciseMaxUpsert } from '../types'

export const listGymProfile = (): Promise<UserExerciseMax[]> =>
  apiClient.get<UserExerciseMax[]>('/api/gym-profile').then((r) => r.data)

export const upsertMax = (exerciseId: number, d: UserExerciseMaxUpsert): Promise<UserExerciseMax> =>
  apiClient.put<UserExerciseMax>(`/api/gym-profile/${exerciseId}`, d).then((r) => r.data)

export const deleteMax = (exerciseId: number): Promise<void> =>
  apiClient.delete(`/api/gym-profile/${exerciseId}`).then(() => undefined)

export const getClientGymProfile = (userId: string): Promise<UserExerciseMax[]> =>
  apiClient.get<UserExerciseMax[]>(`/api/gym-profile/client/${userId}`).then((r) => r.data)
