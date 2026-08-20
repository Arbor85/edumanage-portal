# Mobile App Design

**Date:** 2026-08-20

## Problem

The web app (`modern/`) is desktop-first. Clients need to track workouts at the gym on their phone — the active workout experience (set-by-set tracking, rest timer, superset handling) is the core reason for a mobile app. Trainers need read-only access to client progress on mobile.

## Approach

Expo + React Native with Expo Router. Native feel for the workout experience. Shares API contracts and domain knowledge with the web app but is an independent project in `mobile/`.

---

## Section 1: Tech Stack

| Concern | Choice | Reason |
|---------|--------|--------|
| Framework | Expo SDK 52 + Expo Router | File-based routing, managed workflow, OTA updates |
| Language | TypeScript | Matches web app |
| Auth | react-native-auth0 | Native Auth0 browser flow, secure token storage |
| Token storage | expo-secure-store | Used by react-native-auth0 internally |
| API | Axios | Same pattern as modern/ |
| Server state | TanStack Query (React Query) | Caching, loading/error states for API calls |
| Local state | Zustand | Active workout state survives screen navigation |
| Styling | NativeWind (Tailwind for RN) | Same utility vocabulary as web app |
| Icons | lucide-react-native | Matches web app icon library |

---

## Section 2: Navigation Structure

```
mobile/
  app/
    _layout.tsx              ← root layout, Auth0 provider, QueryClient
    (auth)/
      _layout.tsx
      index.tsx              ← Login screen
    (tabs)/
      _layout.tsx            ← bottom tab bar (Today, Train, Progress, Profile)
      index.tsx              ← Today tab
      train.tsx              ← Routines list
      progress.tsx           ← Progress overview
      profile.tsx            ← Profile + logout
    workout/
      [id].tsx               ← Active workout (full-screen, no tab bar)
    coach/
      _layout.tsx
      index.tsx              ← Client list (trainer only)
      [clientId].tsx         ← Client progress view
  src/
    api/
      apiClient.ts           ← Axios instance with Auth0 token injection
      routinesApi.ts
      exercisesApi.ts
      workoutApi.ts
      clientsApi.ts
      progressApi.ts
    stores/
      workoutStore.ts        ← Zustand: active workout state
    types/
      routine.ts
      exercise.ts
      workout.ts
      client.ts
    components/
      SetRow.tsx
      RestTimerOverlay.tsx
      WorkoutCompleteView.tsx
      SupersetBadge.tsx
      ProgressRing.tsx
      ExerciseCard.tsx
```

---

## Section 3: Screen Inventory (V1)

### Client screens

| Screen | File | Description |
|--------|------|-------------|
| Login | `(auth)/index.tsx` | Auth0 login button, brand splash |
| Today | `(tabs)/index.tsx` | Suggested workout card, quick-start button |
| Routines list | `(tabs)/train.tsx` | Scrollable list of routines, search, tap to preview |
| Active workout | `workout/[id].tsx` | Full-screen set tracker, rest timer, superset groups, complete button |
| Workout complete | inline in workout | Summary card with stats, confetti, share |
| Progress | `(tabs)/progress.tsx` | Weekly volume, activity heatmap, PRs |
| Profile | `(tabs)/profile.tsx` | User info, logout |

### Trainer screens

| Screen | File | Description |
|--------|------|-------------|
| Client list | `coach/index.tsx` | List of clients (visible only to trainers) |
| Client progress | `coach/[clientId].tsx` | Progress charts for selected client |

---

## Section 4: Active Workout — Core Flow

The active workout is the primary value. It must work identically to the web app's `ActiveWorkoutPage.vue`:

1. User taps a routine → navigate to `/workout/[routineId]`
2. `workoutStore` (Zustand) initializes from the routine: calls `computeSteps()` identical to the web — produces `normal-set`, `superset-round`, `drop-set` steps in order
3. Screen shows current step: exercise name, set number, target reps/weight
4. User taps "Done" → marks step complete, advances to next, triggers rest timer
5. Rest timer: overlay with countdown, "Skip" button; uses `setInterval` (stays alive while screen is active)
6. Superset rounds show all exercises in the group stacked; user completes each in sequence
7. Drop sets automatically reduce weight by `dropConfig.weightDecreasePercent` between sets
8. Final step → workout complete view, POSTs to `/api/routines/complete`

**Persistence:** Zustand store is kept in memory during the workout. If the app is backgrounded and killed, the in-progress workout is lost (acceptable for V1 — same limitation as web app).

---

## Section 5: Auth Flow

1. App loads → check Auth0 for existing session
2. No session → redirect to `(auth)/index`
3. Login screen → Auth0 `authorize()` opens system browser (required by Auth0)
4. Auth0 redirects back via deep link → `react-native-auth0` exchanges code → stores tokens in `expo-secure-store`
5. `apiClient.ts` reads token from store and injects `Authorization: Bearer <token>` header
6. Trainer role checked via `https://edumanage.app/roles` claim — same as web app
7. Trainers see a "Coach" tab in the tab bar; clients do not

---

## Section 6: API Layer

`src/api/apiClient.ts` — Axios instance. Token retrieved via `react-native-auth0`'s credential manager on each request (handles refresh automatically).

API modules mirror `modern/src/services/`:
- `routinesApi.ts` — GET /api/routines, GET /api/routines/:id
- `workoutApi.ts` — POST /api/routines/complete
- `progressApi.ts` — GET /api/progress (weekly, heatmap, PRs)
- `clientsApi.ts` — GET /api/clients, GET /api/clients/:id/progress (trainer only)

Base URL from `expo-constants` / `app.config.ts` extra fields (not hardcoded).

---

## Section 7: Styling

NativeWind with the same color tokens as the web app (dark background, accent colors). All components use Tailwind utility classes. Dark mode only for V1 (matches web app dark theme).

---

## What Is Not in V1

- Offline support / caching workouts for no-internet gym sessions
- Push notifications / rest timer alerts when app is backgrounded
- Routine creation/editing on mobile (web-only for now)
- Plan management on mobile (trainer web feature)
- Meeting/course/equipment management
- Exercise library browser (web-only for now)
- Onboarding wizard (assume users onboard on web first)
