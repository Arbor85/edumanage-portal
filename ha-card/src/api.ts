import { ApiError, QueuedWorkoutOut, RoutineTile } from './types'

async function request<T>(
  method: string,
  url: string,
  apiKey: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: {
        'X-Api-Key': apiKey,
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    throw new ApiError(0, err instanceof Error ? err.message : 'Network error')
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Request failed (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const listRoutines = (baseUrl: string, apiKey: string, signal?: AbortSignal) =>
  request<RoutineTile[]>('GET', `${baseUrl}/api/routines`, apiKey, undefined, signal)

export const listQueue = (baseUrl: string, apiKey: string, signal?: AbortSignal) =>
  request<QueuedWorkoutOut[]>('GET', `${baseUrl}/api/workouts/queue`, apiKey, undefined, signal)

export const queueWorkout = (baseUrl: string, apiKey: string, routineId: string) =>
  request<QueuedWorkoutOut>('POST', `${baseUrl}/api/workouts/queue`, apiKey, {
    routineId,
    source: 'ha',
  })

export const deleteQueue = (baseUrl: string, apiKey: string, id: string) =>
  request<void>('DELETE', `${baseUrl}/api/workouts/queue/${id}`, apiKey)
