# Running Activity Type Design

**Date:** 2026-10-28  
**Status:** Approved

## Overview

Add `Running` as a distinct `ActivityType` alongside `Weighted`, `Machine`, `Bodyweight`, and `Cardio`. Running exercises inside a Routine carry a structured `RunConfig` (serialized as JSON) that encodes the run plan — intervals, tempo, long run, or easy run — with optional numeric pace and effort level. All changes flow through the existing Routine CRUD endpoints; no new API endpoints are needed.

`Cardio` remains unchanged and can still be used for simple/unstructured running.

---

## Data Model

### New enums (`EduManage.Domain`)

```csharp
// ActivityType.cs — add one value
public enum ActivityType { Weighted, Machine, Bodyweight, Cardio, Running }

// RunType.cs — new file
public enum RunType { Intervals, Tempo, LongRun, Easy }

// EffortLevel.cs — new file
public enum EffortLevel { Easy, Moderate, Tempo, RacePace }
```

### New record (`EduManage.Domain/Entities/RunConfig.cs`)

```csharp
public record RunConfig
{
    public RunType RunType { get; init; }
    public ActivityTrackType TrackType { get; init; }  // Distance or Time only

    // Intervals only
    public int? Repeats { get; init; }
    public int? IntervalDistanceMeters { get; init; }
    public int? IntervalDurationSeconds { get; init; }
    public int? RestSeconds { get; init; }

    // All types
    public int? TotalDistanceMeters { get; init; }
    public int? TotalDurationSeconds { get; init; }
    public double? TargetPaceMinPerKm { get; init; }
    public EffortLevel? EffortLevel { get; init; }

    // Tempo: optional warmup/cooldown
    public int? WarmupSeconds { get; init; }
    public int? CooldownSeconds { get; init; }
}
```

### Entity changes

**`RoutineExercise`** — add:
```csharp
public string? RunConfigJson { get; set; }
public RunConfig? RunConfig { get; set; }  // not mapped, populated by EF converter
```

**`CompletedExercise`** — same two properties, so workout history preserves the plan at completion time.

---

## Backend

### Infrastructure

**`RoutineExerciseConfiguration.cs`** — add a `ValueConverter<RunConfig?, string?>` for `RunConfigJson`, identical in structure to the existing `DropConfigJson` converter. The converter serializes/deserializes using `System.Text.Json`.

Same converter added to `CompletedExerciseConfiguration.cs`.

### Application (MediatR handlers + DTOs)

- `RoutineExerciseDto` and `RoutineExerciseRequest` get `RunConfig? RunConfig`.
- Create/Update Routine handlers: serialize `RunConfig` → `RunConfigJson` on write; deserialize on read (via the EF converter, so handlers just map the `RunConfig` property).
- `CompletedExerciseDto` gets `RunConfig? RunConfig`; WorkoutHistory handlers map it the same way.

### Validation

Applied in command validators (FluentValidation or inline):
- `ActivityType = Running` → `RunConfig` must be non-null.
- `RunType = Intervals` → `Repeats` ≥ 1 and at least one of `IntervalDistanceMeters` / `IntervalDurationSeconds` must be set; `RestSeconds` ≥ 0.
- `TrackType` must be `Distance` or `Time` (not `Repetitions`) when `ActivityType = Running`.

### API

No new endpoints. `RunConfig` is a nullable field on existing request/response shapes for routines and workout history.

---

## Frontend (`modern/`)

### Types (`src/types/index.ts`)

```typescript
export type ActivityType = 'weighted' | 'bodyweight' | 'cardio' | 'machine' | 'running'

export type RunType = 'intervals' | 'tempo' | 'longRun' | 'easy'
export type EffortLevel = 'easy' | 'moderate' | 'tempo' | 'racePace'

export interface RunConfig {
  runType: RunType
  trackType: 'distance' | 'time'
  // Intervals only
  repeats?: number
  intervalDistanceMeters?: number
  intervalDurationSeconds?: number
  restSeconds?: number
  // All types
  totalDistanceMeters?: number
  totalDurationSeconds?: number
  targetPaceMinPerKm?: number
  effortLevel?: EffortLevel
  // Tempo optional
  warmupSeconds?: number
  cooldownSeconds?: number
}
```

`RoutineExercise` gets `runConfig?: RunConfig`.  
`CompletedRoutineExercise` gets `runConfig?: RunConfig`.

### New component: `RunConfigEditor` (`src/components/RunConfigEditor/index.vue`)

Renders in place of the sets table when `activityType === 'running'`. Fields shown by run type:

| Field | Intervals | Tempo | Long Run | Easy |
|-------|-----------|-------|----------|------|
| Track type (Distance/Time) | ✓ | ✓ | ✓ | ✓ |
| Repeats | ✓ | | | |
| Interval distance / time | ✓ | | | |
| Rest duration | ✓ | | | |
| Warmup / cooldown | | ✓ | | |
| Total distance / time | | ✓ | ✓ | ✓ |
| Target pace (min/km) | ✓ | ✓ | optional | optional |
| Effort level | ✓ | ✓ | ✓ | ✓ |

Emits `update:runConfig` for v-model integration.

### `RoutineFormModal` (`src/components/RoutineFormModal/index.vue`)

When a `RoutineExercise` has `activityType === 'running'`:
- Hide the existing sets table.
- Render `<RunConfigEditor v-model:runConfig="exercise.runConfig" />`.

### `ActiveWorkoutPage`

Running exercises render a read-only run plan summary (e.g., `"6 × 400m — 90s rest — Tempo pace"`) instead of the set-by-set tracker. Completing the exercise logs `totalDistanceMeters` or `totalDurationSeconds` actually covered into `CompletedExercise`.

### `ExerciseBrowser` filter panel

Add `running` to the ActivityType filter chip/select options.

---

## Out of Scope

- GPS/real-time pace tracking during a run.
- Multi-week running training plan builder.
- Unit preference (km vs miles) — all values stored in metric; display conversion deferred.
