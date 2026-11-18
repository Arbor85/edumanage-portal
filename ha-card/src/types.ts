export interface CardConfig {
  type: 'custom:edumanage-card'
  api_base_url: string
  api_key: string
  title?: string
  poll_interval?: number
}

export interface NormalizedCardConfig {
  apiBaseUrl: string
  apiKey: string
  title: string
  pollInterval: number
}

export interface RoutineTile {
  id: string
  name: string
  excercises?: { id?: string }[] | null
}

export interface QueuedWorkoutOut {
  id: string
  routineId: string
  createdAt: string
  source: string
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
  }
}

export function normalizeConfig(raw: Partial<CardConfig> | undefined): NormalizedCardConfig {
  if (!raw || typeof raw !== 'object') {
    throw new Error('edumanage-card: missing configuration')
  }
  if (typeof raw.api_base_url !== 'string' || !raw.api_base_url) {
    throw new Error('edumanage-card: api_base_url is required')
  }
  if (typeof raw.api_key !== 'string' || !raw.api_key) {
    throw new Error('edumanage-card: api_key is required')
  }
  const pollRaw = typeof raw.poll_interval === 'number' ? raw.poll_interval : 30
  const pollInterval = Math.min(600, Math.max(10, pollRaw))
  return {
    apiBaseUrl: raw.api_base_url.replace(/\/+$/, ''),
    apiKey: raw.api_key,
    title: typeof raw.title === 'string' && raw.title ? raw.title : 'Workouts',
    pollInterval,
  }
}
