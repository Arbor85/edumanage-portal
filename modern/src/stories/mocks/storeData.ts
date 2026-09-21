import type { ClientOut, ExcerciseOut, RoutineOut } from '../../types'

const clientDefaults = { firstName: null, lastName: null, email: null, gender: null, userId: null }

export const mockClients: ClientOut[] = [
  { ...clientDefaults, invitationCode: 'c1', name: 'Alice Johnson', status: 'Active', imageUrl: null, trainerUserId: 'trainer1', tags: ['weight-loss', 'beginner'] },
  { ...clientDefaults, invitationCode: 'c2', name: 'Bob Smith', status: 'Active', imageUrl: null, trainerUserId: 'trainer1', tags: ['muscle-gain'] },
  { ...clientDefaults, invitationCode: 'c3', name: 'Carol White', status: 'Invited', imageUrl: null, trainerUserId: 'trainer1', tags: ['flexibility'] },
  { ...clientDefaults, invitationCode: 'c4', name: 'David Lee', status: 'Active', imageUrl: null, trainerUserId: 'trainer1', tags: ['advanced', 'powerlifting'] },
  { ...clientDefaults, invitationCode: 'c5', name: 'Eva Martinez', status: 'Invited', imageUrl: null, trainerUserId: 'trainer1', tags: [] },
]

const EXERCISE_DEFAULTS = {
  activityType: 'weighted' as const,
  activityTrackType: 'repetitions' as const,
  instructions: null,
  equipment: null,
  level: null,
  force: null,
  mechanic: null,
  category: null,
  imagePath: null,
  gifPath: null,
  datasetId: null,
  isDirectFavourite: false,
  usageCount: 0,
}

export const mockExercises: ExcerciseOut[] = [
  {
    ...EXERCISE_DEFAULTS,
    id: 1,
    name: 'Barbell Squat',
    shortDescription: 'Compound lower body movement',
    primaryMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    muscles: [{ name: 'Quadriceps' }, { name: 'Glutes' }],
    tags: ['strength', 'compound'],
  },
  {
    ...EXERCISE_DEFAULTS,
    id: 2,
    name: 'Bench Press',
    shortDescription: 'Compound chest press',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    muscles: [{ name: 'Chest' }, { name: 'Triceps' }],
    tags: ['strength', 'compound', 'push'],
  },
  {
    ...EXERCISE_DEFAULTS,
    id: 3,
    name: 'Deadlift',
    shortDescription: 'Full-body hinge movement',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
    muscles: [{ name: 'Back' }, { name: 'Glutes' }],
    tags: ['strength', 'compound', 'pull'],
  },
  {
    ...EXERCISE_DEFAULTS,
    id: 4,
    name: 'Pull-Up',
    shortDescription: 'Upper back and biceps',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Biceps'],
    muscles: [{ name: 'Back' }, { name: 'Biceps' }],
    tags: ['bodyweight', 'pull'],
  },
]

export const mockRoutines: RoutineOut[] = [
  {
    id: 'r1',
    userId: 'trainer1',
    name: 'Push Day A',
    note: 'Chest, shoulders and triceps focus',
    excercises: [
      {
        name: 'Bench Press',
        isBodyweight: false,
        sets: [
          { type: 'warmup', reps: 10, weight: 40, note: null },
          { type: 'normal', reps: 8, weight: 80, note: null },
          { type: 'normal', reps: 8, weight: 80, note: null },
        ],
      },
    ],
  },
  {
    id: 'r2',
    userId: 'trainer1',
    name: 'Pull Day B',
    note: 'Back and biceps focus',
    excercises: [
      {
        name: 'Deadlift',
        isBodyweight: false,
        sets: [
          { type: 'normal', reps: 5, weight: 100, note: null },
          { type: 'normal', reps: 5, weight: 120, note: null },
        ],
      },
    ],
  },
  {
    id: 'r3',
    userId: 'trainer1',
    name: 'Leg Day C',
    note: null,
    excercises: [
      {
        name: 'Barbell Squat',
        isBodyweight: false,
        sets: [
          { type: 'warmup', reps: 12, weight: 60, note: null },
          { type: 'normal', reps: 6, weight: 100, note: null },
        ],
      },
    ],
  },
]
