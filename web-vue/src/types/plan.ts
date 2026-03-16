import type { Routine } from './routine'

export type PlanWorkout = Routine & {
  date: string // ISO 8601 date string
}

export type PlanClient = {
  id?: string
  name: string
  imageUrl?: string
}

export type PlanStatus = 'Draft' | 'Published' | 'Revoked'

export type Plan = {
  id: string
  name: string
  clientId?: string
  client?: PlanClient
  clientName: string // Reference to client by name
  workouts: PlanWorkout[]
  status?: PlanStatus
}
