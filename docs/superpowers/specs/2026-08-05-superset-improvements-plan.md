# Superset Improvements — Implementation Plan

**Spec:** `2026-08-05-superset-improvements-design.md`

---

## Step 1 — Backend DTOs

**File:** `netbackend/src/EduManage.Application/Contracts/Dtos.cs`

Add two new records after `RoutineSet`:
```csharp
public sealed record SupersetGroup(string Id, string? Name, string Color);
public sealed record DropConfig(int Count, double WeightDecreasePercent);
```

Update `RoutineExcercise` to include the new fields (nullable so existing callers compile):
```csharp
public sealed record RoutineExcercise(
    string Name,
    ActivityType ActivityType,
    ActivityTrackType ActivityTrackType,
    IReadOnlyList<RoutineSet> Sets,
    string? SupersetGroupId = null,
    DropConfig? DropConfig = null);
```

Update `RoutineCreate`, `RoutineUpdate`, `RoutineOut` — add `SupersetGroups`:
```csharp
public sealed record RoutineCreate(string Name, string? Note, IReadOnlyList<RoutineExcercise> Excercises, IReadOnlyList<SupersetGroup>? SupersetGroups = null);
public sealed record RoutineUpdate(string Name, string? Note, IReadOnlyList<RoutineExcercise> Excercises, IReadOnlyList<SupersetGroup>? SupersetGroups = null);
public sealed record RoutineOut(string Name, string? Note, string Id, string? UserId, IReadOnlyList<RoutineExcercise> Excercises, IReadOnlyList<SupersetGroup> SupersetGroups);
```

Update `PlanWorkoutInput` and `PlanWorkoutOutput` — add `SupersetGroups` with default null.

---

## Step 2 — Backend Entities

**File:** `netbackend/src/EduManage.Domain/Entities/RoutineExercise.cs`

Add:
```csharp
public string? SupersetGroupId { get; set; }
public string? DropConfigJson { get; set; }
```

**File:** `netbackend/src/EduManage.Domain/Entities/Routine.cs`

Add:
```csharp
public string SupersetGroupsJson { get; set; } = "[]";
```

**File:** `netbackend/src/EduManage.Domain/Entities/PlanWorkout.cs`

Add:
```csharp
public string SupersetGroupsJson { get; set; } = "[]";
```

---

## Step 3 — EF Configurations

**File:** `netbackend/src/EduManage.Infrastructure/Persistence/Configurations/RoutineExerciseConfiguration.cs`

Add inside `Configure`:
```csharp
builder.Property(re => re.SupersetGroupId);

builder.Property(re => re.DropConfigJson)
    .HasConversion(
        v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
        v => v == null ? null : JsonSerializer.Deserialize<DropConfig>(v, (JsonSerializerOptions?)null));
```

**File:** `netbackend/src/EduManage.Infrastructure/Persistence/Configurations/RoutineConfiguration.cs`

Add inside `Configure`:
```csharp
builder.Property(r => r.SupersetGroupsJson)
    .HasConversion(
        v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
        v => JsonSerializer.Deserialize<List<SupersetGroup>>(v, (JsonSerializerOptions?)null) ?? new());
```

Add the analogous converter to `PlanWorkoutConfiguration` for `SupersetGroupsJson`.

> Note: use `System.Text.Json.JsonSerializer` — consistent with existing ValueConverter usage in `ExerciseConfiguration`.

---

## Step 4 — Routine Handlers

### `AddRoutineCommand.cs`

In `Handle`, update `Routine` construction:
```csharp
var routine = new Routine
{
    ...
    SupersetGroupsJson = JsonSerializer.Serialize(request.Request.SupersetGroups ?? []),
    Exercises = request.Request.Excercises.Select(e => new RoutineExercise
    {
        ...
        SupersetGroupId = e.SupersetGroupId,
        DropConfigJson = e.DropConfig == null ? null : JsonSerializer.Serialize(e.DropConfig),
    }).ToList()
};
```

### `UpdateRoutineCommand.cs`

Same additions in the `routine.Exercises` assignment and add:
```csharp
routine.SupersetGroupsJson = JsonSerializer.Serialize(request.Request.SupersetGroups ?? []);
```

### `ListRoutinesQuery.cs` — `MapToOut`

Update to deserialize and pass superset data:
```csharp
internal static RoutineOut MapToOut(Routine routine) =>
    new(routine.Name, routine.Notes, routine.Id, routine.UserId,
        routine.Exercises.Select(e => new RoutineExcercise(
            e.Name,
            e.ActivityType,
            e.ActivityTrackType,
            e.Sets.Select(s => new ContractsRoutineSet(...)).ToList(),
            e.SupersetGroupId,
            e.DropConfigJson == null ? null : JsonSerializer.Deserialize<DropConfig>(e.DropConfigJson)
        )).ToList(),
        JsonSerializer.Deserialize<List<SupersetGroup>>(routine.SupersetGroupsJson) ?? []);
```

---

## Step 5 — Plan Handlers

### `ListPlansQuery.cs` — `MapToOut`

Update `PlanWorkoutOutput` construction to include superset data from `PlanWorkout.SupersetGroupsJson` and pass `SupersetGroupId`/`DropConfig` through each exercise, mirroring Step 4.

### `AddPlanCommand.cs` and `UpdatePlanCommand.cs`

When building `PlanWorkout` entities from `PlanWorkoutInput`, serialize `SupersetGroups` and exercise superset fields — same pattern as Step 4.

---

## Step 6 — Frontend Types

**File:** `modern/src/types/index.ts`

`RoutineExercise`, `RoutineCreate`, `RoutineUpdate`, `RoutineOut` already include `supersetGroupId`, `dropConfig`, and `supersetGroups` — **no changes needed**. The frontend types already match the updated backend shape.

---

## Step 7 — Routine Editor Fix

**File:** `modern/src/pages/RoutinesPage/components/RoutineFormModal.vue`

In `addToSuperset(exIdx)`, change:
```ts
// before
} else if (activeSupersets.length === 1) {
  joinSuperset(exIdx, activeSupersets[0].id)
} else {
  supersetPickerFor.value = exIdx
}
```
to:
```ts
// after
} else {
  supersetPickerFor.value = exIdx
}
```

Remove the middle branch entirely — the picker already handles the single-superset case correctly (it lists the one group and offers "New superset").

---

## Step 8 — Verify Workout Store Mapping

**File:** `modern/src/stores/workoutStore.ts`

`buildActiveExercises` already reads `ex.supersetGroupId` (line 38). Confirm that when a routine is loaded from the API and passed into `startWorkout`, the `supersetGroupId` field is not stripped anywhere between the API response and the `buildActiveExercises` call. No code change expected — this is a verification step.

Also confirm `workoutStore` passes `supersetGroups` from the routine into the workout session state so `computeSteps` can use group data (color, name) if needed during the workout.

---

## Step 9 — Smoke Test

1. Create a routine with 3 exercises, assign A+B to superset 1 and C+D to superset 2.
2. Save. Reload the page. Verify both supersets survive the round-trip.
3. Start the workout. Verify A+B appear stacked together in round 1, C+D in their own rounds.
4. Complete the workout. Verify no errors.
