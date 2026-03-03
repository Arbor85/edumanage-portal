import type { Routine } from './routine'

export type PlanWorkout = Routine & {
  date: string // ISO 8601 date string
}

export type Plan = {
  id: string
  name: string
  clientName: string // Reference to client by name
  workouts: PlanWorkout[]
}
