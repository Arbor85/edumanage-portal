export type ActivityType = 'weighted' | 'bodyweight' | 'cardio' | 'machine'
export type ActivityTrackType = 'repetitions' | 'time' | 'distance'
export type SupersetColor = 'violet' | 'orange' | 'sky' | 'rose' | 'amber'

export interface RoutineSet {
  type: string | null
  reps: number | null
  weight: number | null
  duration: number | null
  distance: number | null
  note: string | null
}

export interface SupersetGroup {
  id: string
  name: string | null
  color: SupersetColor
}

export interface DropConfig {
  count: number
  weightDecreasePercent: number
}

export interface RoutineExcercise {
  name: string | null
  activityType: ActivityType
  activityTrackType: ActivityTrackType
  sets: RoutineSet[] | null
  supersetGroupId: string | null
  dropConfig: DropConfig | null
}

export interface RoutineOut {
  id: string | null
  userId: string | null
  name: string | null
  note: string | null
  excercises: RoutineExcercise[] | null
  supersetGroups: SupersetGroup[]
}

export interface ActiveSet {
  setNumber: number
  reps: number | null
  weight: number | null
  duration: number | null
  distance: number | null
  targetReps: number | null
  targetWeight: number | null
  targetDuration: number | null
  targetDistance: number | null
  actualReps: number | null
  actualWeight: number | null
  actualDuration: number | null
  actualDistance: number | null
  completed: boolean
  note: string | null
}

export interface ActiveExercise {
  name: string
  activityType: ActivityType
  activityTrackType: ActivityTrackType
  skipped: boolean
  sets: ActiveSet[]
  supersetGroupId: string | null
  isDropSet: boolean
}

export interface SupersetStepItem {
  exerciseIndex: number
  setIndex: number
  completed: boolean
}

export type WorkoutStep =
  | { type: 'normal-set'; exerciseIndex: number; setIndex: number }
  | { type: 'superset-round'; groupId: string; roundIndex: number; items: SupersetStepItem[] }
  | { type: 'drop-set'; exerciseIndex: number; setIndex: number; isLastDrop: boolean }

export interface CompletedSourceWorkout {
  id: string | null
  name: string | null
  date: string | null
}

export interface ActiveWorkoutState {
  routineName: string
  mode: string | null
  sourceWorkout: CompletedSourceWorkout | null
  startedAt: string
  pausedAt: string | null
  totalPausedSeconds: number
  elapsedSeconds: number
  exercises: ActiveExercise[]
  steps: WorkoutStep[]
  currentStepIndex: number
  paused: boolean
  status: 'in_progress' | 'paused'
}

export interface CompletedRoutineSet {
  type: string | null
  reps: number | null
  weight: number | null
  duration: number | null
  distance: number | null
  note: string | null
  completed: boolean
}

export interface CompletedRoutineExcercise {
  name: string | null
  activityType: ActivityType
  activityTrackType: ActivityTrackType
  sets: CompletedRoutineSet[] | null
}

export interface CompleteRoutineCreate {
  mode: string | null
  startedAt: string | null
  completedAt: string | null
  durationSeconds: number
  totalSets: number
  completedSets: number
  excercises: CompletedRoutineExcercise[] | null
  exercises: CompletedRoutineExcercise[] | null
  sourceWorkout: CompletedSourceWorkout | null
}

export interface WorkoutHistoryOut {
  id: string | null
  name: string | null
  completedAt: string | null
  durationSeconds: number
  totalSets: number
  completedSets: number
}

export interface ClientOut {
  id: string | null
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  status: string | null
  imageUrl: string | null
}

export interface ProgressWeeklyData {
  week: string
  volume: number
  workouts: number
}

export interface PersonalRecord {
  exerciseName: string
  weight: number | null
  reps: number | null
  completedAt: string
}

export interface ProgressData {
  weekly: ProgressWeeklyData[]
  records: PersonalRecord[]
  totalWorkouts: number
  totalSets: number
  totalHours: number
}
