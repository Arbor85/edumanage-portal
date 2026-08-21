# Weight Picker Redesign

**Date:** 2026-08-21  
**Status:** Approved

## Goal

Fix the weight selector so available plate weights match real barbell equipment, add manual weight entry, and support kg/lbs with a persistent preference and in-workout conversion prompt.

## Scope

- `src/components/WeightPickerDialog/index.vue` — extend with unit toggle + manual input, fix plates
- `src/composables/useWeightUnit.ts` — new composable for unit preference
- `src/stores/workoutStore.ts` — no changes required
- `src/pages/ActiveWorkoutPage.vue` — replace `BottomSheetPicker` weight usage with `WeightPickerDialog`
- `src/components/EditSet/index.vue` — already uses `WeightPickerDialog`, picks up changes automatically

---

## Section 1: Unit Preference (`useWeightUnit`)

New composable at `src/composables/useWeightUnit.ts`.

**Storage:** `localStorage` key `weightUnit`, value `'kg' | 'lbs'`, defaults to `'kg'`.

**Exports:**
- `unit: Ref<'kg' | 'lbs'>` — reactive current unit
- `toggle()` — switches between kg and lbs, persists to localStorage
- `toDisplay(kg: number): number` — converts a kg value to the display unit, rounded to nearest 0.25
- `toKg(display: number): number` — converts a display-unit value back to kg

**Conversion constants:**
- 1 kg = 2.20462 lbs
- Rounding: `Math.round(value * 4) / 4` (nearest 0.25)

**Invariant:** All weights are stored in kg everywhere in the app. The unit preference is a display/input concern only.

---

## Section 2: WeightPickerDialog Changes

### Plate Sets

Two distinct plate sets, selected based on current unit:

**kg mode** — plates per side: `0.25, 0.5, 1, 1.25, 2.5, 5, 10, 15, 20, 25` kg · bar: 20 kg  
**lbs mode** — plates per side: `2.5, 5, 10, 25, 35, 45` lbs · bar: 45 lbs

When switching units, the plate selection resets to empty (different physical plate sets; no plate-by-plate conversion). The total weight display updates to the new unit. Storage always in kg.

### Bug Fix

Remove the incorrect `2.25 kg` plate. The corrected kg plate list: `0.25, 0.5, 1, 1.25, 2.5, 5, 10, 15, 20, 25`.

> Note: the smaller plates (0.25, 0.5, 1) remain for fine-tuning but the `2.25` entry is removed.

### Unit Toggle

A kg / lbs pill toggle sits in the dialog header. Tapping it:
1. Calls `useWeightUnit.toggle()`
2. Resets the plate selection
3. If called from within an active workout context, triggers the recalculation prompt (see Section 3)

The dialog accepts an optional `inActiveWorkout: boolean` prop to know whether to show the prompt.

### Manual Input Mode

A "Type value" text link below the plate grid switches to a single `<input type="number">` showing the current total in the active unit. Typing a value and confirming stores it converted to kg. A "Use plates" link switches back. Plate state is preserved when toggling between modes.

---

## Section 3: Active Workout Integration

### Replacing the Picker

In `ActiveWorkoutPage.vue`, remove the `BottomSheetPicker` instances used for weight. Replace with `WeightPickerDialog` passing `:in-active-workout="true"`.

The `pickerField` ref changes type from `'reps' | 'weight' | null` to `'reps' | null` — weight now opens `WeightPickerDialog` directly via a dedicated `weightPickerOpen` boolean ref.

### Unit Switch Confirmation Prompt

Because storage is always in kg and display conversion is automatic, no data transformation is needed when switching units. However, since switching mid-workout may surprise the user, the dialog emits a `unit-changed` event and `ActiveWorkoutPage` shows a `ConfirmDialog`:

> **"Switch to [lbs/kg]?"**  
> "All weights will be displayed in [lbs/kg]. Your recorded and target weights are not changed — they will just appear in the new unit."

- **Switch** → calls `useWeightUnit.toggle()` to persist the new preference; all weight displays update automatically via `toDisplay()`
- **Cancel** → no change; unit preference stays as-is

---

## Out of Scope

- Reps picker is unchanged (stays as `BottomSheetPicker`)
- No backend unit storage — preference is local only
- No unit conversion in routine setup (`EditSet`) — routine weights are always stored in kg, the picker just displays in the preferred unit
