import type { Routine } from '../types/routine'
import { useAuth0 } from '@auth0/auth0-vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL in environment configuration')
}

const ROUTINES_ENDPOINT = `${API_BASE_URL}/api/routines`

export type CompleteRoutinePayload = Record<string, unknown>

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Routine API request failed')
  }

  return response.json() as Promise<T>
}

export const useRoutinesApi = () => {
  const { getAccessTokenSilently } = useAuth0()

  const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers)
    const token = await getAccessTokenSilently()

    headers.set('Authorization', `Bearer ${token}`)

    return fetch(input, {
      ...init,
      headers,
    })
  }

  const listRoutines = async (): Promise<Routine[]> => {
    const response = await fetchWithAuth(ROUTINES_ENDPOINT)
    return parseJsonResponse<Routine[]>(response)
  }

  const addRoutine = async (payload: Omit<Routine, 'id'>): Promise<Routine> => {
    const response = await fetchWithAuth(ROUTINES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        note: payload.note,
        excercises: payload.excercises,
      }),
    })

    return parseJsonResponse<Routine>(response)
  }

  const editRoutine = async (routineId: string, payload: Omit<Routine, 'id'>): Promise<Routine> => {
    const response = await fetchWithAuth(`${ROUTINES_ENDPOINT}/${encodeURIComponent(routineId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        note: payload.note,
        excercises: payload.excercises,
      }),
    })

    return parseJsonResponse<Routine>(response)
  }

  const deleteRoutine = async (routineId: string): Promise<void> => {
    const response = await fetchWithAuth(`${ROUTINES_ENDPOINT}/${encodeURIComponent(routineId)}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Routine API request failed')
    }
  }

  const completeRoutine = async (payload: CompleteRoutinePayload): Promise<void> => {
    const response = await fetchWithAuth(`${ROUTINES_ENDPOINT}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Routine completion request failed')
    }
  }

  return {
    listRoutines,
    addRoutine,
    editRoutine,
    deleteRoutine,
    completeRoutine,
  }
}
