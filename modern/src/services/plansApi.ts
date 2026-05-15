import apiClient from './apiClient'
import type { PlanOut, PlanCreate, PlanUpdate } from '../types'

export const listPlans = (): Promise<PlanOut[]> =>
  apiClient.get<PlanOut[]>('/api/plans').then((r) => r.data)

export const getPlan = (id: string): Promise<PlanOut> =>
  apiClient.get<PlanOut>(`/api/plans/${id}`).then((r) => r.data)

export const createPlan = (d: PlanCreate): Promise<PlanOut> =>
  apiClient.post<PlanOut>('/api/plans', d).then((r) => r.data)

export const updatePlan = (id: string, d: PlanUpdate): Promise<PlanOut> =>
  apiClient.put<PlanOut>(`/api/plans/${id}`, d).then((r) => r.data)

export const deletePlan = (id: string): Promise<void> =>
  apiClient.delete(`/api/plans/${id}`).then(() => undefined)

export const updatePlanStatus = (id: string, status: string): Promise<PlanOut> =>
  apiClient.patch<PlanOut>(`/api/plans/${id}/status`, { status }).then((r) => r.data)
