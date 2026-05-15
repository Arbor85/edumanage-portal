import apiClient from './apiClient'
import type { ClientOut, ClientCreate, ClientUpdate } from '../types'

export const listClients = (): Promise<ClientOut[]> =>
  apiClient.get<ClientOut[]>('/api/clients').then((r) => r.data)

export const createClient = (d: ClientCreate): Promise<ClientOut> =>
  apiClient.post<ClientOut>('/api/clients', d).then((r) => r.data)

export const updateClient = (invitationCode: string, d: ClientUpdate): Promise<ClientOut> =>
  apiClient.put<ClientOut>(`/api/clients/${invitationCode}`, d).then((r) => r.data)

export const deleteClient = (invitationCode: string): Promise<void> =>
  apiClient.delete(`/api/clients/${invitationCode}`).then(() => undefined)
