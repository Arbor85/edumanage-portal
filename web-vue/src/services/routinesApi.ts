import type { Routine } from '../types/routine'

const ROUTINES_STORAGE_KEY = 'routines:data'

const normalizeRoutine = (value: unknown): Routine | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const parsedRoutine = value as { id?: unknown; name?: unknown; excercises?: unknown }

  if (typeof parsedRoutine.id !== 'string' || typeof parsedRoutine.name !== 'string' || !Array.isArray(parsedRoutine.excercises)) {
    return null
  }

  const normalizedExcercises = parsedRoutine.excercises
    .map((excercise) => {
      if (typeof excercise === 'string') {
        return {
          name: excercise,
          isBodyweight: false,
          sets: [],
        }
      }

      if (!excercise || typeof excercise !== 'object') {
        return null
      }

      const parsedExcercise = excercise as {
        name?: unknown
        isBodyweight?: unknown
        sets?: unknown
      }

      if (typeof parsedExcercise.name !== 'string' || !Array.isArray(parsedExcercise.sets)) {
        return null
      }

      const normalizedSets = parsedExcercise.sets
        .map((setValue) => {
          if (!setValue || typeof setValue !== 'object') {
            return null
          }

          const parsedSet = setValue as { type?: unknown; reps?: unknown; weight?: unknown }
          const isTypeValid = parsedSet.type === 'warmup' || parsedSet.type === 'normal' || parsedSet.type === 'fail'

          if (!isTypeValid) {
            return null
          }

          return {
            type: parsedSet.type,
            reps: typeof parsedSet.reps === 'number' && Number.isFinite(parsedSet.reps) ? parsedSet.reps : null,
            weight: typeof parsedSet.weight === 'number' && Number.isFinite(parsedSet.weight) ? parsedSet.weight : null,
          }
        })
        .filter((setValue): setValue is { type: 'warmup' | 'normal' | 'fail'; reps: number | null; weight: number | null } => {
          return setValue !== null
        })

      return {
        name: parsedExcercise.name,
        isBodyweight: Boolean(parsedExcercise.isBodyweight),
        sets: normalizedSets,
      }
    })
    .filter((excercise): excercise is Routine['excercises'][number] => {
      return excercise !== null
    })

  return {
    id: parsedRoutine.id,
    name: parsedRoutine.name,
    excercises: normalizedExcercises,
  }
}

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

    return parsedValue
      .map((routine) => normalizeRoutine(routine))
      .filter((routine): routine is Routine => {
        return routine !== null
      })
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
