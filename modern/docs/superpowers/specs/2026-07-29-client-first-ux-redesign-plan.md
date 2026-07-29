# Implementation Plan — Client-First UX Redesign
**Spec:** `2026-07-29-client-first-ux-redesign-design.md`  
**App:** `modern/` (Vue 3 + TypeScript + Vite + Pinia)

Phases are ordered by dependency. Each phase is independently shippable. Complete one phase fully before starting the next.

---

## Phase 1 — Design System Foundation
*No new features. Pure visual layer. Every subsequent phase builds on this.*

### 1.1 Tailwind color tokens
**File:** `modern/tailwind.config.ts`
- Replace existing color palette with the new dark-first tokens:
  - `surface: '#0D0F12'`, `surface-card: '#141720'`, `surface-elevated: '#1C2030'`, `surface-input: '#252A3A'`
  - `accent: '#FF6B35'` (new — add alongside existing `primary`)
  - `text-primary: '#FFFFFF'`, `text-secondary: '#8B92A5'`, `text-muted: '#4A5168'`
- Flip dark mode default: in `AppLayout.vue`, add `dark` class to `<html>` by default; `DarkModeToggle` removes it for light mode.

### 1.2 Base component animations
**Files:** `src/components/BaseButton.vue`, `src/components/BaseCard.vue`, `src/components/BaseModal.vue`
- `BaseButton.vue`: add `active:scale-[0.97] transition-transform duration-100` to root element
- `BaseCard.vue`: add `hover:-translate-y-0.5 hover:shadow-lg transition-all duration-150` to root element; update background to `bg-surface-card`
- `BaseModal.vue`: wrap content with Vue `<Transition>` using `enter-active-class="transition duration-200 ease-out"` / `enter-from-class="opacity-0 scale-95"`

### 1.3 Border radius & shadow unification
**Files:** `src/components/Base*.vue` (all base components)
- Cards: `rounded-2xl`
- Buttons: `rounded-xl`
- Inputs: `rounded-lg`
- Badges: `rounded-full`
- Add glow shadow utility to `tailwind.config.ts` plugin: `shadow-glow: '0 0 20px rgba(0, 200, 150, 0.15)'`

### 1.4 Page transition wrapper
**File:** `src/components/layout/AppLayout.vue`
- Wrap `<RouterView>` with `<Transition name="page">` 
- Add CSS in `src/assets/main.css`:
  ```css
  .page-enter-active, .page-leave-active { transition: opacity 200ms ease, transform 200ms ease; }
  .page-enter-from { opacity: 0; transform: translateY(8px); }
  .page-leave-to { opacity: 0; transform: translateY(-8px); }
  ```

### 1.5 Remove TopNav, add inline headers
**Files:** `src/components/layout/AppLayout.vue`, `src/components/layout/TopNav.vue`, all page files
- Remove `<TopNav />` from `AppLayout.vue`
- Delete `TopNav.vue` (or keep but stop rendering it)
- Each existing page already uses `<PageHeader>` — update `PageHeader.vue` to render a large bold inline header (`text-2xl font-bold`) instead of relying on TopNav for title display

### 1.6 SkeletonLoader component
**File:** `src/components/SkeletonLoader.vue` (new)
- Props: `width`, `height`, `rounded` (default `rounded-lg`)
- Renders a `bg-surface-input animate-pulse` block
- Usage: replace spinner-only loading states with skeleton rows in lists

**Deliverable:** All existing pages look dark, bold, consistent. No new features yet.

---

## Phase 2 — Navigation Restructure
*Rewires routing and nav. Existing pages stay but move to new routes.*

### 2.1 Role detection in authStore
**File:** `src/stores/authStore.ts`
- Read `user.value?.['https://edumanage.app/roles']` after Auth0 login
- Add `isTrainer: ComputedRef<boolean>` — true if roles array includes `'trainer'`
- Note: Auth0 custom Action (outside codebase) must add this claim — document in `src/services/prompts_ux-redesign.md`

### 2.2 Router update
**File:** `src/router/index.ts`
- Add new client routes: `/` (TodayPage), `/train` (TrainPage), `/progress` (ProgressPage), `/explore` (ExplorePage)
- Add `/onboarding` route (no `requiresAuth` redirect loop — check separately)
- Add coach routes: `/coach/clients`, `/coach/plans`, `/coach/meetings`, `/coach/courses`, `/coach/equipment` — all with `meta: { requiresTrainer: true }`
- Add route guard for `requiresTrainer`: redirect to `/` if `!authStore.isTrainer`
- Keep old routes as redirects temporarily: `/dashboard → /`, `/exercises → /explore`, `/routines → /train`, `/history → /progress`, `/clients → /coach/clients`, etc.
- Keep `/active-workout` unchanged

### 2.3 SideBar rebuild
**File:** `src/components/layout/SideBar.vue`
- Replace existing nav items with the 5 client items (Today, Train, Progress, Explore, Profile)
- Below a `<hr class="border-surface-input my-4">` divider, render Coach section items conditionally: `v-if="authStore.isTrainer"`
- Coach section items: Clients, Plans, Meetings, Courses, Equipment (routes prefixed `/coach/`)
- Add "COACH" category label above the divider items (`text-xs font-bold tracking-widest uppercase text-text-muted`)

### 2.4 BottomNav rebuild
**File:** `src/components/layout/BottomNav.vue`
- Replace existing items with same 5 client nav items
- Remove the active workout FAB from BottomNav (replaced by ActiveWorkoutPill in Phase 5)

### 2.5 ActiveWorkoutPill component
**File:** `src/components/ActiveWorkoutPill.vue` (new)
- Renders only when `workoutStore.activeWorkout !== null`
- Floating pill positioned `fixed bottom-20 left-1/2 -translate-x-1/2` (above bottom nav on mobile)
- Content: green pulsing dot + truncated exercise name + elapsed time
- `@click` navigates to `/active-workout`
- Add to `AppLayout.vue` outside the main content area

**Deliverable:** App navigates correctly. Trainer accounts see Coach section. Client accounts see clean 5-item nav.

---

## Phase 3 — Onboarding Flow
*First-run experience. Gate on `userProfile.onboardingComplete`.*

### 3.1 Backend prompt file
**File:** `src/services/prompts_ux-redesign.md` (new)
- Document all required new endpoints with full request/response schemas (see spec Section 7)
- Include: `/api/users/profile` GET+PATCH, `/api/challenges/today` GET, `/api/challenges/log` POST, `/api/notifications/nudge` POST, `/api/progress/overview` GET, `/api/exercises/:id/records` GET
- Include Auth0 Action requirement for roles claim

### 3.2 User profile service & store
**File:** `src/services/userProfileService.ts` (new), `src/stores/authStore.ts` (update)
- `userProfileService.ts`: `getProfile()`, `updateProfile(data)` — calls `/api/users/profile`
- Add `userProfile` ref and `onboardingComplete` computed to `authStore`
- Fetch profile after successful Auth0 login

### 3.3 OnboardingLayout
**File:** `src/components/layout/OnboardingLayout.vue` (new)
- Full-screen dark layout, no sidebar/nav
- Progress dots at top (4 dots, filled based on current step prop)
- Large centered slot for question content
- Back/Next buttons at bottom

### 3.4 OnboardingPage
**File:** `src/pages/OnboardingPage.vue` (new)
- 4-step wizard using `OnboardingLayout.vue`
- Local state: `currentStep (1–4)`, `answers: { goal, experience, equipment[], reminderTime }`
- Step components as inline sections (not separate files — simple enough)
- On finish: call `userProfileService.updateProfile({ ...answers, onboardingComplete: true })`, then `router.push('/')`

### 3.5 Onboarding gate
**File:** `src/router/index.ts`
- In `beforeEach` guard: after auth check, if `!authStore.onboardingComplete && route.name !== 'onboarding'`, redirect to `/onboarding`

**Deliverable:** New users are guided through onboarding before reaching Today page.

---

## Phase 4 — Today Page
*Replaces DashboardPage. The emotional heart of the app.*

### 4.1 Workout suggestion composable
**File:** `src/composables/useWorkoutSuggestion.ts` (new)
- Input: user's onboarding data (goal, equipment), last workout's primary muscle group
- Logic: filter `routineStore.routines` by equipment match; exclude muscle groups trained in last session; return one suggestion
- Returns `suggestedRoutine: ComputedRef<Routine | null>`

### 4.2 DailyChallengeCard component
**File:** `src/components/DailyChallengeCard.vue` (new)
- Fetches today's challenge from `challengeStore` (which calls `/api/challenges/today`)
- Displays: challenge description, type icon, `Mark Done` button
- On `Mark Done`: call `challengeStore.logChallenge()` → card animates fill (CSS transition on background) → checkmark icon fades in → `canvas-confetti` burst
- Install `canvas-confetti`: `npm install canvas-confetti` + `npm install -D @types/canvas-confetti`

### 4.3 challengeStore
**File:** `src/stores/challengeStore.ts` (new)
- State: `todayChallenge`, `completedToday: boolean`
- `fetchTodayChallenge()`: GET `/api/challenges/today`
- `logChallenge()`: POST `/api/challenges/log`, sets `completedToday = true`

### 4.4 EffortSnapshotCard component
**File:** `src/components/EffortSnapshotCard.vue` (new)
- Props: `label: string`, `value: number`, `unit: string`, `linkTo: string`
- Renders a stat card with animated count-up on mount (uses `useCountUp` composable)
- `@click` navigates to `linkTo`

### 4.5 useCountUp composable
**File:** `src/composables/useCountUp.ts` (new)
- `useCountUp(target: Ref<number>, duration = 600)` 
- Returns `displayValue: Ref<number>` that animates from 0 to `target` using `requestAnimationFrame`
- Triggers on `IntersectionObserver` entry (uses `useIntersectionReveal`)

### 4.6 useIntersectionReveal composable
**File:** `src/composables/useIntersectionReveal.ts` (new)
- `useIntersectionReveal(el: Ref<HTMLElement | null>)`
- Returns `isVisible: Ref<boolean>` — set true once element enters viewport
- Uses `IntersectionObserver`, disconnects after first trigger

### 4.7 TodayPage
**File:** `src/pages/TodayPage.vue` (new)
- Fetch on mount: `challengeStore.fetchTodayChallenge()`, `planStore` (for assigned workout), `workoutStore` (for history stats)
- Hero zone: 
  - If trainer plan has today's workout → `WorkoutHeroCard` (workout name `text-5xl font-black`, duration, muscle pills, `Start Workout` button)
  - Else → `useWorkoutSuggestion` result
  - Else → empty state with "Start your first workout"
- Daily Challenge zone: `<DailyChallengeCard />`
- Effort Snapshot zone: three `<EffortSnapshotCard />` components in a row
- Skeleton loader shown for each zone while data fetches

### 4.8 Register route
**File:** `src/router/index.ts`
- `{ path: '/', name: 'today', component: () => import('@/pages/TodayPage.vue'), meta: { requiresAuth: true } }`
- Remove `/dashboard` → `TodayPage` mapping (redirect `/dashboard` → `/` instead)

**Deliverable:** Clients land on Today page with workout suggestion, daily challenge, and effort stats.

---

## Phase 5 — Active Workout Redesign
*Biggest UX improvement. Keep existing store logic, replace the template entirely.*

### 5.1 BottomSheetPicker component
**File:** `src/components/BottomSheetPicker.vue` (new)
- Triggered by tapping a weight or reps value in a set row
- Renders as a fixed bottom panel (not a modal/route) with `translate-y` slide-up animation
- Number scroll wheel (or large +/- buttons) for value selection
- Emits `update:modelValue` on confirm, closes on backdrop tap

### 5.2 RestTimerOverlay component
**File:** `src/components/RestTimerOverlay.vue` (new)
- Full-screen dark overlay (`fixed inset-0 bg-surface z-50`)
- Large countdown number (`text-8xl font-black tabular-nums`)
- Circular SVG progress ring (stroke-dashoffset animates per second)
- `Skip` button at bottom
- Props: `duration: number` (seconds). Emits `done`, `skip`
- Auto-triggers in `ActiveWorkoutPage` after a set is marked complete

### 5.3 MuscleDiagram component
**File:** `src/components/MuscleDiagram.vue` (new)
- SVG body diagram (front/back toggle)
- Props: `primaryMuscle: string`, `secondaryMuscles: string[]`
- Maps muscle names to SVG path IDs, applies `fill: primary` / `fill: accent` colors
- Uses a static SVG asset in `src/assets/muscle-diagram.svg` with named paths per muscle group

### 5.4 WorkoutCompleteView component
**File:** `src/components/WorkoutCompleteView.vue` (new)
- Full-screen view (not a modal) rendered inside `ActiveWorkoutPage` when workout is finished
- Sections: stats (duration, volume, sets), `BodySilhouette` with trained muscles, notes textarea, Share button, Done button
- `Share` button: renders a hidden `WorkoutShareCard` div, calls `html2canvas` on it, triggers download/share
- Install: `npm install html2canvas`
- `Done` button: saves workout via `workoutStore.completeWorkout()`, navigates to `/progress`

### 5.5 WorkoutShareCard component
**File:** `src/components/WorkoutShareCard.vue` (new)
- Visually styled card (fixed dimensions `600×315px`) for `html2canvas` capture
- Content: app logo, workout name, date, duration, volume, tagline
- Hidden off-screen when not being captured (`sr-only` or `absolute -left-[9999px]`)

### 5.6 ActiveWorkoutPage template rewrite
**File:** `src/pages/ActiveWorkoutPage.vue`
- Keep all existing script/store logic unchanged
- Replace `<template>` entirely:
  - Use `ActiveWorkoutLayout.vue` (new — full-screen, no sidebar slots)
  - Header bar: X button + workout name + elapsed timer
  - Exercise hero: `text-5xl font-black` name + `MuscleDiagram`
  - Set list: large rows, tapping weight/reps opens `BottomSheetPicker`
  - Set completion: add CSS pulse animation class on confirm
  - PR indicator: show `<Zap>` icon in `#FF6B35` when current set beats stored PR
  - After set complete: show `RestTimerOverlay` with configured duration
  - Exercise queue: horizontal scroll strip at bottom
  - Conditionally render `WorkoutCompleteView` when `workoutStore.isComplete`

### 5.7 ActiveWorkoutLayout
**File:** `src/components/layout/ActiveWorkoutLayout.vue` (new)
- Full-screen layout with no sidebar, no bottom nav, no top nav
- Used only by `ActiveWorkoutPage`
- `AppLayout.vue`: detect active workout route, render `ActiveWorkoutLayout` instead of main layout

**Deliverable:** Workout experience feels immersive and satisfying. Set completion, rest timer, and finish screen all animated.

---

## Phase 6 — Progress Page
*Replaces HistoryPage with data visualization.*

### 6.1 Install charting library
- `npm install chart.js vue-chartjs`
- Creates wrapper components for Chart.js charts in Vue 3

### 6.2 progressStore
**File:** `src/stores/progressStore.ts` (new)
- State: `weeklyVolume: { week: string, volume: number }[]`, `personalRecords: PR[]`, `heatmapData: { date: string, intensity: number }[]`
- `fetchOverview()`: GET `/api/progress/overview`
- `fetchRecords()`: GET `/api/exercises/:id/records` (called per exercise, cached)

### 6.3 VolumeChart component
**File:** `src/components/VolumeChart.vue` (new)
- Wraps Chart.js area chart via `vue-chartjs`
- Props: `data: { week: string, volume: number }[]`
- Dark theme: `backgroundColor: 'rgba(0,200,150,0.15)'`, `borderColor: '#00C896'`
- Animates on mount (Chart.js built-in animation)

### 6.4 TrainingHeatmap component
**File:** `src/components/TrainingHeatmap.vue` (new)
- 12-week grid of day cells (84 cells)
- Cell color: `bg-surface-input` (rest day) → green gradient based on `intensity` (0–3)
- Label: "Your training pattern" (never "streak")
- Props: `data: { date: string, intensity: number }[]`

### 6.5 BodySilhouette component
**File:** `src/components/BodySilhouette.vue` (new)
- Static SVG silhouette with muscle group regions
- Props: `muscleFrequency: Record<string, number>` (muscle name → times trained this month)
- Maps frequency to opacity/color intensity on SVG paths
- Reused on both ProgressPage (monthly view) and WorkoutCompleteView (today's muscles)

### 6.6 PRList component
**File:** `src/components/PRList.vue` (new)
- Props: `records: PR[]`
- Each row: exercise name, PR value (weight×reps or time/distance), date, delta from starting PR
- Sorted by most recently set

### 6.7 ProgressPage
**File:** `src/pages/ProgressPage.vue` (new)
- Three tabs: Overview | Records | History
- **Overview tab:** `VolumeChart` + `BodySilhouette` + `TrainingHeatmap` — fetch from `progressStore`
- **Records tab:** `PRList` — fetch all-time PRs
- **History tab:** existing history list from `workoutStore`, restyled with dark cards

### 6.8 Register route
**File:** `src/router/index.ts`
- `{ path: '/progress', name: 'progress', component: ProgressPage }`
- Redirect `/history` → `/progress`

**Deliverable:** Clients can see cumulative effort, PRs, and training patterns visualized.

---

## Phase 7 — Train & Explore Pages
*Reframe existing pages with new names and client-first content.*

### 7.1 TrainPage
**File:** `src/pages/TrainPage.vue` (new)
- Two tabs: **My Routines** | **Active Plan**
- **My Routines**: existing `RoutinesPage` content (routine list, search, start button) — restyled
- **Active Plan**: fetch current assigned plan from `planStore`; render week view with each workout as a row; today highlighted in primary green
- Register: `{ path: '/train', name: 'train', component: TrainPage }`, redirect `/routines` → `/train`

### 7.2 ExplorePage
**File:** `src/pages/ExplorePage.vue` (new)
- Existing `ExercisesPage` content with two additions:
  1. Equipment filter (pill buttons, pre-populated from `authStore.userProfile.equipment`)
  2. Exercise card shows larger image/illustration area
- Register: `{ path: '/explore', name: 'explore', component: ExplorePage }`, redirect `/exercises` → `/explore`

**Deliverable:** Client nav is complete — all 5 destinations work.

---

## Phase 8 — Trainer Coach Section
*Unlock trainer features behind role gate.*

### 8.1 NudgeButton component
**File:** `src/components/NudgeButton.vue` (new)
- Single icon button (`<Bell>` icon from lucide-vue-next)
- `@click`: POST `/api/notifications/nudge` with `clientId`
- Loading state during request, disabled for 24h after sending (store last nudge time in localStorage per clientId)
- Shows tooltip "Cheer on your client" on hover

### 8.2 ClientDetailPage
**File:** `src/pages/coach/ClientDetailPage.vue` (new)
- Route: `/coach/clients/:id`
- Sections:
  - Header: client name, engagement ring border color, last active date
  - Plan progress: progress bar showing % of plan workouts completed
  - Recent workouts: last 4 as compact cards (date, name, volume)
  - PRs this month: count badge + expandable list
  - Training heatmap: `<TrainingHeatmap>` component (reused from Phase 6)
  - Quick actions row: Assign Plan button, Schedule Meeting button, Leave Note button
- Fetch data: extend `clientStore` with `fetchClientDetail(id)` action

### 8.3 ClientsPage updates
**File:** `src/pages/ClientsPage.vue`
- Add `<NudgeButton :clientId="client.id" />` to each client card
- Add engagement ring: `border-2` with dynamic color class based on `client.lastActiveDate`
- Add `lastActiveDays` computed per client (days since last workout)
- Default view: Kanban (already exists)

### 8.4 Coach routes
**File:** `src/router/index.ts`
- Register all `/coach/*` routes with `meta: { requiresAuth: true, requiresTrainer: true }`
- `requiresTrainer` guard: `if (!authStore.isTrainer) return { path: '/' }`

**Deliverable:** Trainers have a functional Coach section. Client detail is a full page with engagement data.

---

## Phase 9 — Backend Prompt File & Animations Polish
*Wrap up: backend docs, remaining animations, final polish.*

### 9.1 Backend prompts file
**File:** `src/services/prompts_ux-redesign.md` (finalize — started in Phase 3)
- Full spec for each new endpoint: URL, method, auth requirements, request body schema, response schema, example
- Auth0 Action spec: how to add roles claim

### 9.2 Remaining animations
- `useCountUp` applied to all stat displays on ProgressPage and TodayPage
- `useIntersectionReveal` applied to chart and heatmap sections (animate in on scroll)
- PR bolt pulse: CSS `@keyframes` pulse in `main.css`, applied via class toggle in set rows
- Challenge completion: verify `canvas-confetti` burst looks good, tune particle count
- Skeleton loaders: replace all `<BaseSpinner>` loading states with `<SkeletonLoader>` where layout is known

### 9.3 `prefers-reduced-motion` guard
**File:** `src/assets/main.css`
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 9.4 Final QA checklist
- All 5 client nav routes work and load correctly
- Coach section hidden for client-only accounts
- Onboarding shows once and never again after completion
- Active workout pill appears when workout is in progress
- Rest timer auto-starts after set completion
- Workout finish screen shows and saves correctly
- Progress page loads charts without error
- Dark mode is default; light mode toggle still works
- All new components have skeleton loading states
- `npm run build` passes with no TypeScript errors

---

## Dependency Order Summary

```
Phase 1 (Design System) 
  → Phase 2 (Navigation)
      → Phase 3 (Onboarding)
      → Phase 4 (Today Page)       ← needs Phase 3 gate
      → Phase 5 (Active Workout)   ← independent of 3/4
      → Phase 6 (Progress)         ← independent of 3/4
      → Phase 7 (Train/Explore)    ← independent of 3/4
      → Phase 8 (Coach Section)    ← needs Phase 6 (heatmap component)
          → Phase 9 (Polish)
```

Phases 3–7 can be worked in parallel after Phase 2 is complete. Phase 8 depends on Phase 6 only for the `TrainingHeatmap` component — that component can be built in Phase 6 and imported in Phase 8.

---

## Package Dependencies to Install

```bash
npm install canvas-confetti chart.js vue-chartjs html2canvas
npm install -D @types/canvas-confetti
```
