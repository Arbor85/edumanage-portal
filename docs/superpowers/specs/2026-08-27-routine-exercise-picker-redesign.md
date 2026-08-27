# Routine Exercise Picker Redesign

**Date:** 2026-08-27
**Status:** Approved

## Overview

Improve the routine creation experience with three focused enhancements:

1. **Favourite exercises** — two-tier system (direct + usage-based) floats preferred exercises to the top of the picker
2. **Multi-select picker** — select multiple exercises at once, with an option to group them into a superset immediately
3. **Muscle targeting sheet** — a button in the routine editor reveals which muscles the current routine covers

---

## 1. Backend changes

### 1.1 New entity: `UserExercisePreference`

Stored in `EduManage.Domain/Entities/UserExercisePreference.cs`:

```csharp
public class UserExercisePreference
{
    public string UserId { get; set; }       // from JWT sub claim
    public int ExerciseId { get; set; }
    public bool IsDirectFavourite { get; set; }
    public int UsageCount { get; set; }
}
```

Composite primary key: `(UserId, ExerciseId)`.

EF configuration in `EduManage.Infrastructure/Persistence/Configurations/UserExercisePreferenceConfiguration.cs`.

Repository interface: `IUserExercisePreferenceRepository` in `EduManage.Application/Contracts/`.

### 1.2 New endpoint: toggle direct favourite

```
POST /api/excercises/{id}/favourite
Authorization: Bearer <token>
```

- Upserts a `UserExercisePreference` row for the authenticated user + exercise.
- Toggles `IsDirectFavourite` (true → false → true).
- Returns `204 No Content`.
- MediatR command: `ToggleExerciseFavouriteCommand`.

### 1.3 Enriched `GET /api/excercises`

When the request carries a valid JWT, the handler joins exercise rows with `UserExercisePreference` for the authenticated user and appends two fields to each item in the response:

```json
{
  "isDirectFavourite": true,
  "usageCount": 7
}
```

Unauthenticated requests return `isDirectFavourite: false, usageCount: 0` for all exercises (no breaking change).

### 1.4 Usage tracking on routine save

In the `CreateRoutineHandler` and `UpdateRoutineHandler`:

- After persisting the routine, upsert a `UserExercisePreference` row for each exercise in the routine.
- Increment `UsageCount` by 1 per exercise per save (create or update).
- `IsDirectFavourite` is not touched by this path.

---

## 2. Frontend: `useExercisePicker` composable

**File:** `modern/src/composables/useExercisePicker.ts`

### 2.1 State

| Ref | Type | Purpose |
|-----|------|---------|
| `selectedIds` | `Ref<Set<number>>` | Currently ticked exercises |
| `searchQuery` | `Ref<string>` | Live search string |
| `muscleFilter` | `Ref<string[]>` | Active muscle chips |

### 2.2 Computed

| Name | Description |
|------|-------------|
| `sortedExercises` | Full list sorted: direct favourites → usage count desc → name asc |
| `filteredExercises` | `sortedExercises` narrowed by `searchQuery` and `muscleFilter` |
| `selectedExercises` | Full `ExcerciseOut` objects for IDs in `selectedIds` |
| `hasMultipleSelected` | `selectedIds.size >= 2` |

Sorting is purely client-side; the backend returns raw preference values.

### 2.3 Actions

| Action | Behaviour |
|--------|-----------|
| `toggleSelection(id)` | Add to `selectedIds` if absent, remove if present |
| `toggleDirectFavourite(id)` | Calls `exercisesApi.toggleFavourite(id)`, optimistically flips `isDirectFavourite` in the exercise store |
| `clearSelection()` | Empties `selectedIds` |
| `reset()` | Clears selection, search query, and muscle filter — called when the dialog closes |

The composable reads exercises from `useExerciseStore()` internally; no props needed.

---

## 3. Frontend: `ExercisePickerDialog` refactor

**File:** `modern/src/components/ExercisePickerDialog/index.vue`

The component becomes a thin template layer over `useExercisePicker()`.

### 3.1 Exercise row layout

```
[ ★ ] [ thumbnail ] [ name + muscle badge ]     [ ✓ ]
```

- **Star button** (left): `lucide-vue-next` `Star` icon, filled when `isDirectFavourite`. Tap calls `toggleDirectFavourite(id)` with `@click.stop` to avoid toggling row selection.
- **Row tap**: calls `toggleSelection(id)`. Selected rows show a subtle highlight background.
- **Checkmark** (right): visible when exercise is in `selectedIds`, hidden otherwise.

Favourite exercises appear at the top of the list, grouped visually with a thin divider labelled "Favourites" and "All exercises" below — only shown when at least one favourite exists.

### 3.2 Bottom action bar (sticky)

Always rendered at the bottom of the dialog:

```
  3 selected          [ Add as Superset ]  [ Add ]
```

- **Count label**: hidden when `selectedIds.size === 0`.
- **"Add as Superset"**: visible only when `hasMultipleSelected`. Uses secondary button style.
- **"Add"**: primary button, disabled when `selectedIds.size === 0`.

### 3.3 Emits

| Event | Payload | Trigger |
|-------|---------|---------|
| `add` | `ExcerciseOut[]` | "Add" clicked |
| `addAsSuperset` | `ExcerciseOut[]` | "Add as Superset" clicked |

Both handlers call `reset()` before closing the dialog.

### 3.4 API service addition

`modern/src/services/exercisesApi.ts`:

```typescript
toggleFavourite(id: number): Promise<void>
// POST /api/excercises/{id}/favourite
```

`ExcerciseOut` type gains two fields:

```typescript
isDirectFavourite: boolean
usageCount: number
```

---

## 4. Frontend: `RoutineFormModal` wiring

**File:** `modern/src/pages/RoutinesPage/components/RoutineFormModal.vue`

### 4.1 New picker emits

| Event | Handler behaviour |
|-------|-------------------|
| `@add` | Existing flow — append each exercise as an independent block |
| `@addAsSuperset` | Create one new `SupersetGroup` (auto-colour, auto-name from exercise names), assign all selected exercises to its ID, append them |

### 4.2 Muscle targeting button

A `Dumbbell` icon button (`lucide-vue-next`) placed in the modal header row, right of the routine name input.

- **Disabled** when `form.excercises.length === 0`.
- Tap opens a bottom sheet containing `MuscleDistributionDialog`.

### 4.3 Muscle aggregation (computed)

```
routineMuscles = {
  primary:   unique primaryMuscle values across all form.excercises,
  secondary: unique secondaryMuscles values, minus any already in primary
}
```

Passed as props to `MuscleDistributionDialog` inside the sheet. Recomputed reactively as exercises are added or removed.

---

## 5. File change summary

| File | Change type |
|------|-------------|
| `EduManage.Domain/Entities/UserExercisePreference.cs` | New |
| `EduManage.Infrastructure/Persistence/Configurations/UserExercisePreferenceConfiguration.cs` | New |
| `EduManage.Application/Contracts/IUserExercisePreferenceRepository.cs` | New |
| `EduManage.Infrastructure/Persistence/Repositories/UserExercisePreferenceRepository.cs` | New |
| `EduManage.Application/Features/Exercises/ToggleExerciseFavouriteCommand.cs` | New |
| `EduManage.Api/Controllers/ExercisesController.cs` | Modified — new toggle endpoint, enriched list |
| `EduManage.Application/Features/Routines/CreateRoutineHandler.cs` | Modified — usage tracking |
| `EduManage.Application/Features/Routines/UpdateRoutineHandler.cs` | Modified — usage tracking |
| `modern/src/composables/useExercisePicker.ts` | New |
| `modern/src/services/exercisesApi.ts` | Modified — `toggleFavourite()`, updated response type |
| `modern/src/types/index.ts` | Modified — `ExcerciseOut` gains `isDirectFavourite`, `usageCount` |
| `modern/src/components/ExercisePickerDialog/index.vue` | Modified — multi-select, star buttons, action bar |
| `modern/src/pages/RoutinesPage/components/RoutineFormModal.vue` | Modified — new emit handlers, muscle sheet button |
