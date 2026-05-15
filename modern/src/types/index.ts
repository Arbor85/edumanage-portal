// ─── Exercises ────────────────────────────────────────────────
// API path: /api/excercises

export interface Muscle {
  name: string | null
}

export interface ExcerciseOut {
  id: number
  name: string | null
  shortDescription: string | null
  primaryMuscle: string | null
  secondaryMuscles: string[] | null
  muscles: Muscle[] | null
  tags: string[] | null
}

export interface ExcerciseWriteRequest {
  name: string | null
  shortDescription: string | null
  primaryMuscle: string | null
  secondaryMuscles: string[] | null
  tags: string[] | null
}

// ─── Routines ─────────────────────────────────────────────────
// API path: /api/routines

export interface RoutineSet {
  type: string | null        // "normal" | "warmup" | "drop"
  reps: number | null
  weight: number | null
  note: string | null
}

export interface RoutineExcercise {
  name: string | null
  isBodyweight: boolean
  sets: RoutineSet[] | null
}

export interface RoutineOut {
  id: string | null
  userId: string | null
  name: string | null
  note: string | null
  excercises: RoutineExcercise[] | null
}

export interface RoutineCreate {
  name: string | null
  note: string | null
  excercises: RoutineExcercise[] | null
}

export interface RoutineUpdate {
  name: string | null
  note: string | null
  excercises: RoutineExcercise[] | null
}

// ─── Complete Routine ──────────────────────────────────────────
// API path: POST /api/routines/complete

export interface CompletedRoutineSet {
  type: string | null
  reps: number | null
  weight: number | null
  note: string | null
  completed: boolean
}

export interface CompletedRoutineExcercise {
  name: string | null
  isBodyweight: boolean
  sets: CompletedRoutineSet[] | null
}

export interface CompletedSourceWorkout {
  id: string | null
  name: string | null
  date: string | null
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
  currentUserId: string | null
  mode: string | null
  startedAt: string | null
  completedAt: string | null
  durationSeconds: number
  totalSets: number
  completedSets: number
  excercises: CompletedRoutineExcercise[] | null
  sourceWorkout: CompletedSourceWorkout | null
}

// ─── Plans ────────────────────────────────────────────────────
// API path: /api/plans

export interface PlanWorkoutInput {
  id: string | null
  name: string | null
  note: string | null
  user_id: string | null
  excercises: RoutineExcercise[] | null
  date: string | null
}

export interface PlanWorkoutOutput {
  id: string | null
  userId: string | null
  name: string | null
  note: string | null
  excercises: RoutineExcercise[] | null
  date: string | null
}

export interface PlanOut {
  id: string | null
  name: string | null
  clientId: string | null
  note: string | null
  status: string | null      // "draft" | "active" | "inactive"
  workouts: PlanWorkoutOutput[] | null
  client: ClientOut | null
}

export interface PlanCreate {
  name: string | null
  clientId: string | null
  note: string | null
  workouts: PlanWorkoutInput[] | null
}

export interface PlanUpdate {
  name: string | null
  clientId: string | null
  note: string | null
  workouts: PlanWorkoutInput[] | null
}

export interface PlanStatusUpdate {
  status: string | null
}

// ─── Clients ──────────────────────────────────────────────────
// API path: /api/clients

export interface ClientOut {
  name: string | null
  tags: string[] | null
  imageUrl: string | null
  status: string | null      // "pending" | "active"
  invitationAccepted: boolean
  invitationCode: string | null
  trainerUserId: string | null
  email: string | null
  note: string | null
}

export interface ClientCreate {
  name: string | null
  tags: string[] | null
  email: string | null
  note: string | null
  invitationCode: string | null
}

export interface ClientUpdate {
  name: string | null
  tags: string[] | null
  email: string | null
  note: string | null
}

// ─── Invitations ──────────────────────────────────────────────
// API path: /api/invitations

export interface InvitationOut {
  name: string | null
  imageUrl: string | null
}

export interface AcceptInvitationRequest {
  invitationCode: string | null
  imageUrl: string | null
}

// ─── Meetings ─────────────────────────────────────────────────
// API path: /api/meetings

export interface MeetingOut {
  id: string | null
  userId: string | null
  clientId: string | null
  title: string | null
  date: string | null
  note: string | null
  startsAt: string | null
  price: number
}

export interface MeetingCreate {
  clientId: string | null
  title: string | null
  date: string | null
  note: string | null
  startsAt: string | null
  price: number
}

export interface MeetingUpdate {
  clientId: string | null
  title: string | null
  date: string | null
  note: string | null
  startsAt: string | null
  price: number
}

// ─── Courses ──────────────────────────────────────────────────
// API path: /api/courses

export interface CoursePrice {
  value: number
  currency: string | null
}

export interface CourseOut {
  id: string | null
  userId: string | null
  name: string | null
  type: string | null        // "online" | "in-person" | "hybrid"
  size: number | null
  price: CoursePrice | null
  description: string | null
  tags: string[] | null
}

export interface CourseCreate {
  name: string | null
  type: string | null
  size: number | null
  price: CoursePrice | null
  description: string | null
  tags: string[] | null
}

export interface CourseUpdate {
  name: string | null
  type: string | null
  size: number | null
  price: CoursePrice | null
  description: string | null
  tags: string[] | null
}

// ─── Frontend-only ────────────────────────────────────────────

export interface ActiveSet {
  setNumber: number
  reps: number | null
  weight: number | null
  targetReps: number | null
  targetWeight: number | null
  actualReps: number | null
  actualWeight: number | null
  completed: boolean
  isBodyweight: boolean
  note: string | null
}

export interface ActiveExercise {
  name: string
  isBodyweight: boolean
  sets: ActiveSet[]
  currentSetIndex: number
  skipped: boolean
}

export interface ActiveWorkoutState {
  routineName: string | null
  mode: 'plan' | 'free' | 'routine'
  sourceWorkout: CompletedSourceWorkout | null
  startedAt: string
  pausedAt: string | null
  totalPausedSeconds: number
  elapsedSeconds: number
  exercises: ActiveExercise[]
  currentExerciseIndex: number
  currentSetIndex: number
  paused: boolean
  status: 'in_progress' | 'paused' | 'completed'
}
