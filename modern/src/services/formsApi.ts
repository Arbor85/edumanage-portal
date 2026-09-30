import apiClient from './apiClient'
import type {
  FormTemplateOut, FormTemplateCreate, FormTemplateUpdate,
  FormResponseOut, FormResponseCreate,
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
