import type { Workout } from '../types/workout'
import { useAuth0 } from '@auth0/auth0-vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL in environment configuration')
}

const WORKOUTS_ENDPOINT = `${API_BASE_URL}/api/workouts`

export type CompleteWorkoutPayload = Record<string, unknown>

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Workout API request failed')
  }

  return response.json() as Promise<T>
}

export const useWorkoutsApi = () => {
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

  const listWorkouts = async (): Promise<Workout[]> => {
    const response = await fetchWithAuth(WORKOUTS_ENDPOINT)
    return parseJsonResponse<Workout[]>(response)
  }

  const addWorkout = async (payload: Omit<Workout, 'id'>): Promise<Workout> => {
    const response = await fetchWithAuth(WORKOUTS_ENDPOINT, {
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

    return parseJsonResponse<Workout>(response)
  }

  const editWorkout = async (workoutId: string, payload: Omit<Workout, 'id'>): Promise<Workout> => {
    const response = await fetchWithAuth(`${WORKOUTS_ENDPOINT}/${encodeURIComponent(workoutId)}`, {
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

    return parseJsonResponse<Workout>(response)
  }

  const deleteWorkout = async (workoutId: string): Promise<void> => {
    const response = await fetchWithAuth(`${WORKOUTS_ENDPOINT}/${encodeURIComponent(workoutId)}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Workout API request failed')
    }
  }

  const completeWorkout = async (payload: CompleteWorkoutPayload): Promise<void> => {
    const response = await fetchWithAuth(`${WORKOUTS_ENDPOINT}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Workout completion request failed')
    }
  }

  return {
    listWorkouts,
    addWorkout,
    editWorkout,
    deleteWorkout,
    completeWorkout,
  }
}
