import { apiClient } from './apiClient'
import type { ClientOut, ProgressData } from '../types'

export async function getClients(): Promise<ClientOut[]> {
  const { data } = await apiClient.get<ClientOut[]>('/api/clients')
  return data
}

export async function getClientProgress(clientId: string): Promise<ProgressData> {
  const { data } = await apiClient.get<ProgressData>(`/api/clients/${clientId}/progress`)
  return data
}
