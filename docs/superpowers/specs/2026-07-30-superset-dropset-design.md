# Superset & Drop Set Support

**Date:** 2026-07-30  
**Scope:** `modern/` Vue 3 frontend — data model, routine editor, active workout flow

---

## Problem

Routines only support independent exercises with fixed sets. Two common advanced training patterns are missing:

1. **Supersets** — two or more exercises performed back-to-back without rest between them, resting only after a full round.
2. **Drop sets** — an exercise performed to failure, immediately followed by additional sets at progressively lower weights, with the number of drops and weight reduction pre-planned.

---

## Goals

- Routine editor supports defining supersets (grouped exercises) and drop sets (computed weight progression).
- Active workout flow respects superset round sequencing and drop set weight targets.
- Backward compatible — existing routines with no superset or drop config behave identically.

---

## Data Model

### `RoutineExcercise` — two new optional fields

```typescript
interface RoutineExcercise {
  name: string | null
  activityType: ActivityType
  activityTrackType: ActivityTrackType
  sets: RoutineSet[] | null

  // New
  supersetGroupId: string | null   // UUID shared by all exercises in the same superset
  dropConfig: DropConfig | null    // present only when the exercise is a drop set
}

interface DropConfig {
  count: number                    // total sets including the starting set (min 2)
  weightDecreasePercent: number    // e.g. 20 → each drop weight = previous × 0.80
}
```

When `dropConfig` is present, `sets` contains exactly one entry (the starting set definition). The remaining `count − 1` sets are computed on the fly: each set's weight = previous weight × `(1 − weightDecreasePercent / 100)`, rounded to the nearest 0.5 kg. Rep target is null (to failure).

### `SupersetGroup` — new entity on `RoutineOut`

```typescript
interface SupersetGroup {
  id: string                          // UUID, matches supersetGroupId on exercises
  name: string | null                 // user-provided label, e.g. "Chest / Back"
  color: 'violet' | 'orange' | 'sky' | 'rose' | 'amber'
}

interface RoutineOut {
  // existing fields unchanged
  supersetGroups: SupersetGroup[]     // lookup table for group metadata
}
```

Exercises sharing a `supersetGroupId` form a superset. Their order within `excercises` determines the within-round sequence. If only one exercise remains in a group, the group is dissolved (removed from `supersetGroups`, `supersetGroupId` set to null on the exercise).

---

## Routine Editor UI

The editor renders a flat scrollable list of all exercises. Each exercise shows its sets inline. Supersets render as a bordered grouped card spanning all member exercises.

### Normal exercise block

```
┌─────────────────────────────────────────┐
│ Bench Press                    [⋮ menu] │
│  Set 1  80kg × 10   [+ superset]        │
│  Set 2  80kg × 10   [+ superset]        │
│  [+ Add set]                            │
└─────────────────────────────────────────┘
```

### Superset block

All exercises sharing a `supersetGroupId` collapse into one card. The header shows the superset name and color dot; tapping it opens an edit sheet for name and color.

```
╔═ Chest / Back  ●violet ════════════════╗
║ Bench Press                   [⋮ menu] ║
║  Set 1  80kg × 10  [remove from group] ║
║  Set 2  80kg × 10  [remove from group] ║
║ ─────────────────────────────────────  ║
║ Pull-up                       [⋮ menu] ║
║  Set 1  BW × 8     [remove from group] ║
║  Set 2  BW × 8     [remove from group] ║
╚════════════════════════════════════════╝
```

### Drop set exercise block

`sets[0]` holds the starting weight and track type. Additional sets are displayed as computed targets.

```
┌─────────────────────────────────────────┐
│ Bicep Curl  ↓ Drop set         [⋮ menu] │
│  40kg  →  32kg  →  26kg                 │
│  3 drops · −20% per drop                │
│  [Edit drop config]                     │
└─────────────────────────────────────────┘
```

### Interactions

**Creating a superset:**
- Drag a set row onto a set row from a different exercise → groups their parent exercises into a new superset. If the source exercise already belongs to a superset, the user is offered to merge the target into that superset.
- **"+ superset"** button on any set row:
  - Zero active supersets → creates a new superset group and adds this exercise.
  - One active superset → adds this exercise to it directly.
  - Multiple active supersets → shows a picker of existing groups plus "New superset."

**Removing from a superset:**
- **"Remove from group"** on any set row → removes that exercise's `supersetGroupId`. If only one exercise remains in the group, dissolve the group.

**Superset header:**
- Tap name or color dot → bottom sheet with text input for name and a color swatch picker (5 predefined colors).

**Drop set:**
- Exercise `⋮` menu → "Convert to drop set" → bottom sheet with:
  - Number of drops (stepper, 2–6 total sets)
  - Weight decrease % (stepper, 5–50%, step 5%)
- "Convert to drop set" is mutually exclusive with superset membership. An exercise cannot be both.
- `⋮` menu → "Remove drop set" → restores to a single normal set at the starting weight.

---

## Active Workout Flow

### Step pre-computation

On workout start, `workoutStore.startFromRoutine()` expands the routine into a flat ordered list of `WorkoutStep` objects before the workout begins.

```typescript
type WorkoutStep =
  | { type: 'normal-set';  exerciseIndex: number; setIndex: number }
  | { type: 'superset-round'; groupId: string; roundIndex: number; items: SupersetStepItem[] }
  | { type: 'drop-set';    exerciseIndex: number; setIndex: number; isLastDrop: boolean }

interface SupersetStepItem {
  exerciseIndex: number
  setIndex: number
  completed: boolean
}
```

**Expansion rules:**
- Non-superset, non-drop exercise with N sets → N `normal-set` steps.
- Superset group with exercises [A, B] each having N sets → N `superset-round` steps, each containing one item per exercise at the matching set index. The editor enforces matching set counts across exercises in the same superset: when a new exercise joins a group, its set count is adjusted to match the group's count (sets added or trimmed from the end).
- Drop set exercise with `count` drops → `count` `drop-set` steps with computed weights; `isLastDrop` true on the last.

`ActiveWorkoutState.currentStepIndex` replaces the previous `currentExerciseIndex` / `currentSetIndex` pair. "Next" is always `currentStepIndex + 1`.

### Normal set step — unchanged

User sees exercise name, target weight and reps, edits actuals, taps Done. 90s rest timer starts.

### Superset round step

User sees all exercises in the round stacked. One exercise is active at a time (highlighted). Completing each exercise immediately advances to the next within the round — no rest. After all exercises in the round are done, the 90s rest timer starts.

```
╔═ Chest / Back — Round 2 of 3 ══════════╗
║ ✓ Bench Press    80kg × 10  →  10 reps  ║
║─────────────────────────────────────────║
║ ► Pull-up  (current)                    ║
║   BW × 8   →  [  8  ] reps             ║
║                         [Done]          ║
╚════════════════════════════════════════╝
```

### Drop set step

Target weight is shown (computed from `dropConfig`). Rep target field is labeled "to failure" with no numeric target — user enters actual reps after completing the set. No rest between drops. After the last drop (`isLastDrop: true`), the 90s rest timer starts.

```
┌─ Bicep Curl — Drop 2 of 3 ─────────────┐
│ 40kg  →  32kg  →  26kg                  │
│                                         │
│ Current: 32kg · to failure              │
│ Reps completed: [  _ ]                  │
│                              [Done]     │
└─────────────────────────────────────────┘
```

### Rest timer behavior summary

| Step type              | Rest after step         |
|------------------------|-------------------------|
| Normal set             | 90s (existing behavior) |
| Within superset round  | None                    |
| After superset round   | 90s                     |
| Between drop sets      | None                    |
| After last drop        | 90s                     |

---

## Out of Scope

- Superset membership for drop set exercises (mutually exclusive by design).
- Configurable per-superset or per-drop rest duration (always uses global 90s default).
- Reordering exercises within a superset (order is determined by position in the `excercises` array).
- Backend API changes — the existing `/api/routines` endpoints receive the extended payload; no new endpoints needed.
