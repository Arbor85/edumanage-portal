export type ExcerciseMuscle = Record<string, unknown>

export type Excercise = {
  id: number
  name: string
  shortDescription: string
  primaryMuscle: string
  muscles: ExcerciseMuscle[]
  tags: string[]
}
