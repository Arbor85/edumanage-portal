# Shared RoutineFormModal

**Date:** 2026-08-21  
**Status:** Approved

## Goal

Eliminate the duplicate exercise-editing UI in `PlanFormModal`. Move `RoutineFormModal` to a shared location, add an embedded mode so it can be driven by a parent without touching the backend, and replace the inline exercise editor in `PlanFormModal` with a workout summary + "Edit exercises" button.

## Scope

- Move `src/pages/RoutinesPage/components/RoutineFormModal.vue` → `src/components/RoutineFormModal/index.vue`
- Update import in `src/pages/RoutinesPage/RoutinesPage.vue`
- Extend `RoutineFormModal` with `embeddedWorkout` prop and `save` emit
- Update `src/pages/PlansPage/components/PlanFormModal.vue`: replace inline exercise editor with summary + embedded editor

No type changes required — `PlanWorkoutInput` already shares the `excercises: RoutineExcercise[]` shape with `RoutineOut`.

---

## Section 1: `RoutineFormModal` — move + embedded mode

### File move

`src/pages/RoutinesPage/components/RoutineFormModal.vue`  
→ `src/components/RoutineFormModal/index.vue`

Update the single import in `RoutinesPage.vue`. No behavior change for standalone usage.

### New prop and emit

```ts
// Added prop
embeddedWorkout?: PlanWorkoutInput

// Added emit (embedded mode only)
'save': [workout: PlanWorkoutInput]
```

### Embedded mode behavior (when `embeddedWorkout` is provided)

**Initialization** — `watch(() => props.open)` initializes `form.value` from `embeddedWorkout`:
- `name`, `note`, `excercises` map directly from `embeddedWorkout`
- `supersetGroups` is reconstructed from the exercises' existing `supersetGroupId` fields: for each unique `supersetGroupId` found, create a `SupersetGroup` entry with a generated color from `COLOR_ORDER`. This preserves superset grouping without requiring the plan to store group metadata.

**Save action** — instead of calling `routineStore.create()` / `routineStore.update()`, emits:
```ts
emit('save', {
  ...embeddedWorkout,
  name: form.value.name,
  note: form.value.note,
  excercises: form.value.excercises,
})
```
Then emits `close`.

**UI differences in embedded mode:**
- Title: "Edit Workout" (not "Edit Routine" / "New Routine")
- No delete button
- No discard-changes confirmation guard (the parent owns the data, closing without saving is safe)
- Save button label: "Done"

**Standalone mode** — completely unchanged. All existing `RoutinesPage` behavior is preserved.

---

## Section 2: `PlanFormModal` — workout summary + embedded editor

### State added

```ts
const editingWorkoutIndex = ref<number | null>(null)
```

### Workout summary (replaces inline exercise editor)

In the wizard step content for each workout, render:

**If exercises exist:**
- A list of exercise rows showing `name` and set count (e.g. "Bench Press — 3 sets")
- An "Edit exercises" button (secondary style) that sets `editingWorkoutIndex` to the current workout index

**If no exercises:**
- Empty state: "No exercises yet"
- Same "Edit exercises" button

The existing parts of the wizard step are untouched: workout name input, date picker, routine picker (to load a routine's exercises as a starting point), copy-scheduling controls.

### Embedded `RoutineFormModal`

Added below the wizard in `PlanFormModal`'s template:

```html
<RoutineFormModal
  :open="editingWorkoutIndex !== null"
  :embedded-workout="editingWorkoutIndex !== null ? form.workouts[editingWorkoutIndex] : null"
  @save="onWorkoutSave"
  @close="editingWorkoutIndex = null"
/>
```

### Save handler

```ts
function onWorkoutSave(updated: PlanWorkoutInput) {
  if (editingWorkoutIndex.value === null) return
  form.value.workouts[editingWorkoutIndex.value] = updated
  editingWorkoutIndex.value = null
}
```

---

## Out of Scope

- No changes to `PlanWorkoutInput` type (supersetGroups are reconstructed at runtime)
- No changes to the backend
- No changes to how routines are saved from `RoutinesPage`
- The routine picker within `PlanFormModal` (which loads a routine's exercises as a starting point) is unchanged
