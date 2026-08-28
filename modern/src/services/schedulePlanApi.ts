import apiClient from './apiClient'
import type {
  BuildingCreate,
  BuildingUpdate,
  BuildingOut,
  BuildingAvailabilityCreate,
  BuildingAvailabilityOut,
  SchedulePlanCreate,
  SchedulePlanUpdate,
  SchedulePlanOut,
  ScheduleEntryCreate,
  ScheduleEntryOut,
  AutoScheduleRequest,
  AutoScheduleResult,
  ConfirmAutoScheduleRequest,
} from '../types'

export const listBuildings = (): Promise<BuildingOut[]> =>
  apiClient.get<BuildingOut[]>('/api/buildings').then((r) => r.data)

export const addBuilding = (d: BuildingCreate): Promise<BuildingOut> =>
  apiClient.post<BuildingOut>('/api/buildings', d).then((r) => r.data)

export const updateBuilding = (id: string, d: BuildingUpdate): Promise<BuildingOut> =>
  apiClient.put<BuildingOut>(`/api/buildings/${id}`, d).then((r) => r.data)

export const deleteBuilding = (id: string): Promise<void> =>
  apiClient.delete(`/api/buildings/${id}`).then(() => undefined)

export const listBuildingAvailability = (buildingId: string): Promise<BuildingAvailabilityOut[]> =>
  apiClient.get<BuildingAvailabilityOut[]>(`/api/buildings/${buildingId}/availability`).then((r) => r.data)

export const addBuildingAvailability = (buildingId: string, d: BuildingAvailabilityCreate): Promise<BuildingAvailabilityOut> =>
  apiClient.post<BuildingAvailabilityOut>(`/api/buildings/${buildingId}/availability`, d).then((r) => r.data)

export const updateBuildingAvailability = (buildingId: string, id: string, d: BuildingAvailabilityCreate): Promise<BuildingAvailabilityOut> =>
  apiClient.put<BuildingAvailabilityOut>(`/api/buildings/${buildingId}/availability/${id}`, d).then((r) => r.data)

export const deleteBuildingAvailability = (buildingId: string, id: string): Promise<void> =>
  apiClient.delete(`/api/buildings/${buildingId}/availability/${id}`).then(() => undefined)

export const listSchedulePlans = (): Promise<SchedulePlanOut[]> =>
  apiClient.get<SchedulePlanOut[]>('/api/schedule-plans').then((r) => r.data)

export const createSchedulePlan = (d: SchedulePlanCreate): Promise<SchedulePlanOut> =>
  apiClient.post<SchedulePlanOut>('/api/schedule-plans', d).then((r) => r.data)

export const updateSchedulePlan = (id: string, d: SchedulePlanUpdate): Promise<SchedulePlanOut> =>
  apiClient.put<SchedulePlanOut>(`/api/schedule-plans/${id}`, d).then((r) => r.data)

export const deleteSchedulePlan = (id: string): Promise<void> =>
  apiClient.delete(`/api/schedule-plans/${id}`).then(() => undefined)

export const publishSchedulePlan = (id: string): Promise<SchedulePlanOut> =>
  apiClient.post<SchedulePlanOut>(`/api/schedule-plans/${id}/publish`).then((r) => r.data)

export const unpublishSchedulePlan = (id: string): Promise<SchedulePlanOut> =>
  apiClient.post<SchedulePlanOut>(`/api/schedule-plans/${id}/unpublish`).then((r) => r.data)

export const listScheduleEntries = (planId: string): Promise<ScheduleEntryOut[]> =>
  apiClient.get<ScheduleEntryOut[]>(`/api/schedule-plans/${planId}/entries`).then((r) => r.data)

export const addScheduleEntry = (planId: string, d: ScheduleEntryCreate): Promise<ScheduleEntryOut> =>
  apiClient.post<ScheduleEntryOut>(`/api/schedule-plans/${planId}/entries`, d).then((r) => r.data)

export const updateScheduleEntry = (planId: string, entryId: string, d: ScheduleEntryCreate): Promise<ScheduleEntryOut> =>
  apiClient.put<ScheduleEntryOut>(`/api/schedule-plans/${planId}/entries/${entryId}`, d).then((r) => r.data)

export const deleteScheduleEntry = (planId: string, entryId: string): Promise<void> =>
  apiClient.delete(`/api/schedule-plans/${planId}/entries/${entryId}`).then(() => undefined)

export const autoSchedule = (planId: string, d: AutoScheduleRequest): Promise<AutoScheduleResult> =>
  apiClient.post<AutoScheduleResult>(`/api/schedule-plans/${planId}/auto-schedule`, d).then((r) => r.data)

export const confirmAutoSchedule = (planId: string, d: ConfirmAutoScheduleRequest): Promise<ScheduleEntryOut[]> =>
  apiClient.post<ScheduleEntryOut[]>(`/api/schedule-plans/${planId}/auto-schedule/confirm`, d).then((r) => r.data)
