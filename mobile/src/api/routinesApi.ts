import { apiClient } from './apiClient'
import type { RoutineOut } from '../types'

export async function getRoutines(): Promise<RoutineOut[]> {
  const { data } = await apiClient.get<RoutineOut[]>('/api/routines')
  return data
}

export async function getRoutine(id: string): Promise<RoutineOut> {
  const { data } = await apiClient.get<RoutineOut>(`/api/routines/${id}`)
  return data
}
