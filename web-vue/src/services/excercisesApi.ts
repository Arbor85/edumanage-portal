import type { Excercise, ExcerciseWritePayload } from '../types/excercise'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL in environment configuration')
}

const EXCERCISES_ENDPOINT = `${API_BASE_URL}/api/excercises`

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Excercises API request failed')
  }

  return response.json() as Promise<T>
}

export const useExcercisesApi = () => {
  const fetchWithOptionalAuth = async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers)

    return fetch(input, {
      ...init,
      headers,
    })
  }

  const listExcercises = async (): Promise<Excercise[]> => {
    const response = await fetchWithOptionalAuth(EXCERCISES_ENDPOINT)
    return parseJsonResponse<Excercise[]>(response)
  }

  const createExcercise = async (payload: ExcerciseWritePayload): Promise<Excercise> => {
    const response = await fetchWithOptionalAuth(EXCERCISES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return parseJsonResponse<Excercise>(response)
  }

  const updateExcercise = async (id: number, payload: ExcerciseWritePayload): Promise<Excercise> => {
    const response = await fetchWithOptionalAuth(`${EXCERCISES_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return parseJsonResponse<Excercise>(response)
  }

  const deleteExcercise = async (id: number): Promise<void> => {
    const response = await fetchWithOptionalAuth(`${EXCERCISES_ENDPOINT}/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Failed to delete exercise')
    }
  }

  return {
    listExcercises,
    createExcercise,
    updateExcercise,
    deleteExcercise,
  }
}
