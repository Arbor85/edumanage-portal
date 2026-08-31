# Organizer Pages Unification — Design Spec
**Date:** 2026-08-31  
**Status:** Approved

## Goal

Make the four organizer pages structurally identical to the rest of the `modern/` app: split into component subdirectories, use shared Base components throughout, and replace all one-off UI patterns (raw modals, `window.confirm`, plain inputs) with the established equivalents.

The inline expandable availability panels (trainer availability, building availability) stay inline — only the widget primitives inside them change.

---

## File Structure

### Before
```
pages/organizer/
  OrganizerDashboardPage.vue
  OrganizerBuildingsPage.vue
  OrganizerTrainersPage.vue
  OrganizerSchedulePlansPage.vue
  OrganizerSchedulePlanDetailPage.vue
```

### After
```
pages/organizer/
  OrganizerDashboardPage.vue                    ← unchanged
  buildings/
    OrganizerBuildingsPage.vue                  ← thin orchestrator
    components/
      BuildingCard.vue                          ← card row + inline availability panel
      BuildingFormModal.vue                     ← create / edit building
  trainers/
    OrganizerTrainersPage.vue                   ← thin orchestrator
    components/
      TrainerCard.vue                           ← card row + inline availability + courses
  schedule-plans/
    OrganizerSchedulePlansPage.vue              ← thin orchestrator
    components/
      SchedulePlanCard.vue                      ← list row card
      SchedulePlanFormModal.vue                 ← create plan
  schedule-plan-detail/
    OrganizerSchedulePlanDetailPage.vue         ← thin orchestrator
    components/
      ScheduleEntryCard.vue                     ← single entry row
      ScheduleEntryFormModal.vue                ← add entry (moved from inline to modal)
      AutoSchedulePanel.vue                     ← entire auto tab, self-contained
```

The router `import()` paths for all four moved pages update accordingly. The dashboard is simple enough to remain a single file.

---

## Shared Components Adopted

| Pattern currently in organizer pages | Replacement |
|---|---|
| `<div class="fixed inset-0 z-50 …">` raw modal | `BaseModal` (`:open`, `title`, `size`, `@close`, `footer` slot) |
| `<input class="input-field …">` | `BaseInput` (`:modelValue`, `label`, `placeholder`, `type`, `hint`) |
| `<select class="input-field …">` | `BaseSelect` (`:modelValue`, `label`, `:options`, `placeholder`) |
| Raw `<button>` for primary/ghost/danger actions | `BaseButton` (`variant`: primary / secondary / ghost / danger; `size`: sm / md) |
| Custom empty-state div (icon + text + button) | `EmptyState` (`:icon`, `title`, `description`, `actionLabel`, `@action`) |
| `window.confirm('…')` | `ConfirmDialog` (`:open`, `title`, `message`, `confirmLabel`, `variant="danger"`, `@confirm`, `@cancel`) |
| Manual status pill spans | `BaseBadge` (`label`, `variant`: success for Published, default for Draft) |
| `<div class="bg-surface-card …">` list rows | `BaseCard` (`hoverable` prop for clickable rows) |

**Day-toggle chip buttons** (multi-select weekday pills) remain as custom `<button>` elements — no Base component covers multi-select chip groups.

---

## Page-Level Orchestrator Pattern

Each page follows the same state management pattern as `ClientsPage.vue`.

```ts
// state
const search       = ref('')          // Buildings and Schedule Plans only
const isCreateOpen = ref(false)
const editTarget   = ref<T | null>(null)
const deleteTarget = ref<T | null>(null)

// computed
const filtered = computed(() =>
  store.items.filter(i => !search.value || i.name.toLowerCase().includes(search.value.toLowerCase()))
)

// handlers
async function handleDelete() {
  await store.remove(deleteTarget.value!.id)
  toast.success('…')
  deleteTarget.value = null
}
```

**Search bar** (`ListSearchBar`) added to Buildings and Schedule Plans — both can grow to many items. Trainers page omits search (small, invite-only list).

---

## Component Contracts

### BuildingFormModal
```
Props:  open: boolean, building: Building | null
Emits:  close
```
Wraps `BaseModal` (size="md"). Creates when `building === null`, edits otherwise. Footer slot has Cancel (ghost) + Save/Create (primary) `BaseButton`. Fields: Name (`BaseInput`), Address (`BaseInput`), Capacity (`BaseInput` type="number").

### BuildingCard
```
Props:  building: Building
Emits:  edit(building), delete(id)
```
Uses `BaseCard`. Row header: building icon + name/address + capacity `BaseBadge`-style chip + edit/delete `BaseButton size="sm" variant="ghost"` + chevron toggle. Expanded panel stays as-is structurally (inline availability), but replaces raw inputs with `BaseInput` / `BaseButton`.

### SchedulePlanFormModal
```
Props:  open: boolean
Emits:  close
```
Single `BaseInput` for plan name. Footer: Cancel + Create (primary). Navigates to the new plan on success.

### SchedulePlanCard
```
Props:  plan: SchedulePlan
Emits:  delete(id)
```
`BaseCard hoverable`. Shows name, created date, `BaseBadge` (Published = success, Draft = default). Delete `BaseButton` revealed on hover. Clicking the card navigates to detail.

### ScheduleEntryFormModal
```
Props:  open: boolean, trainers, courses, buildings, trainerCourses
Emits:  close, saved
```
Moves the inline add-entry form panel into a `BaseModal` (size="lg"). Three `BaseSelect` dropdowns (Trainer, Course, Building). Recurring toggle. Day chips (custom). Date / time `BaseInput` fields. Footer: Cancel + Add Entry (primary).

### ScheduleEntryCard
```
Props:  entry: ScheduleEntry, courseName, trainerLabel, buildingName
Emits:  delete(id)
```
`BaseCard`. Course name as heading, trainer/building as secondary line, day chips + time as tertiary. Amber border + icon when `hasMismatch`.

### AutoSchedulePanel
```
Props:  trainers, buildings, courses, proposal, running, confirming
Emits:  run(selection), confirm
```
Self-contained panel for the auto tab. Styled button-list selectors for courses/buildings/trainers. Generate button. Proposal result cards. Confirm button.

### TrainerCard
```
Props:  trainer, availabilities, courses, allCourses, availableCourses
Emits:  delete(id), addAvailability(payload), deleteAvailability(id), assignCourse(payload), removeCourse(id)
```
`BaseCard`. Avatar circle + truncated ID + joined date. Expanded panel: availability slots inline (same structure, Base widgets inside), then course chip list + course assign select.

---

## Deletions

`ConfirmDialog` replaces all `window.confirm()` calls. Each page holds a `deleteTarget` ref and renders one `ConfirmDialog`. The card emits `delete(id)` upward; the page sets `deleteTarget` and shows the dialog.

---

## What Does Not Change

- Store logic (`schedulePlanStore`, `organizerStore`, `courseStore`)
- API service files
- Route paths (only the `import()` source paths in the router change)
- The inline expandable availability panel structure
- Day-toggle chip button pattern
- `OrganizerDashboardPage.vue`
