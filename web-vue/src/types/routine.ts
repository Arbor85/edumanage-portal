export type RoutineSetType = 'warmup' | 'normal' | 'fail'

export type RoutineSet = {
  type: RoutineSetType
  reps: number | null
  weight: number | null
}

export type RoutineExcercise = {
  name: string
  isBodyweight: boolean
  sets: RoutineSet[]
}

export type Routine = {
  id: string
  name: string
  excercises: RoutineExcercise[]
}
