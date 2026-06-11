import apiClient from './apiClient'
import type {
  EquipmentOut, EquipmentCreate, EquipmentUpdate,
  UserEquipmentOut, UserEquipmentBatchUpdate,
} from '../types'

export const listEquipment = (): Promise<EquipmentOut[]> =>
  apiClient.get<EquipmentOut[]>('/api/equipment').then((r) => r.data)

export const createEquipment = (d: EquipmentCreate): Promise<EquipmentOut> =>
  apiClient.post<EquipmentOut>('/api/equipment', d).then((r) => r.data)

export const updateEquipment = (id: string, d: EquipmentUpdate): Promise<EquipmentOut> =>
  apiClient.put<EquipmentOut>(`/api/equipment/${id}`, d).then((r) => r.data)

export const deleteEquipment = (id: string): Promise<void> =>
  apiClient.delete(`/api/equipment/${id}`).then(() => undefined)

export const getUserEquipment = (): Promise<UserEquipmentOut[]> =>
  apiClient.get<UserEquipmentOut[]>('/api/user-equipment').then((r) => r.data)

export const saveUserEquipment = (d: UserEquipmentBatchUpdate): Promise<UserEquipmentOut[]> =>
  apiClient.put<UserEquipmentOut[]>('/api/user-equipment', d).then((r) => r.data)
