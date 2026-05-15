# EduManage Portal — Implementation Plan

This document is a step-by-step implementation guide for an AI agent. Follow each phase in order. Do not skip ahead — later phases depend on earlier ones being complete.

All API types are derived directly from `openApi.json`. Where the API uses the misspelling `excercise`, the TypeScript interface mirrors it exactly so serialization is transparent — do not rename fields on the wire.

## Governing Rules (from CLOUDE.md)

Before writing any code, internalise these constraints — they override any conflicting default in this plan:

- Vue 3 Composition API, `<script setup>` only. No Options API.
- Naming: API wrappers are named `{entity}Api` (e.g. `clientsApi`, `routinesApi`). Never `*Service`.
- File locations: services in `src/services/`, pages in `src/pages/`, shared components in `src/components/`, page-specific components in `src/pages/{page}/components/`.
- `Select{Entity}` components live in `src/components/Select{Entity}/index.vue` and support search + select from existing data.
- Every list view: open-text search at top, loading state (no empty state flash), empty state, refresh button, pagination when list can exceed 20 items.
- Time-related pages (Meetings, History): provide List view AND Calendar view with a toggle.
- Non-time-related pages with status (Plans, Clients, Courses): provide List view AND Kanban view with a toggle.
- Details open in a responsive dialog (not a new route) on both desktop and mobile.
- After every successful create / edit / delete: show a notification using `src/components/NotificationToast.vue`.
- Custom scrollbar styles on all scrollable `<div>` elements.
- When a feature requires a backend endpoint not present in `openApi.json`: add the prompt to `src/services/prompts.md` and do not block the frontend implementation.
- Silent operation: display progress indicators and ask for clarification when blocked. No explanatory commentary.

---

## Phase 0 — Project Scaffolding

### Commands
```bash
npm create vite@latest . -- --template vue-ts
npm install vue-router@4 pinia @auth0/auth0-vue axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Files to create / configure
- `tailwind.config.ts` — content paths, design token colours (see Design System below), custom scrollbar utilities, dark mode via `class` strategy
- `src/main.ts` — mount app, register Auth0, Pinia, Router plugins
- `src/env.d.ts` — import.meta.env typings for AUTH0_DOMAIN, AUTH0_CLIENT_ID, API_BASE_URL
- `.env` — VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_API_BASE_URL

---

## Phase 0.5 — Design System

Derived from `design/screen.png` (Dashboard) and `design/screen_1.png` (Exercise Library). All visual decisions in this plan reference these tokens.

### Colour Tokens (`tailwind.config.ts`)

```ts
colors: {
  primary: {
    DEFAULT: '#00C896',   // mint green — CTAs, active nav, badges
    light:   '#E6FAF4',   // tinted backgrounds
    dark:    '#00A67A',   // hover state
  },
  surface: {
    DEFAULT: '#FFFFFF',
    muted:   '#F7F8FA',   // page background
    dark:    '#1A1D23',   // sidebar (dark), dark mode cards
  },
  text: {
    primary:   '#1A1D23',
    secondary: '#6B7280',
    inverse:   '#FFFFFF',
  },
  difficulty: {
    beginner:     '#00C896',   // green pill
    intermediate: '#F59E0B',   // amber pill
    advanced:     '#EF4444',   // red pill
  },
  delta: {
    positive: '#00C896',
    negative: '#EF4444',
  }
}
```

### Typography
- Page title: `text-2xl font-bold text-text-primary`
- Section heading: `text-lg font-semibold text-text-primary`
- Subtitle / caption: `text-sm text-text-secondary`
- Stat value: `text-3xl font-bold text-text-primary`
- Muscle tag: `text-xs font-semibold uppercase tracking-wider text-text-secondary`

### Elevation / Cards
- Default card: `bg-surface rounded-2xl shadow-sm border border-gray-100`
- Dark card (sidebar, featured workout): `bg-surface-dark rounded-2xl`
- Stat card: `bg-surface rounded-2xl shadow-sm p-5`

### Sidebar
- Width: `w-56` (desktop). Background: `bg-surface-dark` (dark). Items: icon + label, `text-sm font-medium text-white/70`. Active: `bg-primary/20 text-primary rounded-xl`.

### Dark Mode
- Toggle button (moon/sun icon) fixed in top-right of `TopNav`.
- Implemented via Tailwind `darkMode: 'class'`. Toggle adds/removes `dark` class on `<html>`. Persist preference to `localStorage`.

### Exercise Card (grid)
- Aspect ratio `4/3` container with background image (`object-cover`).
- Gradient overlay: `bg-gradient-to-t from-black/70 to-transparent`.
- Difficulty badge: top-left pill, colour from `difficulty.*` tokens.
- Muscle tags: bottom-left, uppercase, white/70.
- "View Details +" link: bottom-right or below card.
- Hover: `scale-[1.02] transition-transform`.

### Stat Card (dashboard)
- Icon top-left (coloured circle bg).
- Large value centre.
- Label below value (`text-text-secondary`).
- Delta badge top-right: `+6%` / `-3%` with arrow icon, coloured by `delta.*`.

### Progress Ring (dashboard)
- SVG circle with `stroke-dasharray` / `stroke-dashoffset` animation.
- Centre label: percentage in `text-2xl font-bold`.
- Used for daily progress, calorie targets.

### Difficulty Badge
```
Beginner     → bg-difficulty-beginner/20 text-difficulty-beginner
Intermediate → bg-difficulty-intermediate/20 text-difficulty-intermediate
Advanced     → bg-difficulty-advanced/20 text-difficulty-advanced
```

---

## Phase 1 — TypeScript Data Models

Create `src/types/index.ts`. All interfaces map 1-to-1 to API schemas in `openApi.json`.

```ts
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
  exercises: CompletedRoutineExcercise[] | null   // API accepts both spellings
  sourceWorkout: CompletedSourceWorkout | null
}

export interface WorkoutHistoryOut {
  id: string | null
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
// Identified by invitationCode (not a numeric id) for mutations.

export interface ClientOut {
  name: string | null
  tags: string[] | null
  imageUrl: string | null
  status: string | null      // "pending" | "active"
  invitationCode: string | null
  trainerUserId: string | null
}

export interface ClientCreate {
  name: string | null
  tags: string[] | null
  invitationCode: string | null
}

export interface ClientUpdate {
  name: string | null
  tags: string[] | null
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
  startsAt: string | null
  price: number
}

export interface MeetingCreate {
  clientId: string | null
  startsAt: string | null
  price: number
}

export interface MeetingUpdate {
  clientId: string | null
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
}

export interface CourseCreate {
  name: string | null
  type: string | null
  size: number | null
  price: CoursePrice | null
  description: string | null
}

export interface CourseUpdate {
  name: string | null
  type: string | null
  size: number | null
  price: CoursePrice | null
  description: string | null
}

// ─── Frontend-only ────────────────────────────────────────────

export interface ActiveSet {
  setNumber: number
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
  skipped: boolean
}

export interface ActiveWorkoutState {
  mode: 'plan' | 'free' | 'routine'
  sourceWorkout: CompletedSourceWorkout | null
  startedAt: string
  pausedAt: string | null
  totalPausedSeconds: number
  exercises: ActiveExercise[]
  currentExerciseIndex: number
  currentSetIndex: number
  status: 'in_progress' | 'paused' | 'completed'
}
```

---

## Phase 2 — HTTP Client & API Services

All files in `src/services/`. Named `{entity}Api.ts`. Export plain async functions — no classes.

### `src/services/apiClient.ts`
- Axios instance with `baseURL = import.meta.env.VITE_API_BASE_URL`
- Request interceptor: call `useAuth0().getAccessTokenSilently()` and attach `Authorization: Bearer <token>`
- Response interceptor: 401 → redirect `/login`; 403 → `useToast().error('Access denied')`; return `error.response?.data` for 422

### `src/services/exercisesApi.ts`
```ts
export const listExercises  = (): Promise<ExcerciseOut[]>         // GET  /api/excercises
export const createExercise = (d: ExcerciseWriteRequest)          // POST /api/excercises
export const updateExercise = (id: number, d: ExcerciseWriteRequest) // PUT /api/excercises/{id}
export const deleteExercise = (id: number): Promise<void>         // DELETE /api/excercises/{id}
```

### `src/services/routinesApi.ts`
```ts
export const listRoutines    = (): Promise<RoutineOut[]>
export const createRoutine   = (d: RoutineCreate): Promise<RoutineOut>
export const updateRoutine   = (id: string, d: RoutineUpdate): Promise<RoutineOut>
export const deleteRoutine   = (id: string): Promise<void>
export const completeRoutine = (d: CompleteRoutineCreate): Promise<WorkoutHistoryOut>
```

### `src/services/plansApi.ts`
```ts
export const listPlans        = (): Promise<PlanOut[]>
export const getPlan          = (id: string): Promise<PlanOut>
export const createPlan       = (d: PlanCreate): Promise<PlanOut>
export const updatePlan       = (id: string, d: PlanUpdate): Promise<PlanOut>
export const deletePlan       = (id: string): Promise<void>
export const updatePlanStatus = (id: string, status: string): Promise<PlanOut>
```

### `src/services/clientsApi.ts`
```ts
export const listClients   = (): Promise<ClientOut[]>
export const createClient  = (d: ClientCreate): Promise<ClientOut>
export const updateClient  = (invitationCode: string, d: ClientUpdate): Promise<ClientOut>
export const deleteClient  = (invitationCode: string): Promise<void>
```

### `src/services/invitationsApi.ts`
```ts
export const getInvitation    = (code: string): Promise<InvitationOut>
export const acceptInvitation = (code: string, d: AcceptInvitationRequest): Promise<void>
```

### `src/services/meetingsApi.ts`
```ts
export const listMeetings   = (): Promise<MeetingOut[]>
export const createMeeting  = (d: MeetingCreate): Promise<MeetingOut>
export const updateMeeting  = (id: string, d: MeetingUpdate): Promise<MeetingOut>
export const deleteMeeting  = (id: string): Promise<void>
```

### `src/services/coursesApi.ts`
```ts
export const listCourses   = (): Promise<CourseOut[]>
export const createCourse  = (d: CourseCreate): Promise<CourseOut>
export const updateCourse  = (id: string, d: CourseUpdate): Promise<CourseOut>
export const deleteCourse  = (id: string): Promise<void>
```

### `src/services/prompts.md`
Create this file. Add an entry whenever a missing backend endpoint is needed. Format:

```
## [Feature name]

**Endpoint needed:** METHOD /api/path
**Purpose:** one-line description
**Request body:** { ... }
**Expected response:** { ... }
**Testing:** curl example or Swagger steps
```

Initial entries to add when creating this file:

- `GET /api/history` — list `WorkoutHistoryOut[]` for the authenticated user (needed for History page)

- `ExcerciseOut.imageUrl: string` — exercise cover image URL for the card grid; derive a placeholder from `primaryMuscle` until available

- `ExcerciseOut.difficulty: 'Beginner' | 'Intermediate' | 'Advanced'` — explicit difficulty level; until available, parse from `tags` array

- `GET /api/stats/weekly` — workout time, calories burned, completed workouts, avg heart rate for current + previous week; needed for `StatCardRow` delta badges on Dashboard

- `GET /api/nutrition/today` — today's protein/water/meal data; needed for `DailyProgressCard` and `TodaysMealPlanCard` on Dashboard (mark as v2, render placeholder until available)

---

## Phase 3 — Pinia Stores

### `src/stores/authStore.ts`
State: `user: { sub, name, picture, email } | null`, `isLoading: boolean`
Wraps `useAuth0()`. Exposes: `isAuthenticated`, `bootstrap()`, `logout()`.

### `src/stores/exerciseStore.ts`
State: `exercises: ExcerciseOut[]`, `isLoading: boolean`
Actions: `fetch()`, `create(d)`, `update(id, d)`, `remove(id)`
Getters: `filtered(search, muscle, tag)` — pure computed, no extra API call

### `src/stores/routineStore.ts`
State: `routines: RoutineOut[]`, `isLoading: boolean`
Actions: `fetch()`, `create(d)`, `update(id, d)`, `remove(id)`

### `src/stores/planStore.ts`
State: `plans: PlanOut[]`, `isLoading: boolean`
Actions: `fetch()`, `get(id)`, `create(d)`, `update(id, d)`, `remove(id)`, `updateStatus(id, status)`
Getters: `byStatus(status)` — used by Kanban columns

### `src/stores/clientStore.ts`
State: `clients: ClientOut[]`, `isLoading: boolean`
Actions: `fetch()`, `create(d)`, `update(code, d)`, `remove(code)`
Getters: `active`, `pending`

### `src/stores/meetingStore.ts`
State: `meetings: MeetingOut[]`, `isLoading: boolean`
Actions: `fetch()`, `create(d)`, `update(id, d)`, `remove(id)`
Getters: `upcoming`, `past`

### `src/stores/courseStore.ts`
State: `courses: CourseOut[]`, `isLoading: boolean`
Actions: `fetch()`, `create(d)`, `update(id, d)`, `remove(id)`

### `src/stores/workoutStore.ts`
State: `activeWorkout: ActiveWorkoutState | null`, `elapsedSeconds: number`, `restSecondsLeft: number | null`, `isResting: boolean`, `history: WorkoutHistoryOut[]`

Actions:
- `startFromRoutine(routine: RoutineOut)` — build `ActiveWorkoutState`, persist to localStorage
- `startFromPlanWorkout(workout: PlanWorkoutOutput, planId: string)` — same, sets `sourceWorkout`
- `completeSet(actualReps, actualWeight, note?)` — log set, advance, trigger rest if defined
- `skipRest()` — cancel rest timer
- `skipExercise()` — mark skipped, advance
- `addAdHocExercise(name, isBodyweight)` — insert at current position
- `pauseWorkout()` / `resumeWorkout()`
- `finishWorkout()` → build `CompleteRoutineCreate`, call `routinesApi.completeRoutine()`, append result to `history`, persist history to localStorage, clear active workout from localStorage, return `WorkoutHistoryOut`
- `restoreFromLocalStorage()` — called on app mount

Persist `activeWorkout` to `localStorage` on every mutation. Persist `history` (cap 100 entries). Clear active on finish.

---

## Phase 4 — Router

`src/router/index.ts`. Guard: `requiresAuth` meta redirects to `/login` with `?redirect=<path>`.

```
Public:
  /login                    → LoginPage
  /auth/callback            → AuthCallbackPage
  /invite/:code             → InviteAcceptPage

Protected:
  /                         → redirect /dashboard
  /dashboard                → DashboardPage
  /exercises                → ExercisesPage
  /routines                 → RoutinesPage
  /plans                    → PlansPage
  /workout/active           → ActiveWorkoutPage
  /history                  → HistoryPage
  /clients                  → ClientsPage
  /meetings                 → MeetingsPage
  /courses                  → CoursesPage
  /profile                  → ProfilePage
```

Editors and detail dialogs are modals within the list page — no separate editor routes.

---

## Phase 5 — Shared Base Components

`src/components/`

### `NotificationToast.vue`
Already referenced in CLOUDE.md. Displays a toast notification.
Props: `message: string`, `type: 'success' | 'error' | 'info'`, `duration: number` (default 3000)
Teleport to `<body>`. Auto-dismiss. Used after every successful create / edit / delete.

Expose via composable `src/composables/useToast.ts`:
```ts
export function useToast() {
  return { success(msg), error(msg), info(msg) }
}
```

### `BaseButton.vue`
Props: `variant` ('primary'|'secondary'|'danger'|'ghost'), `size` ('sm'|'md'|'lg'), `loading`, `disabled`, `fullWidth`
Min height `44px`.

### `BaseInput.vue`
Props: `modelValue`, `label`, `placeholder`, `type`, `error`, `disabled`, `hint`

### `BaseSelect.vue`
Props: `modelValue`, `label`, `options: {value,label}[]`, `error`, `disabled`

### `BaseTextarea.vue`
Props: `modelValue`, `label`, `rows`, `error`, `hint`

### `BaseModal.vue`
Props: `open`, `title`, `size` ('sm'|'md'|'lg'|'fullscreen')
Emits: `close`
Teleport to `<body>`. Responsive: full-screen on mobile (`< 640px`), centred card on desktop. Backdrop click closes.

### `BaseCard.vue`
Props: `padding` ('none'|'sm'|'md'), `hoverable`

### `BaseAvatar.vue`
Props: `src: string | null`, `name: string`, `size` ('xs'|'sm'|'md'|'lg')
Fallback: initials with deterministic background colour from name hash.

### `BaseBadge.vue`
Props: `label`, `variant` ('default'|'success'|'warning'|'danger'|'primary')

### `BaseSpinner.vue`
Props: `size` ('sm'|'md'|'lg')

### `SkeletonBlock.vue`
Props: `width`, `height`, `rounded` — `animate-pulse` grey block.

### `EmptyState.vue`
Props: `icon`, `title`, `description`, `actionLabel`
Emits: `action`
Never shown while `isLoading === true`.

### `ConfirmDialog.vue`
Props: `open`, `title`, `message`, `confirmLabel`, `variant` ('danger'|'primary')
Emits: `confirm`, `cancel`

### `CountdownTimer.vue`
Props: `seconds: number`, `autoStart: boolean`
Emits: `finish`, `tick`
Circular SVG ring + large number.

### `TagInput.vue`
Props: `modelValue: string[]`, `placeholder`
Enter to add, × to remove.

### `PriceInput.vue`
Props: `modelValue: CoursePrice | null`
Two fields: numeric value + currency string.

### `DifficultyBadge.vue`
Props: `level: 'Beginner' | 'Intermediate' | 'Advanced' | null`
Pill badge using `difficulty.*` colour tokens. Renders nothing when `level` is null.
Derive level from exercise `tags` array: tag matching `/beginner|intermediate|advanced/i`.

### `StatCard.vue`
Props: `label: string`, `value: string`, `icon: string` (icon name), `iconBg: string` (Tailwind colour class), `delta: string | null` (e.g. '+6%'), `deltaPositive: boolean`
Renders the dashboard stat card pattern: icon circle top-left, large value, label, delta badge top-right.

### `ProgressRing.vue`
Props: `percent: number` (0–100), `size: number` (px, default 120), `strokeWidth: number` (default 8), `label: string | null`
SVG circle with animated `stroke-dashoffset`. Centre slot for custom label content.

### `DarkModeToggle.vue`
No props. Reads/writes `dark` class on `<html>` and persists to `localStorage` under key `theme`. Moon icon when light, sun icon when dark.

### `ViewToggle.vue`
Props: `modelValue: 'list' | 'kanban' | 'calendar'`, `options: ('list'|'kanban'|'calendar')[]`
Emits: `update:modelValue`
Icon + label toggle buttons. Persists selection to `localStorage` per page.

### `ListSearchBar.vue`
Props: `modelValue: string`, `placeholder`, `loading: boolean`
Emits: `update:modelValue`, `refresh`
Search input (debounced 300 ms) + refresh icon button on the right.

### `PaginationBar.vue`
Props: `page: number`, `pageSize: number`, `total: number`
Emits: `update:page`
Previous / Next + page indicator. Show only when `total > pageSize`.

---

## Phase 6 — Select{Entity} Components

Each lives in `src/components/Select{Entity}/index.vue`. All support open-text search + selecting from existing data.

### `src/components/SelectClient/index.vue`
Props: `modelValue: string | null` (invitationCode), `label`, `error`, `disabled`
Emits: `update:modelValue`
Dropdown + search input. Loads from `clientStore.active`. Shows avatar + name per option.

### `src/components/SelectExercise/index.vue`
Props: `modelValue: number | null` (exercise id), `label`, `error`
Emits: `update:modelValue`
Dropdown + search. Loads from `exerciseStore.exercises`. Shows primaryMuscle badge.

### `src/components/SelectRoutine/index.vue`
Props: `modelValue: string | null` (routine id), `label`, `error`
Emits: `update:modelValue`
Dropdown + search. Loads from `routineStore.routines`.

---

## Phase 7 — Layout Components

`src/components/layout/`

### `AppLayout.vue`
Shell for authenticated pages. `<TopNav>` + `<SideBar>` (desktop `lg:`) + `<BottomNav>` (mobile). Default slot.

### `TopNav.vue`
Page title (`text-2xl font-bold`) on the left. Right side: `DarkModeToggle`, notification bell icon, user avatar circle. No logo here — logo lives in sidebar only.
Height `h-16`. Background `bg-surface dark:bg-surface-dark`. Bottom border `border-b border-gray-100 dark:border-white/10`.

### `SideBar.vue`
Background `bg-surface-dark`. Width `w-56`. Padding `px-4 py-6`.
Top: app logo + name in white (`text-lg font-bold`).
Nav items — icon + label, full-width, `rounded-xl`, `min-h-[44px]`:
- Home → `/dashboard`
- Exercises → `/exercises`
- Workouts → `/routines` (labelled "Workouts" matching the screen)
- Plans → `/plans`
- Active Workout → `/workout/active` — pulsing green dot when `workoutStore.activeWorkout !== null`
- Schedule → `/meetings`
- Analytics → `/history`
- Clients → `/clients`
- Courses → `/courses`

Active item: `bg-primary/20 text-primary`.
Inactive item: `text-white/70 hover:text-white hover:bg-white/10`.
Bottom (pinned): Profile + Logout, separated by `border-t border-white/10`.

### `BottomNav.vue`
Mobile-only fixed bottom. Five items: Home, Exercises, Active (green FAB centre), Plans, Schedule.

### `PageHeader.vue`
Props: `title`, `subtitle`, `backTo: string | null`

### `AuthLayout.vue`
Minimal centred layout for login/callback.

---

## Phase 8 — Auth Pages

### `src/pages/LoginPage.vue`
Login + Sign up buttons via Auth0.

### `src/pages/AuthCallbackPage.vue`
Full-screen spinner. On mount: wait for Auth0, `authStore.bootstrap()`, redirect.

### `src/pages/InviteAcceptPage.vue`
- `GET /api/invitations/:code` → show trainer name + image (no auth required for this call)
- Unauthenticated: show trainer info + "Create account" button → `loginWithRedirect({ screen_hint: 'signup' })`, store code in `sessionStorage`
- Authenticated on return: call `invitationsApi.acceptInvitation(code, { invitationCode: code, imageUrl: auth0User.picture })`, show success toast, navigate to `/dashboard`

---

## Phase 9 — Exercises Page

Matches `design/screen_1.png`: image card grid, header with filter bar, "Load More" button, difficulty badges, muscle tags.

**View types: Grid only** (not list/kanban — the design uses a dedicated card grid layout).

### `src/pages/ExercisesPage.vue`
State: `search`, `muscleFilter`, `equipmentFilter`, `page` (for Load More), `isCreateOpen`, `editTarget`
On mount: `exerciseStore.fetch()`.

Layout:
1. `PageHeader`: title "Exercise Library", subtitle "Discover and learn over 500+ different movements.", "New Exercise" button (admin/trainer only)
2. Filter bar (single row, below header):
   - Search input: full-width on mobile, `~300px` on desktop, placeholder "Search by name, muscle or tag..."
   - "All Muscle Groups" dropdown (`BaseSelect`)
   - "All Equipment" dropdown (`BaseSelect`)
   - All three filter in `flex gap-3` row, responsive stacking on `< sm`
3. `ExerciseGrid` (page-specific)
4. "Load More Exercises" button — centred, `variant='secondary'`, shown when more exercises remain
5. `ExerciseFormModal` (page-specific)

### `src/pages/ExercisesPage/components/ExerciseGrid.vue`
Props: `exercises: ExcerciseOut[]`, `loading: boolean`
Layout: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5`
Loading: show 8 `ExerciseCardSkeleton` placeholders. Never show empty state while loading.
Empty state: `EmptyState` with "No exercises found" when filtered result is empty.
Each cell: `ExerciseCard`.

### `src/pages/ExercisesPage/components/ExerciseCard.vue`
Props: `exercise: ExcerciseOut`
Emits: `edit`, `delete`

Structure (matches design):
```
<div class="rounded-2xl overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
  <!-- Image area: aspect-[4/3], background image or colour placeholder -->
  <div class="relative aspect-[4/3] bg-gray-200">
    <img :src="imageUrl" class="w-full h-full object-cover" />
    <!-- gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
    <!-- difficulty badge: top-left -->
    <DifficultyBadge :level="difficultyLevel" class="absolute top-3 left-3" />
    <!-- muscle tags: bottom-left -->
    <div class="absolute bottom-3 left-3 flex gap-1 flex-wrap">
      <span class="text-xs font-semibold uppercase tracking-wider text-white/80">
        {{ exercise.primaryMuscle }}
      </span>
      <span v-for="m in exercise.secondaryMuscles?.slice(0,1)" class="text-xs uppercase tracking-wider text-white/60">
        {{ m }}
      </span>
    </div>
    <!-- edit/delete icons: top-right, visible on hover -->
    <div class="absolute top-3 right-3 hidden group-hover:flex gap-1">
      <button @click.stop="$emit('edit')" ...>✏️</button>
      <button @click.stop="$emit('delete')" ...>🗑️</button>
    </div>
  </div>
  <!-- Card footer: name + "View Details +" -->
  <div class="p-3 bg-surface dark:bg-surface-dark">
    <p class="font-semibold text-text-primary dark:text-white truncate">{{ exercise.name }}</p>
    <button class="text-sm text-primary font-medium mt-1">View Details +</button>
  </div>
</div>
```

`imageUrl` derivation: API has no image field — derive a deterministic Unsplash placeholder using exercise `tags` or `primaryMuscle` (e.g. `/api/placeholder/400/300` or a static mapping). Add `imageUrl` to `src/services/prompts.md` as a missing backend field.

`difficultyLevel` derivation: parse `exercise.tags` for values matching `/beginner|intermediate|advanced/i`. If none found, render no badge.

"View Details +" click → opens `ExerciseDetailModal`.

### `src/pages/ExercisesPage/components/ExerciseCardSkeleton.vue`
Animated `SkeletonBlock` matching the card shape: `aspect-[4/3]` block + two lines below.

### `src/pages/ExercisesPage/components/ExerciseDetailModal.vue`
Props: `open`, `exercise: ExcerciseOut`
Emits: `close`, `edit`
Uses `BaseModal` size `md`.
Shows: large name, `DifficultyBadge`, `shortDescription`, primaryMuscle + secondaryMuscles as `BaseBadge` chips, tags, muscles list.
"Edit" button (shown for owner / admin) → switch to `ExerciseFormModal`.

### `src/pages/ExercisesPage/components/ExerciseFormModal.vue`
Props: `open`, `exercise: ExcerciseOut | null`
Uses `BaseModal` size `md`.
Fields: name (`BaseInput`), shortDescription (`BaseTextarea`), primaryMuscle (`BaseInput`), secondaryMuscles (`TagInput`), tags (`TagInput` — include difficulty tag here, e.g. "Beginner").
On create: `exerciseStore.create(d)` → `useToast().success('Exercise created')` → close.
On update: `exerciseStore.update(id, d)` → `useToast().success('Exercise updated')` → close.
Delete button in edit mode → `ConfirmDialog` → `exerciseStore.remove(id)` → success toast → close.

### Load More behaviour
`ExercisesPage` keeps `displayCount = ref(8)`. Computed `visibleExercises = filteredExercises.slice(0, displayCount)`. "Load More" increments `displayCount += 8`. Button hidden when `displayCount >= filteredExercises.length`. Reset `displayCount` to 8 when filters change.

---

## Phase 10 — Routines Page

**View types: List only.**

### `src/pages/RoutinesPage.vue`
State: `search`, `isCreateOpen`, `editTarget: RoutineOut | null`
On mount: `routineStore.fetch()`.

Layout:
1. `PageHeader` + "New Routine" button
2. `ListSearchBar` (filters by name, has refresh button → `routineStore.fetch()`)
3. `RoutineList` (page-specific)
4. `RoutineFormModal` (page-specific)

### `src/pages/RoutinesPage/components/RoutineList.vue`
Props: `routines: RoutineOut[]`, `loading: boolean`
Skeleton while loading. Empty state when empty. Custom scrollbar.
Each row: name, note excerpt, exercise count, Start / Edit / Delete buttons.
Delete → `ConfirmDialog` → success toast.
Edit → open `RoutineFormModal`.
Start → `workoutStore.startFromRoutine(routine)` → navigate `/workout/active`.
Pagination: 20 per page.

### `src/pages/RoutinesPage/components/RoutineFormModal.vue`
Props: `open`, `routine: RoutineOut | null`
Uses `BaseModal` size `lg`.
Fields:
- name (`BaseInput`)
- note (`BaseTextarea`)
- Drag-sortable exercise list: each entry is `RoutineExerciseEntry`
- "Add Exercise" button opens `SelectExercise` as an inline dropdown; on select appends a `RoutineExcercise` with one default `RoutineSet`

`RoutineExerciseEntry` (inline sub-component within modal):
- Exercise name (read-only, from selected exercise)
- isBodyweight toggle
- Set rows: type select, reps input, weight input (hidden when bodyweight), note input
- "Add Set" button, remove set button, remove exercise button
- Drag handle for reorder

On save: `routineStore.create(d)` or `routineStore.update(id, d)` → success toast → close.

---

## Phase 11 — Plans Page

**Time-related: No (status-based). View types: List + Kanban.**

Kanban columns: `draft` | `active` | `inactive`

### `src/pages/PlansPage.vue`
State: `view: 'list' | 'kanban'`, `search`, `isCreateOpen`, `editTarget: PlanOut | null`
On mount: `planStore.fetch()`.

Layout:
1. `PageHeader` + "New Plan" button
2. `ListSearchBar` + `ViewToggle` (list/kanban) side by side
3. Conditional: `PlanList` or `PlanKanban`
4. `PlanFormModal`

### `src/pages/PlansPage/components/PlanList.vue`
Props: `plans: PlanOut[]`, `loading`
Skeleton while loading. Empty state. Custom scrollbar. Pagination 20/page.
Each row: name, note, client name, status badge, workout count, Edit / Delete / Status-change buttons.
Delete → `ConfirmDialog` → success toast.
Status change → `planStore.updateStatus(id, newStatus)` → success toast.

### `src/pages/PlansPage/components/PlanKanban.vue`
Props: `plans: PlanOut[]`, `loading`
Three columns: Draft, Active, Inactive. Each column lists `PlanKanbanCard`.
Drag card between columns → `planStore.updateStatus(id, targetColumn)` → success toast.
Skeleton columns while loading.

### `src/pages/PlansPage/components/PlanKanbanCard.vue`
Props: `plan: PlanOut`
Emits: `edit`, `delete`
Name, client name, workout count, status badge, edit + delete icons.

### `src/pages/PlansPage/components/PlanFormModal.vue`
Props: `open`, `plan: PlanOut | null`
Uses `BaseModal` size `lg`.
Fields:
- name (`BaseInput`)
- note (`BaseTextarea`)
- client (`SelectClient`)
- status (`BaseSelect`: draft/active/inactive)
- Workout list: each entry shows name, note, date, exercise summary
  - "Add from Routine" button opens `SelectRoutine`; on select converts `RoutineOut` → `PlanWorkoutInput`
  - "Add blank" button adds empty `PlanWorkoutInput`
  - Each workout entry: name input, note input, date input, inline exercise list (name + isBodyweight + sets summary)
  - Remove workout button

On save: `planStore.create(d)` or `planStore.update(id, d)` → success toast → close.

---

## Phase 12 — Clients Page

**Time-related: No (status-based). View types: List + Kanban.**

Kanban columns: `pending` | `active`

### `src/pages/ClientsPage.vue`
State: `view: 'list' | 'kanban'`, `search`, `isCreateOpen`, `editTarget: ClientOut | null`
On mount: `clientStore.fetch()`.

Layout:
1. `PageHeader` + "Add Client" button
2. `ListSearchBar` + `ViewToggle`
3. `ClientList` or `ClientKanban`
4. `ClientFormModal` (create/edit)

### `src/pages/ClientsPage/components/ClientList.vue`
Props: `clients: ClientOut[]`, `loading`
Skeleton while loading. Empty state. Custom scrollbar. Pagination 20/page.
Each row: avatar (`BaseAvatar`), name, tags, status badge, invitationCode (truncated with copy icon), Edit / Delete buttons.
Delete → `ConfirmDialog` → success toast.
Edit → open `ClientFormModal` in edit mode.

### `src/pages/ClientsPage/components/ClientKanban.vue`
Two columns: Pending, Active.
Each column lists `ClientKanbanCard`. Skeleton while loading.

### `src/pages/ClientsPage/components/ClientKanbanCard.vue`
Props: `client: ClientOut`
Emits: `edit`, `delete`
Avatar, name, tags, invitationCode copy button, edit + delete icons.

### `src/pages/ClientsPage/components/ClientFormModal.vue`
Props: `open`, `client: ClientOut | null`
Uses `BaseModal` size `sm`.
Fields: name (`BaseInput`), tags (`TagInput`).

Create mode: `clientStore.create({ name, tags, invitationCode: null })`. API generates `invitationCode`. After success: display the returned `invitationCode` with a copy button before closing. Show success toast.

Edit mode: `clientStore.update(client.invitationCode, { name, tags })` → success toast → close.

---

## Phase 13 — Meetings Page

**Time-related: Yes. View types: List + Calendar.**

### `src/pages/MeetingsPage.vue`
State: `view: 'list' | 'calendar'`, `search`, `isCreateOpen`, `editTarget: MeetingOut | null`
On mount: `meetingStore.fetch()`.

Layout:
1. `PageHeader` + "Schedule Meeting" button
2. `ListSearchBar` + `ViewToggle`
3. `MeetingList` or `MeetingCalendar`
4. `MeetingFormModal`

### `src/pages/MeetingsPage/components/MeetingList.vue`
Props: `meetings: MeetingOut[]`, `loading`
Two sections: Upcoming (startsAt ≥ now) and Past. Skeleton while loading. Empty state. Custom scrollbar. Pagination 20/page.
Each row: client name (resolved from `clientStore`), date + time of `startsAt`, price formatted with currency. Edit / Delete buttons.
Delete → `ConfirmDialog` → success toast.

### `src/pages/MeetingsPage/components/MeetingCalendar.vue`
Props: `meetings: MeetingOut[]`, `loading`
Month grid. Days with meetings highlighted. Click a day shows that day's meetings in a popover list with edit/delete. Navigate previous/next month. Skeleton while loading.

### `src/pages/MeetingsPage/components/MeetingFormModal.vue`
Props: `open`, `meeting: MeetingOut | null`
Uses `BaseModal` size `sm`.
Fields: client (`SelectClient`), date-time input for `startsAt`, price (`BaseInput` numeric).
On create: `meetingStore.create(d)` → success toast → close.
On update: `meetingStore.update(id, d)` → success toast → close.

---

## Phase 14 — Courses Page

**Time-related: No (type-based). View types: List + Kanban.**

Kanban columns: `online` | `in-person` | `hybrid`

### `src/pages/CoursesPage.vue`
State: `view: 'list' | 'kanban'`, `search`, `isCreateOpen`, `editTarget: CourseOut | null`
On mount: `courseStore.fetch()`.

Layout:
1. `PageHeader` + "New Course" button
2. `ListSearchBar` + `ViewToggle`
3. `CourseList` or `CourseKanban`
4. `CourseFormModal`

### `src/pages/CoursesPage/components/CourseList.vue`
Props: `courses: CourseOut[]`, `loading`
Skeleton. Empty state. Custom scrollbar. Pagination 20/page.
Each row: name, type badge, size, price, description excerpt. Edit / Delete buttons.

### `src/pages/CoursesPage/components/CourseKanban.vue`
Three columns: Online, In-Person, Hybrid.
Drag between columns → `courseStore.update(id, { type: newColumn })` → success toast.

### `src/pages/CoursesPage/components/CourseKanbanCard.vue`
Props: `course: CourseOut`
Emits: `edit`, `delete`
Name, size, price, edit + delete icons.

### `src/pages/CoursesPage/components/CourseFormModal.vue`
Props: `open`, `course: CourseOut | null`
Uses `BaseModal` size `md`.
Fields: name, type (`BaseSelect`: online/in-person/hybrid), size (`BaseInput` numeric), description (`BaseTextarea`), price (`PriceInput`).
On save: create or update → success toast → close.

---

## Phase 15 — Active Workout

### `src/pages/ActiveWorkoutPage.vue`
Full-screen on mobile. No `AppLayout` wrapper — render standalone with minimal chrome.

States:
1. `workoutStore.activeWorkout === null` → `WorkoutStartPanel`
2. `status === 'in_progress' | 'paused'` → `WorkoutTracker`
3. After `finishWorkout()` resolves → `workoutStore.history[0].id` exists → navigate `/history`

All components below are page-specific: `src/pages/ActiveWorkoutPage/components/`

### `WorkoutStartPanel.vue`
Two tabs: "My Routines" and "From Plan".
Routines tab: compact list from `routineStore.routines` with Start button each. Search input.
Plans tab: list of plans → expand to show workouts → Start button per workout.
Start calls `workoutStore.startFromRoutine(r)` or `workoutStore.startFromPlanWorkout(w, planId)` then navigates to current page (re-renders Tracker).

### `WorkoutTracker.vue`
Layout (full viewport height, no scroll on outer container):
- Header bar: workout name, `WorkoutTimer`, pause/resume button, "Finish" button
- Progress: "Exercise 2 of 5" — `<progress>` element
- Main card: `ActiveExerciseCard`
- `RestCountdownOverlay` (conditionally rendered over full screen)
- Collapsible drawer at bottom: `WorkoutExerciseQueue`

### `WorkoutTimer.vue`
Props: `seconds: number`. Renders `MM:SS`. Amber at 90 min.

### `ActiveExerciseCard.vue`
Shows: exercise name (large), isBodyweight or target weight label, completed set rows, current set input row (reps + weight inputs with `inputmode="numeric"`), live volume, Skip Exercise link.
Emits: `set-complete(reps, weight, note)`, `skip-exercise`.

### `RestCountdownOverlay.vue`
Full-screen semi-transparent overlay when `workoutStore.isResting`. `CountdownTimer` + "Skip Rest" button.

### `WorkoutExerciseQueue.vue`
Upcoming exercises list. Drag-reorder. Custom scrollbar on the list.

---

## Phase 16 — History Page

**Time-related: Yes. View types: List + Calendar.**

Note: API has no `GET /api/history` endpoint. Reads from `workoutStore.history` (localStorage). Add entry to `src/services/prompts.md` for `GET /api/history`.

### `src/pages/HistoryPage.vue`
State: `view: 'list' | 'calendar'`
On mount: load from `workoutStore.history`.

Layout:
1. `PageHeader`
2. `ViewToggle`
3. `HistoryList` or `HistoryCalendar`
4. `WorkoutDetailModal` (opens on item click)

### `src/pages/HistoryPage/components/HistoryList.vue`
Props: `entries: WorkoutHistoryOut[]`, `loading`
Skeleton. Empty state. Custom scrollbar. Pagination 20/page.
Each row: date, sourceWorkout name, duration, completedSets/totalSets. Click → open `WorkoutDetailModal`.

### `src/pages/HistoryPage/components/HistoryCalendar.vue`
Month grid. Days with entries highlighted. Click day → open `WorkoutDetailModal` for that entry.

### `src/pages/HistoryPage/components/WorkoutDetailModal.vue`
Props: `open`, `entry: WorkoutHistoryOut | null`
Uses `BaseModal` size `lg`.
Shows: date/time, duration, mode, completedSets/totalSets, per-exercise set breakdown (name, sets with reps/weight/note, completed checkbox state).

---

## Phase 17 — Dashboard

Matches `design/screen.png`. Two-column layout on desktop (`lg:grid-cols-3`): main content (2 cols) + right sidebar (1 col).

### `src/pages/DashboardPage.vue`
On mount: `routineStore.fetch()` (for recommended card).
Greeting: "Welcome back, {authStore.user.name}! 👋" + subtitle derived from `workoutStore.history`.

Layout (all components page-specific under `src/pages/DashboardPage/components/`):

```
<TopNav>
<div class="grid lg:grid-cols-3 gap-6 p-6">

  <!-- Left/Main: 2 cols -->
  <div class="lg:col-span-2 flex flex-col gap-6">
    <ActiveWorkoutBanner />    <!-- only when workout in progress -->
    <StatCardRow />
    <RecommendedWorkoutCard />
    <RecentActivityList />
  </div>

  <!-- Right sidebar: 1 col -->
  <div class="flex flex-col gap-6">
    <DailyProgressCard />
    <TodaysMealPlanCard />     <!-- placeholder — not in API v1, see prompts.md -->
  </div>

</div>
```

### `ActiveWorkoutBanner.vue`
Shown only when `workoutStore.activeWorkout !== null`.
Green banner: "Workout in progress — {elapsed}" with "Resume" button → `/workout/active`.

### `StatCardRow.vue`
`grid grid-cols-2 lg:grid-cols-4 gap-4`
Four `StatCard` components:
- Workout Time — total duration this week in hrs from `workoutStore.history`
- Completed Workouts — count this week from history
- Calories Burned — not in API: show `--` + add to `prompts.md`
- Avg Heart Rate — not in API: show `--` + add to `prompts.md`

Each `StatCard` receives `delta` prop: compare this week vs last week from history. Positive delta → green `+N%` badge; negative → red `-N%`.

### `RecommendedWorkoutCard.vue`
Dark card (`bg-surface-dark rounded-2xl`), aspect ratio `~3/1` on desktop.
Background image: first routine's cover image (or gradient placeholder).
Gradient overlay: `bg-gradient-to-r from-black/80 to-transparent`.
Content left-aligned: badge "Recommended for You" in primary green, routine name (`text-2xl font-bold text-white`), short description (`text-sm text-white/70`), "Start Now →" button (`bg-primary text-white`).
Data: pick the most recently created routine from `routineStore.routines`. Click "Start Now" → `workoutStore.startFromRoutine(routine)` → navigate `/workout/active`.

### `RecentActivityList.vue`
Title "Recent Activity" + "View all" link → `/history`.
Last 5 entries from `workoutStore.history`.
Each row: exercise icon circle (colour by muscle group), workout name, date + duration left, calorie count right (show `--` if not available).
`EmptyState` ("No workouts yet. Start your first!") when history is empty.

### `DailyProgressCard.vue`
Title "Daily Progress".
`ProgressRing` with percent derived from `completedSets / targetSets` for today (100% if no workout today).
Below ring: two stat rows — "Protein 120g / 150g" and "Water 2.4L / 3.0L" (both placeholders — add to `prompts.md`).

### `TodaysMealPlanCard.vue`
Title "Today's Meal Plan".
Placeholder component — renders 2–3 static meal rows with name + calories.
Add entry to `prompts.md` for nutrition API endpoints.
Do not block the dashboard from rendering while this is unimplemented — render the card with a "Coming soon" state.

---

## Phase 18 — Profile Page

### `src/pages/ProfilePage.vue`
Data from `authStore.user` (Auth0 user object — name, email, picture). Read-only — Auth0 manages identity.
Shows avatar, display name, email, "Log out" button.

---

## Phase 19 — Offline Tolerance

In `workoutStore`:
- `startFromRoutine` / `startFromPlanWorkout`: `localStorage.setItem('activeWorkout', JSON.stringify(state.activeWorkout))`
- Every mutation on `activeWorkout`: re-persist
- `finishWorkout`: `localStorage.removeItem('activeWorkout')`, append to `history`, `localStorage.setItem('workoutHistory', JSON.stringify(state.history))`
- `restoreFromLocalStorage()`: parse both keys, restore state, recalculate elapsed from `startedAt` minus paused time

Called in `main.ts` before mount:
```ts
const workoutStore = useWorkoutStore()
workoutStore.restoreFromLocalStorage()
```

---

## Phase 20 — Responsiveness & Accessibility

1. `< 640px` is primary target. Use `sm:` and `lg:` to enhance for larger screens.
2. All interactive elements: `min-h-[44px] min-w-[44px]`.
3. Active workout page: `height: 100dvh`, no outer scroll. Reps/weight inputs: `inputmode="numeric" pattern="[0-9]*"`.
4. `focus-visible:ring-2 focus-visible:ring-primary-500` on all interactive elements. Never global `outline: none`.
5. `role="dialog"` on all modals, `aria-label` on icon-only buttons, `aria-live="polite"` on `NotificationToast`.
6. All text passes WCAG AA contrast (4.5:1 body, 3:1 large text).
7. Custom scrollbar on every scrollable `<div>`:
```css
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-gray-300 rounded-full; }
```
   Add `.custom-scrollbar` to `tailwind.config.ts` as a plugin utility class.
8. `SkeletonBlock` shown on every first load. `EmptyState` never shown while `isLoading === true`.

---

## Phase 21 — Final Wiring Checklist

- [ ] All API services use `{entity}Api` naming, located in `src/services/`
- [ ] All pages in `src/pages/`, shared components in `src/components/`, page-specific in `src/pages/{page}/components/`
- [ ] `SelectClient`, `SelectExercise`, `SelectRoutine` all support search + selection
- [ ] `NotificationToast.vue` fires on every create / edit / delete success
- [ ] `ViewToggle` on Plans (list/kanban), Clients (list/kanban), Courses (list/kanban), Meetings (list/calendar), History (list/calendar)
- [ ] `ListSearchBar` with refresh button on every list page
- [ ] `PaginationBar` on every list with more than 20 items
- [ ] `EmptyState` never shown while loading
- [ ] Custom scrollbar class applied to every scrollable `<div>`
- [ ] All detail/edit views open in `BaseModal` (responsive dialog), not a new route
- [ ] `src/services/prompts.md` created with `GET /api/history` entry
- [ ] Auth0 callback URL registered in dashboard
- [ ] Bearer token attached to all API calls — test with expired token
- [ ] Invite flow: create client → copy code → `/invite/:code` → accept → status turns "active"
- [ ] `workoutStore` localStorage restore — kill tab mid-workout, reload, state resumes
- [ ] `completeRoutine` payload uses `excercises` (API spelling)
- [ ] Plans Kanban drag updates status via `PATCH /api/plans/{id}/status` + success toast
- [ ] Courses `price` serializes to `{ value: number, currency: string }` not a flat number
- [ ] App renders at 375px width with no horizontal scroll
- [ ] Exercise grid is 4 columns on `lg:`, 3 on `sm:`, 2 on mobile — matches `design/screen_1.png`
- [ ] Exercise cards have image/gradient overlay, `DifficultyBadge` top-left, muscle tags bottom-left
- [ ] "Load More Exercises" button works and resets when filters change
- [ ] `DifficultyBadge` correctly parses level from `exercise.tags`
- [ ] Dashboard two-column layout: main (2/3) + sidebar (1/3) on `lg:`
- [ ] `StatCard` delta badges render green for positive, red for negative
- [ ] `RecommendedWorkoutCard` dark card with gradient background renders correctly
- [ ] `ProgressRing` SVG animates on mount
- [ ] `DarkModeToggle` persists preference to localStorage, applies `dark` class to `<html>`
- [ ] Sidebar `bg-surface-dark`, active items `bg-primary/20 text-primary`
- [ ] `TodaysMealPlanCard` and calorie/heart-rate stats show placeholder (not blank/error) when API unavailable
- [ ] All new prompts.md entries are present and include testing instructions
