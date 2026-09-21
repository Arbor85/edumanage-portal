# Gym Profile — Design Spec

**Date:** 2026-09-21  
**Status:** Approved

---

## Overview

Add a personal records (PR) system for exercises. Users store their best set (weight × reps, or duration/distance for cardio) per exercise. A new "Gym Profile" page lets users manage these records. The routine builder surfaces relevant PRs inline. At workout completion, the app detects beaten PRs and prompts the user to update them one at a time.

---

## Data Model

### New entity: `UserExerciseMax`

Composite PK: `(UserId, ExerciseId)`

| Field | Type | Notes |
|-------|------|-------|
| UserId | string | Auth0 user ID |
| ExerciseId | int | FK to Exercise |
| Exercise | Exercise | Navigation property |
| MaxWeight | float? | kg; null for non-weighted exercises |
| MaxReps | int? | null for time/distance exercises |
| MaxDuration | float? | seconds; for `time` activity track type |
| MaxDistance | float? | meters; for `distance` activity track type |
| Note | string? | e.g. "Updated based on 21 Sep 2026 workout" |
| UpdatedAt | DateTime | Last update timestamp |

Which fields are relevant depends on `Exercise.ActivityTrackType`:
- `repetitions` → MaxWeight + MaxReps (weighted/machine), or MaxReps only (bodyweight)
- `time` → MaxDuration
- `distance` → MaxDistance

---

## Backend

### Layer additions (following Clean Architecture convention)

**Domain:** `EduManage.Domain/Entities/UserExerciseMax.cs`

**Application:**
- `EduManage.Application/Contracts/IUserExerciseMaxRepository.cs`  
  Methods: `GetByUserIdAsync`, `GetByUserAndExerciseAsync`, `UpsertAsync`, `DeleteAsync`
- `EduManage.Application/Contracts/Dtos.cs` — append:
  - `record UserExerciseMaxOut(string UserId, int ExerciseId, string ExerciseName, string ActivityTrackType, string? PrimaryMuscle, float? MaxWeight, int? MaxReps, float? MaxDuration, float? MaxDistance, string? Note, DateTime UpdatedAt)`
  - `record UserExerciseMaxUpsert(float? MaxWeight, int? MaxReps, float? MaxDuration, float? MaxDistance, string? Note)`
- MediatR features in `EduManage.Application/Features/GymProfile/`:
  - `GetGymProfileQuery` — returns `IEnumerable<UserExerciseMaxOut>` for current user
  - `GetClientGymProfileQuery` — returns same for a specified `clientUserId` (trainer use)
  - `UpsertUserExerciseMaxCommand` — creates or updates a record
  - `DeleteUserExerciseMaxCommand` — removes a record

**Infrastructure:**
- `EduManage.Infrastructure/Persistence/Configurations/UserExerciseMaxConfiguration.cs` — composite PK, FK to Exercise
- `EduManage.Infrastructure/Persistence/Repositories/UserExerciseMaxRepository.cs`

**API:**
- `EduManage.Api/Controllers/GymProfileController.cs`

```
GET    /api/gym-profile                      → current user's maxes (auth required)
PUT    /api/gym-profile/{exerciseId}         → upsert max for exercise (auth required)
DELETE /api/gym-profile/{exerciseId}         → remove max (auth required)
GET    /api/gym-profile/client/{userId}      → trainer reads a client's maxes (auth required)
```

Controllers are thin — delegate all logic to MediatR. `userId` extracted from JWT claims, not from request body.

---

## Frontend (modern/)

### New files

| Path | Purpose |
|------|---------|
| `src/services/gymProfileApi.ts` | API calls: list, upsert, delete, getForClient |
| `src/stores/gymProfileStore.ts` | Pinia store; fetches once, cached in memory |
| `src/pages/GymProfilePage.vue` | User-facing gym profile page |
| `src/pages/GymProfilePage/components/ExerciseMaxCard.vue` | One card per max entry |
| `src/pages/GymProfilePage/components/ExerciseMaxFormModal.vue` | Add/edit modal |
| `src/components/ExerciseMaxBadge.vue` | Inline PR badge for routine builder |
| `src/components/PrUpdateDialog.vue` | Post-workout PR update prompt |

### Types (append to `src/types/index.ts`)

```typescript
interface UserExerciseMax {
  userId: string
  exerciseId: number
  exerciseName: string
  activityTrackType: ActivityTrackType
  primaryMuscle?: string
  maxWeight?: number
  maxReps?: number
  maxDuration?: number
  maxDistance?: number
  note?: string
  updatedAt: string
}

interface UserExerciseMaxUpsert {
  maxWeight?: number
  maxReps?: number
  maxDuration?: number
  maxDistance?: number
  note?: string
}
```

### `gymProfileStore`

```typescript
// state
maxes: UserExerciseMax[]
isLoading: boolean

// actions
fetch(): Promise<void>           // no-op if already loaded
fetchForClient(userId): Promise<UserExerciseMax[]>  // trainer use, not cached
upsert(exerciseId, data): Promise<void>
remove(exerciseId): Promise<void>

// getter
getByExerciseId(id: number): UserExerciseMax | undefined
```

### Gym Profile page (`GymProfilePage.vue`)

- Props: `readonly?: boolean`, `userId?: string` (for trainer view)
- List view with text search across exercise names
- Empty state when no maxes recorded
- Each `ExerciseMaxCard` shows: exercise name, primary muscle, formatted max values, note, "Updated: {date}"
- Add button → exercise picker → `ExerciseMaxFormModal` with fields scoped to exercise's `activityTrackType`
- Edit/delete controls hidden when `readonly = true`
- Trainer route: `/gym-profile/client/:userId` — same component, `readonly` prop set, fetches via `fetchForClient`
- Added to navigation menu (user-facing entry; trainer accesses via client detail)

### `ExerciseMaxFormModal`

- Fields shown based on `activityTrackType`:
  - `repetitions` + weighted/machine: Weight (kg) + Reps
  - `repetitions` + bodyweight: Reps only
  - `time`: Duration (mm:ss input)
  - `distance`: Distance (km/m toggle)
- Note field (optional, free text)
- Validates at least one value is provided before saving

### `ExerciseMaxBadge` (routine builder integration)

- Props: `exerciseId: number`
- Reads from `gymProfileStore.getByExerciseId(exerciseId)`
- Renders nothing if no max stored or `exerciseId` is null (free-text exercise)
- Formatted display:
  - Weighted/machine: `PR: 100 kg × 3`
  - Bodyweight: `PR: 15 reps`
  - Time: `PR: 2:30`
  - Distance: `PR: 5 km`
- Tooltip (hover desktop / tap mobile via Floating UI):
  - Full values, note text, "Updated: 12 Sep 2026"
  - Estimated 1RM for weighted: `~115 kg 1RM`
- Placed beneath each exercise name row in `RoutineFormModal.vue`
- `gymProfileStore.fetch()` called when `RoutineFormModal` opens (no-op if cached)

---

## PR Detection at Workout Completion

**Where:** Inside `workoutStore.finish()`, after the user confirms finishing, before navigating to `WorkoutCompleteView`.

### Algorithm

For each completed exercise with an `exerciseId`:

| ActivityTrackType | Comparison metric | Formula |
|-------------------|-------------------|---------|
| `repetitions` (weighted/machine) | Epley 1RM | `weight × (1 + reps / 30)` |
| `repetitions` (bodyweight, weight = 0) | Max reps | direct comparison |
| `time` | Max duration | direct comparison |
| `distance` | Max distance | direct comparison |

Steps:
1. Find the best completed set per exercise using the metric above
2. Retrieve stored max via `gymProfileStore.getByExerciseId(exerciseId)`
3. If computed metric > stored metric (or no record exists): mark as PR candidate
4. Only `completed = true` sets count; skipped exercises are excluded

### `PrUpdateDialog`

- Displayed sequentially, one dialog per PR candidate
- Shows: exercise name, old max (formatted), new max (formatted), estimated 1RM delta for weighted
- Buttons: "Update PR" / "Skip"
- On confirm: calls `gymProfileStore.upsert(exerciseId, { ...newValues, note: "Updated based on {DD MMM YYYY} workout" })`
- After all dialogs resolved: proceed to `WorkoutCompleteView`

---

## Navigation

- Add "Gym Profile" to the main nav (user-facing)
- Trainer accesses client gym profiles via the existing client detail area (new "Gym Profile" tab or link)

---

## Out of Scope

- Historical PR tracking (only the current best is stored, not a timeline)
- PR badges in workout history view
- Mobile app (Expo) — frontend changes are `modern/` only
- Offline/Dexie sync for gym profile data
