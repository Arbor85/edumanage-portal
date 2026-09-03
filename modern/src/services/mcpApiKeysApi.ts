import apiClient from './apiClient'
import type { ApiKeyOut, ApiKeyCreatedOut, ApiKeyCreate } from '../types'

export const listApiKeys = (): Promise<ApiKeyOut[]> =>
  apiClient.get<ApiKeyOut[]>('/api/mcp-keys').then((r) => r.data)

export const createApiKey = (d: ApiKeyCreate): Promise<ApiKeyCreatedOut> =>
  apiClient.post<ApiKeyCreatedOut>('/api/mcp-keys', d).then((r) => r.data)

export const deleteApiKey = (id: string): Promise<void> =>
  apiClient.delete(`/api/mcp-keys/${id}`).then(() => undefined)
