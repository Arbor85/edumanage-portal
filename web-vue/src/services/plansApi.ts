import type { Plan } from '../types/plan'
import { useAuth0 } from '@auth0/auth0-vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL in environment configuration')
}

const PLANS_ENDPOINT = `${API_BASE_URL}/api/plans`

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Plan API request failed')
  }

  return response.json() as Promise<T>
}

export const usePlansApi = () => {
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

  const listPlans = async (): Promise<Plan[]> => {
    const response = await fetchWithAuth(PLANS_ENDPOINT)
    return parseJsonResponse<Plan[]>(response)
  }

  const addPlan = async (payload: Omit<Plan, 'id'>): Promise<Plan> => {
    const response = await fetchWithAuth(PLANS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        clientName: payload.clientName,
        workouts: payload.workouts,
      }),
    })

    return parseJsonResponse<Plan>(response)
  }

  const editPlan = async (planId: string, payload: Omit<Plan, 'id'>): Promise<Plan> => {
    const response = await fetchWithAuth(`${PLANS_ENDPOINT}/${encodeURIComponent(planId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: payload.name,
        clientName: payload.clientName,
        workouts: payload.workouts,
      }),
    })

    return parseJsonResponse<Plan>(response)
  }

  const deletePlan = async (planId: string): Promise<void> => {
    const response = await fetchWithAuth(`${PLANS_ENDPOINT}/${encodeURIComponent(planId)}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Plan API request failed')
    }
  }

  return {
    listPlans,
    addPlan,
    editPlan,
    deletePlan,
  }
}
