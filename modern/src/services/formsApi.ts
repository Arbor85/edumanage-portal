import apiClient from './apiClient'
import type {
  FormTemplateOut, FormTemplateCreate, FormTemplateUpdate,
  FormResponseOut, FormResponseCreate,
  StandaloneFormResponseCreate, StandaloneFormResponseOut, StandaloneFormResponsesSummaryOut,
} from '../types'

export const listFormTemplates = (): Promise<FormTemplateOut[]> =>
  apiClient.get<FormTemplateOut[]>('/api/form-templates').then((r) => r.data)

export const getFormTemplate = (id: string): Promise<FormTemplateOut> =>
  apiClient.get<FormTemplateOut>(`/api/form-templates/${id}`).then((r) => r.data)

export const createFormTemplate = (d: FormTemplateCreate): Promise<FormTemplateOut> =>
  apiClient.post<FormTemplateOut>('/api/form-templates', d).then((r) => r.data)

export const updateFormTemplate = (id: string, d: FormTemplateUpdate): Promise<FormTemplateOut> =>
  apiClient.put<FormTemplateOut>(`/api/form-templates/${id}`, d).then((r) => r.data)

export const deactivateFormTemplate = (id: string): Promise<void> =>
  apiClient.delete(`/api/form-templates/${id}`).then(() => undefined)

export const listFormResponsesForClient = (clientId: string): Promise<FormResponseOut[]> =>
  apiClient.get<FormResponseOut[]>('/api/form-responses', { params: { client_id: clientId } }).then((r) => r.data)

export const submitFormResponse = (d: FormResponseCreate): Promise<FormResponseOut> =>
  apiClient.post<FormResponseOut>('/api/form-responses', d).then((r) => r.data)

export const submitStandaloneFormResponse = (d: StandaloneFormResponseCreate): Promise<StandaloneFormResponseOut> =>
  apiClient.post<StandaloneFormResponseOut>('/api/standalone-form-responses', d).then((r) => r.data)

export const deleteStandaloneFormResponse = (id: string): Promise<void> =>
  apiClient.delete(`/api/standalone-form-responses/${id}`).then(() => undefined)

export const updateStandaloneFormResponse = (id: string, d: StandaloneFormResponseCreate): Promise<StandaloneFormResponseOut> =>
  apiClient.put<StandaloneFormResponseOut>(`/api/standalone-form-responses/${id}`, d).then((r) => r.data)

export const listStandaloneFormResponses = (templateId: string): Promise<StandaloneFormResponseOut[]> =>
  apiClient.get<StandaloneFormResponseOut[]>('/api/standalone-form-responses', { params: { template_id: templateId } }).then((r) => r.data)

export const getStandaloneFormResponsesSummary = (templateId: string): Promise<StandaloneFormResponsesSummaryOut> =>
  apiClient.get<StandaloneFormResponsesSummaryOut>('/api/standalone-form-responses/summary', { params: { template_id: templateId } }).then((r) => r.data)
