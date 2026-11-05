# Routine Set Editor Dialog Design

**Date:** 2026-11-05
**Status:** Approved

## Overview

Replace the current inline `EditSet` inputs in routine planning and active workout views with a clickable summary chip (`SetSummary`) that opens a focused `SetEditorDialog`. The dialog embeds the existing `EditSet` component for input and adds a context panel with helpful calculations. Same pattern used in both phases — planning gets full context, active workout gets a simplified view.

## Problem

Users currently edit reps and weight via separate inline inputs on each set row. There is no contextual help — no reference to what they did last time, no sense of how the weight relates to their max, no progression suggestion.

## Design

### Summary Display — `SetSummary.vue`

A styled clickable chip replacing the inline `EditSet` in every set row.

**Format rules:**
- Repetitions + weight: `10×60kg` (or lb based on user preference)
- Bodyweight repetitions: `10 reps`
- Time: `1:30`
- Distance: `5km` / `800m`
- Any null value: `—` (signals unset, prompts user to tap)

The set type badge (Normal / Warmup / Failure / Drop) remains to the left, delete button to the right — only the middle changes.

### SetEditorDialog — `components/SetEditorDialog/index.vue`

Standard dialog with two zones stacked vertically:

**Top zone — inputs**
Embeds the existing `EditSet` component unchanged.

**Bottom zone — context panel**
Shown only when at least one data point is available. Hidden entirely when no history/max exists (no empty states).

| Mode | Context shown |
|------|---------------|
| `planning` | Last session, % of 1RM, estimated 1RM, suggestion button |
| `active` | Previous set in this session only |

**Dialog title:** `"Set {n}"` (1-based)

Confirm writes back to the set. Cancel discards. 

### Calculation Logic — `composables/useSetCalculations.ts`

Single composable owning all math.

**Inputs:**
```typescript
{
  set: Ref<RoutineSet>
  activityTrackType: ActivityTrackType
  mode: 'planning' | 'active'
  exerciseMax?: UserExerciseMax
  previousSessionSet?: CompletedRoutineSet   // same set index, most recent workout
  previousSetInSession?: { reps: number | null; weight: number | null }
}
```

**Outputs:**

| Computed | Shown when | Example |
|----------|------------|---------|
| `lastSession` | planning + previousSessionSet exists | `"Last time: 10×55kg"` |
| `percentOfMax` | planning + weight input + max exists | `"= 72% of your max"` |
| `estimated1RM` | planning + weight + reps filled | `"~82kg estimated 1RM"` |
| `suggestion` | planning + lastSession exists | `{ weight: 62.5, reps: 10 }` |
| `previousSet` | active + previousSetInSession exists | `"Previous set: 10×60kg"` |

**Calculation rules:**
- `percentOfMax`: `(weight / maxWeight) * 100`, rounded to nearest integer
- `estimated1RM`: Epley formula — `weight * (1 + reps / 30)`, reuses existing logic from `ExerciseMaxBadge`
- `suggestion`: +2.5kg (weight-based) or +1 rep (bodyweight), rounds to nearest 0.5kg using existing `roundHalf` from workoutStore
- `previousSet` (active): set at index N-1 for this exercise in the current active session

### Data Wiring

**Planning mode (RoutineFormModal):**

On set chip click:
1. `exerciseMax` — `gymProfileStore.getByExerciseId(exerciseId)` (already loaded)
2. `previousSessionSet` — scan `workoutStore.history` for the most recent entry containing this exercise name, take `excercises[i].sets[setIndex]`

No new API calls needed — both stores load on app init.

**Active workout mode:**

`previousSetInSession` = completed data for set N-1 of this exercise from the active workout state already tracked in `workoutStore`. No history lookup.

### Files Changed

| File | Change |
|------|--------|
| `modern/src/components/SetSummary.vue` | New |
| `modern/src/components/SetEditorDialog/index.vue` | New |
| `modern/src/composables/useSetCalculations.ts` | New |
| `modern/src/components/RoutineFormModal/index.vue` | Replace `<EditSet>` with `<SetSummary>` + wire dialog |
| Active workout set component (identify during impl) | Same replacement |
| `modern/src/components/EditSet/index.vue` | No changes |

## Constraints

- `EditSet` is not modified — it is embedded inside the dialog unchanged.
- The context panel is never shown empty — it hides itself when no data is available.
- Active workout mode shows only the previous set in the current session; no global history context.
- Weight rounding always uses `roundHalf` (nearest 0.5kg) for consistency with the rest of the app.
- Icons: `@lucide/vue` only.
