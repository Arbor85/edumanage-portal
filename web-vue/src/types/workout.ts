export type WorkoutSetType = 'warmup' | 'normal' | 'fail'

export type WorkoutSet = {
  type: WorkoutSetType
  reps: number | null
  weight: number | null
  note?: string
}

export type WorkoutExcercise = {
  name: string
  isBodyweight: boolean
  note?: string
  sets: WorkoutSet[]
}

export type Workout = {
  id: string
  name: string
  note?: string
  excercises: WorkoutExcercise[]
}
