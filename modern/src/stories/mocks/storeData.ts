import type { ClientOut, ExcerciseOut, RoutineOut } from '../../types'

export const mockClients: ClientOut[] = [
  {
    invitationCode: 'c1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    status: 'active',
    invitationAccepted: true,
    imageUrl: null,
    trainerUserId: 'trainer1',
    tags: ['weight-loss', 'beginner'],
    note: 'Focuses on cardio and strength balance.',
  },
  {
    invitationCode: 'c2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    status: 'active',
    invitationAccepted: true,
    imageUrl: null,
    trainerUserId: 'trainer1',
    tags: ['muscle-gain'],
    note: 'Prefers morning sessions.',
  },
  {
    invitationCode: 'c3',
    name: 'Carol White',
    email: 'carol@example.com',
    status: 'pending',
    invitationAccepted: false,
    imageUrl: null,
    trainerUserId: 'trainer1',
    tags: ['flexibility'],
    note: null,
  },
  {
    invitationCode: 'c4',
    name: 'David Lee',
    email: 'david@example.com',
    status: 'active',
    invitationAccepted: true,
    imageUrl: null,
    trainerUserId: 'trainer1',
    tags: ['advanced', 'powerlifting'],
    note: 'Competing in local meets.',
  },
  {
    invitationCode: 'c5',
    name: 'Eva Martinez',
    email: 'eva@example.com',
    status: 'pending',
    invitationAccepted: false,
    imageUrl: null,
    trainerUserId: 'trainer1',
    tags: [],
    note: null,
  },
]

export const mockExercises: ExcerciseOut[] = [
  {
    id: 1,
    name: 'Barbell Squat',
    shortDescription: 'Compound lower body movement',
    primaryMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    muscles: [{ name: 'Quadriceps' }, { name: 'Glutes' }],
    tags: ['strength', 'compound'],
  },
  {
    id: 2,
    name: 'Bench Press',
    shortDescription: 'Compound chest press',
    primaryMuscle: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    muscles: [{ name: 'Chest' }, { name: 'Triceps' }],
    tags: ['strength', 'compound', 'push'],
  },
  {
    id: 3,
    name: 'Deadlift',
    shortDescription: 'Full-body hinge movement',
    primaryMuscle: 'Back',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
    muscles: [{ name: 'Back' }, { name: 'Glutes' }],
    tags: ['strength', 'compound', 'pull'],
  },
  {
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
