export type RoutineSetType = 'warmup' | 'normal' | 'fail'

export type RoutineSet = {
  type: RoutineSetType
  reps: number | null
  weight: number | null
  note?: string
}

export type RoutineExcercise = {
  name: string
  isBodyweight: boolean
  note?: string
  sets: RoutineSet[]
}

export type Routine = {
  id: string
  name: string
  note?: string
  excercises: RoutineExcercise[]
}
