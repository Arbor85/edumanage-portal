# Routine Set Editor Dialog — Implementation Plan

**Spec:** `2026-11-05-routine-set-editor-dialog-design.md`
**Date:** 2026-11-05

## Implementation note

`EditSet` is used only in `RoutineFormModal` (planning). `ActiveWorkoutPage` has its own inline inputs for actual reps/weight. The `SetEditorDialog` therefore has two input sections:
- `planning` mode → embeds `<EditSet>` unchanged
- `active` mode → simple reps + weight inputs writing to `actualReps` / `actualWeight`

The context panel and dialog shell are shared between both modes.

---

## Step 1 — `composables/useSetCalculations.ts`

Create new file. No existing files changed.

```typescript
// Inputs
interface UseSetCalculationsOptions {
  set: Ref<RoutineSet>                   // current set being edited
  activityTrackType: ActivityTrackType
  mode: 'planning' | 'active'
  exerciseMax?: UserExerciseMax          // from gymProfileStore
  previousSessionSet?: CompletedRoutineSet  // same index from last workout (planning only)
  previousSetInSession?: { reps: number | null; weight: number | null }  // set N-1 (active only)
}
```

Computed outputs:
- `lastSession: ComputedRef<string | null>` — `"Last time: 10×55kg"`, planning only
- `percentOfMax: ComputedRef<string | null>` — `"= 72% of your max"`, planning only, requires weight input + maxWeight
- `estimated1RM: ComputedRef<string | null>` — `"~82kg estimated 1RM"` via Epley, planning only, requires weight + reps
- `suggestion: ComputedRef<{ weight: number; reps: number } | null>` — +2.5kg or +1 rep over lastSession
- `previousSet: ComputedRef<string | null>` — `"Previous set: 10×60kg"`, active only
- `hasContext: ComputedRef<boolean>` — true if any of the above is non-null (drives panel visibility)

Reuse:
- Epley formula from `ExerciseMaxBadge.vue` (`weight * (1 + reps / 30)`)
- `roundHalf` — copy the function locally or import from `workoutStore` if exported

Format helpers (private to composable):
- `formatSet(reps, weight, unit)` → `"10×60kg"`
- `formatDuration(seconds)` → `"1:30"`
- `formatDistance(meters)` → `"5km"` / `"800m"`

---

## Step 2 — `components/SetSummary.vue`

New file. No existing files changed.

**Props:**
```typescript
{
  set: RoutineSet
  activityTrackType: ActivityTrackType
  setType?: string | null   // 'normal' | 'warmup' | 'failure' | 'drop'
}
```

**Emits:** `click`

**Display logic:**
- `activityTrackType === 'repetitions'` + weight → `{reps}×{weight}kg`
- `activityTrackType === 'repetitions'` + no weight (bodyweight) → `{reps} reps`
- `activityTrackType === 'time'` → formatted duration
- `activityTrackType === 'distance'` → formatted distance
- Any null value → `—`

Styled as a rounded pill button (matches existing design system). Clicking emits `click` — parent decides what dialog to open.

---

## Step 3 — `components/SetEditorDialog/index.vue`

New file. No existing files changed.

**Props:**
```typescript
{
  modelValue: boolean                        // dialog open state
  set: RoutineSet                            // v-model target for planning mode
  activeSet?: { actualReps: number | null; actualWeight: number | null }  // for active mode
  setIndex: number                           // 0-based, for "Set N" title
  activityTrackType: ActivityTrackType
  mode: 'planning' | 'active'
  exerciseMax?: UserExerciseMax              // planning: from gymProfileStore
  previousSessionSet?: CompletedRoutineSet   // planning: last workout same index
  previousSetInSession?: { reps: number | null; weight: number | null }   // active: set N-1
}
```

**Emits:** `update:modelValue`, `update:set`, `update:activeSet`, `confirm`

**Layout:**
```
┌─────────────────────────────┐
│ Set {n}              [×]    │
├─────────────────────────────┤
│  [EditSet]  ← planning only │
│  [reps + weight inputs]     │
│    ← active mode only       │
├─────────────────────────────┤
│  Context panel              │
│  (hidden if hasContext=false)│
│  · Last time: 10×55kg       │
│  · = 72% of your max        │
│  · ~82kg estimated 1RM      │
│  · [Apply suggestion +2.5kg]│
│    OR                       │
│  · Previous set: 10×60kg    │
├─────────────────────────────┤
│        [Cancel] [Confirm]   │
└─────────────────────────────┘
```

Uses `useSetCalculations` for context panel data.

Confirm button emits `confirm` and closes. Cancel reverts local copy and closes.

Work on a local copy of the set data; only write back on confirm.

---

## Step 4 — Wire into `RoutineFormModal/index.vue`

File: `modern/src/components/RoutineFormModal/index.vue`

**Changes:**

1. Import `SetSummary` and `SetEditorDialog`.

2. Add per-exercise dialog state:
```typescript
const openSetDialogIndex = ref<{ exIdx: number; setIdx: number } | null>(null)
```

3. Add helper to find `previousSessionSet`:
```typescript
function findPreviousSessionSet(exerciseName: string, setIndex: number): CompletedRoutineSet | undefined {
  // scan workoutStore.history for most recent entry containing exerciseName
  // return entry.excercises[i].sets[setIndex]
}
```

4. Replace every `<EditSet>` instance in the set row template with:
```html
<SetSummary
  :set="set"
  :activityTrackType="exercise.activityTrackType"
  @click="openSetDialogIndex = { exIdx, setIdx }"
/>
```

5. Add `<SetEditorDialog>` once at the bottom of the template, bound to `openSetDialogIndex`.

**Note:** Drop sets show only the first set as editable (existing logic at lines 909–915) — `SetSummary` replaces only that editable chip; computed drop weights remain as read-only display.

---

## Step 5 — Wire into `ActiveWorkoutPage.vue` — normal sets (lines 820–886)

File: `modern/src/pages/ActiveWorkoutPage.vue`

**Changes:**

1. Import `SetSummary` and `SetEditorDialog`.

2. Add dialog state:
```typescript
const activeSetDialogIdx = ref<number | null>(null)
```

3. Helper to get previous set in session:
```typescript
function previousSetInSession(setIndex: number) {
  if (setIndex === 0) return undefined
  const sets = store.currentExercise?.sets
  return sets?.[setIndex - 1]
    ? { reps: sets[setIndex - 1].actualReps, weight: sets[setIndex - 1].actualWeight }
    : undefined
}
```

4. In the set row template (lines 820–886), replace the inline weight chip + reps input with:
```html
<SetSummary
  :set="asRoutineSet(activeSet)"   <!-- thin adapter: map actualReps/actualWeight → reps/weight -->
  :activityTrackType="exercise.activityTrackType"
  @click="activeSetDialogIdx = setIndex"
/>
```

5. Add `<SetEditorDialog>` with `mode="active"`, wired to `activeSetDialogIdx`. On confirm, call `store.completeSet(...)` with the edited actual values.

---

## Step 6 — Wire into `ActiveWorkoutPage.vue` — drop sets (lines 696–749)

Same pattern as Step 5 applied to the drop set rows. Each drop has its own weight (computed from `DropConfig`) and reps — replace inline inputs with `SetSummary` + dialog.

---

## Step 7 — Wire into `ActiveWorkoutPage.vue` — superset items (lines 564–653)

Same pattern applied to the editable current-item inputs within superset rounds (lines 611–640). The dialog's `previousSetInSession` is the same exercise's previous superset round if it exists.

---

## File summary

| File | Action |
|------|--------|
| `modern/src/composables/useSetCalculations.ts` | Create |
| `modern/src/components/SetSummary.vue` | Create |
| `modern/src/components/SetEditorDialog/index.vue` | Create |
| `modern/src/components/RoutineFormModal/index.vue` | Modify (steps 4) |
| `modern/src/pages/ActiveWorkoutPage.vue` | Modify (steps 5–7) |
| `modern/src/components/EditSet/index.vue` | No changes |
