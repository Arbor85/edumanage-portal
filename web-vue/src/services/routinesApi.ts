import type { Routine } from '../types/routine'

const ROUTINES_STORAGE_KEY = 'routines:data'

const readRoutines = (): Routine[] => {
  const rawValue = localStorage.getItem(ROUTINES_STORAGE_KEY)

  if (!rawValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue as Routine[]
  } catch {
    return []
  }
}

const writeRoutines = (routines: Routine[]) => {
  localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(routines))
}

const createRoutineId = () => {
  return `routine-${Math.random().toString(36).slice(2, 10)}`
}

export const routinesApi = {
  async listRoutines(): Promise<Routine[]> {
    return readRoutines()
  },

  async addRoutine(payload: Omit<Routine, 'id'>): Promise<Routine> {
    const newRoutine: Routine = {
      id: createRoutineId(),
      name: payload.name,
      excercises: [...payload.excercises],
    }

    const currentRoutines = readRoutines()
    const nextRoutines = [newRoutine, ...currentRoutines]
    writeRoutines(nextRoutines)

    return newRoutine
  },

  async editRoutine(routineId: string, payload: Omit<Routine, 'id'>): Promise<Routine> {
    const currentRoutines = readRoutines()
    const targetRoutine = currentRoutines.find((routine) => routine.id === routineId)

    if (!targetRoutine) {
      throw new Error('Routine not found')
    }

    const updatedRoutine: Routine = {
      ...targetRoutine,
      name: payload.name,
      excercises: [...payload.excercises],
    }

    const nextRoutines = currentRoutines.map((routine) => {
      if (routine.id !== routineId) {
        return routine
      }

      return updatedRoutine
    })

    writeRoutines(nextRoutines)

    return updatedRoutine
  },
}
