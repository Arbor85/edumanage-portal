# Superset Improvements Design

**Date:** 2026-08-05

## Problem

Three related issues with superset support:

1. **Routine editor** — when exactly one superset already exists, tapping "Add to superset" auto-joins it with no option to create a second. Multiple supersets are therefore impossible in practice.
2. **Active workout** — superset exercises do not display together during training. Root cause: the backend never persisted superset data, so exercises always return with `supersetGroupId: null`, and `computeSteps()` generates only `normal-set` steps.
3. **Backend** — `RoutineExcercise` DTO and entity have no fields for `supersetGroupId`, `dropConfig`, or `supersetGroups`, so all superset and drop-set data is silently dropped on save.

## Approach

Option A: JSON field on `Routine` for group metadata, plain column on `RoutineExercise` for `SupersetGroupId` and `DropConfigJson`. Consistent with existing `ValueConverter` usage for `Muscles`, `Tags`, etc. No new tables.

---

## Section 1: Backend

### 1a. Entities

**`RoutineExercise`** — add two properties:
```csharp
public string? SupersetGroupId { get; set; }
public string? DropConfigJson { get; set; }   // serialized DropConfig, null if not a drop set
```

**`Routine`** — add one property:
```csharp
public string SupersetGroupsJson { get; set; } = "[]";  // serialized List<SupersetGroupDto>
```

### 1b. DTOs (`Dtos.cs`)

New records:
```csharp
public sealed record SupersetGroup(string Id, string? Name, string Color);
public sealed record DropConfig(int Count, double WeightDecreasePercent);
```

Updated `RoutineExcercise` DTO — add two fields:
```csharp
public sealed record RoutineExcercise(
    string Name,
    ActivityType ActivityType,
    ActivityTrackType ActivityTrackType,
    IReadOnlyList<RoutineSet> Sets,
    string? SupersetGroupId,       // new
    DropConfig? DropConfig);       // new
```

Updated `RoutineCreate`, `RoutineUpdate`, `RoutineOut` — add superset groups:
```csharp
public sealed record RoutineCreate(string Name, string? Note, IReadOnlyList<RoutineExcercise> Excercises, IReadOnlyList<SupersetGroup> SupersetGroups);
public sealed record RoutineUpdate(string Name, string? Note, IReadOnlyList<RoutineExcercise> Excercises, IReadOnlyList<SupersetGroup> SupersetGroups);
public sealed record RoutineOut(string Name, string? Note, string Id, string? UserId, IReadOnlyList<RoutineExcercise> Excercises, IReadOnlyList<SupersetGroup> SupersetGroups);
```

Same `SupersetGroups` addition applies to: `PlanWorkoutInput`, `PlanWorkoutOutput`, `DefaultWorkoutOut`.

### 1c. EF Configuration

**`RoutineExerciseConfiguration`** — add column mappings:
- `SupersetGroupId` as a nullable string column.
- `DropConfigJson` via `ValueConverter<DropConfig?, string>` (serialize/deserialize JSON). Null when not a drop set.

**`RoutineConfiguration`** — add:
- `SupersetGroupsJson` via `ValueConverter<List<SupersetGroup>, string>`. Default `"[]"`.

### 1d. Handlers

All MediatR handlers that create, update, or read routines must map the new fields in both directions:

- **CreateRoutine handler**: map `SupersetGroups` → `Routine.SupersetGroupsJson`; map `RoutineExcercise.SupersetGroupId` / `DropConfig` → entity fields.
- **UpdateRoutine handler**: same mapping on update; replace existing exercises.
- **GetRoutines / GetRoutine handler**: map entity fields back to DTOs in the output.
- **Plans handlers** (create/update/get): same mapping for `PlanWorkoutInput` / `PlanWorkoutOutput` embedded exercises. Note: `PlanWorkoutExercise` is stored inline on the `PlanWorkout` entity (not as a separate `RoutineExercise` row), so the JSON ValueConverter approach applies there too — store superset fields as JSON on the plan workout entity or inline JSON blob.
- **DefaultWorkout handlers**: same for `DefaultWorkoutOut`.

---

## Section 2: Routine Editor — Multiple Superset Support

**File:** `modern/src/pages/RoutinesPage/components/RoutineFormModal.vue`

**Change:** In `addToSuperset(exIdx)`, change the threshold that triggers the picker from `activeSupersets.length > 1` to `activeSupersets.length >= 1`.

Current logic:
```
0 supersets → create new immediately
1 superset  → auto-join (bug: no way to create a second)
2+ supersets → show picker
```

Fixed logic:
```
0 supersets  → create new immediately
1+ supersets → show picker (existing groups + "New superset" row)
```

The picker template already renders all existing groups by color and name, plus a "New superset" option — no template changes needed.

---

## Section 3: Active Workout — Superset Display

**Root cause:** `supersetGroupId` was never persisted, so exercises always returned from the API with `supersetGroupId: null`. `computeSteps()` in `workoutStore.ts` therefore never generated `superset-round` steps.

**Fix:** Entirely resolved by Section 1. Once the backend round-trips superset data correctly, `computeSteps()` will generate `superset-round` steps and the existing display (stacked exercises, sequential "Done" per item) will work as intended.

**Verification point during implementation:** Confirm that any mapping layer between `RoutineOut` and `ActiveExercise[]` (when starting a workout) passes `supersetGroupId` through and does not drop it.

---

## What Is Not Changing

- Active workout UI rendering logic for `superset-round` steps — already correct.
- Superset set-count synchronization in the routine editor — already works.
- Drop-set weight calculation in the workout store — already works.
- `CompletedRoutineExcercise` DTO — superset grouping is not needed in workout history for now.
