export type ExcerciseMuscle = Record<string, unknown>

export type Excercise = {
  id: number
  name: string
  shortDescription: string
  primaryMuscle: string
  secondaryMuscles?: string[]
  muscles: ExcerciseMuscle[]
  tags: string[]
}

export type ExcerciseWritePayload = {
  name: string
  shortDescription: string
  primaryMuscle: string
  secondaryMuscles: string[]
  tags: string[]
}
