# Schedule Entry Redesign — Design Spec

**Date:** 2026-08-31
**Status:** Approved

## Problem

The current `ScheduleEntry` model stores recurrence as a set of weekdays (e.g., Mon + Wed + Fri). This makes it impossible to express "every 3 days" or "every day", requires multiple entries to cover multiple weekdays, and has no canonical start date — just a floating time-of-day. The schedule plan detail page has no calendar view, making it hard to visualise how entries distribute across a week.

## Goals

1. Replace weekday-set recurrence with interval-based recurrence (none / daily / weekly / every-N-days).
2. Each entry has a precise `StartDate` (first occurrence) + `StartTime`/`EndTime`.
3. The form offers duration shortcuts (30m / 1h / 1.5h / 2h / custom) that compute `EndTime`.
4. A new Calendar tab on the schedule plan detail page shows a week grid where entries can be dragged to a new date/time (moves the whole series).
5. Auto-schedule output updated to emit `StartDate` + `recurrenceType: weekly` instead of `DaysOfWeek`.

## Non-goals

- Per-occurrence exceptions (dragging moves the whole series, not one occurrence).
- Timezone handling (all times are local, no tz stored).
- Click-to-edit on the calendar (editing opens the existing modal from the Manual tab).
- Month view or day view.

---

## Section 1 — Data Model

### Backend entity (`ScheduleEntry`)

**Removed fields:** `IsRecurring`, `DaysOfWeek`, `Date`

**New fields:**

| Field | Type | Notes |
|---|---|---|
| `StartDate` | `string` | ISO date, e.g. `"2026-01-05"` — first (or only) occurrence |
| `RecurrenceType` | `string` | `"none"` \| `"daily"` \| `"weekly"` \| `"every-n-days"` |
| `RecurrenceInterval` | `int?` | Only for `"every-n-days"`, e.g. `3` = every 3 days |
| `ValidUntil` | `string?` | Optional recurrence end date, e.g. `"2026-06-01"` |

**Unchanged fields:** `Id`, `SchedulePlanId`, `TrainerUserId`, `BuildingId`, `CourseId`, `StartTime`, `EndTime`, `HasMismatch`

### DTOs

`ScheduleEntryCreate` and `ScheduleEntryUpdate` mirror the entity shape exactly.

`ScheduleEntryOut` returns all fields above.

### Migration

One EF migration: drop `IsRecurring`, `DaysOfWeek`, `Date`; add `StartDate`, `RecurrenceType`, `RecurrenceInterval` (nullable int), `ValidUntil` (nullable string).

---

## Section 2 — Backend Commands & Queries

### AddScheduleEntryCommand / UpdateScheduleEntryCommand

Map new DTO fields directly to entity properties. No business logic change beyond field assignment.

### ListScheduleEntriesQuery

Returns all entries for a plan, no expansion needed (the client expands recurrence for the calendar).

### ListMyScheduleQuery (trainer read-only view)

Currently expands by weekday. Updated to use a shared `RecurrenceExpander` static helper:

```
RecurrenceExpander.GetOccurrences(entry, windowStart, windowEnd)
  → IEnumerable<DateOnly>
```

Logic:
- `none` → yield `StartDate` if within window
- `daily` → step by 1 day from `StartDate` while ≤ `ValidUntil` (or window end)
- `weekly` → step by 7 days
- `every-n-days` → step by `RecurrenceInterval` days

`RecurrenceExpander` lives in `EduManage.Application/Features/ScheduleEntries/RecurrenceExpander.cs`.

### Auto-schedule confirm

The auto-scheduler currently emits entries with `DaysOfWeek`. Updated to emit:
- `StartDate` = first date in the plan's valid period matching the chosen weekday
- `RecurrenceType = "weekly"`
- `ValidUntil` = plan's end date (if known) or null

The assignment algorithm (which trainer/building/course fits where) is unchanged; only the output format changes. `SchedulePlan` currently has no explicit start date field, so when computing `StartDate` for auto-scheduled entries, the algorithm uses today's date (the confirm date) as the anchor and finds the next matching weekday from there.

### UpdateScheduleEntryCommand

Already exists. Drag-and-drop on the calendar calls this with updated `StartDate` + `StartTime`. `EndTime` is recomputed on the frontend from the original duration before the request is sent.

---

## Section 3 — Frontend Form (`ScheduleEntryFormModal`)

### Fields

**Trainer / Course / Building selectors** — unchanged. Course list still filtered to trainer's qualified courses.

**Date** — single `<input type="date">` for `StartDate`. Required for all entries (replaces the old recurring/one-off toggle).

**Time & duration:**
- Start time input (existing).
- Duration shortcut bar: `30m | 1h | 1.5h | 2h | Custom`. Clicking a preset computes `EndTime = StartTime + duration` and highlights the button. "Custom" leaves the end time input editable directly.
- End time input — always visible; presets just fill it in.

**Recurrence:**
- Segmented control: `Once | Daily | Weekly | Every N days`.
- Selecting "Every N days" reveals a small integer input (min 2, default 2).
- Selecting anything except "Once" reveals a `Valid until` date picker (optional).

### Files touched

- `ScheduleEntryFormModal.vue` — full rewrite of the form body.
- `ScheduleEntryCard.vue` — updated display: shows `StartDate`, recurrence label (`Weekly · until Jun 1`, `Every 3 days`, etc.) instead of weekday chips.
- `types/index.ts` — `ScheduleEntryCreate`, `ScheduleEntryOut` updated.
- `schedulePlanStore.ts` — `updateEntry` already exists; no store changes needed.

---

## Section 4 — Calendar View

### Placement

New **"Calendar"** tab on `OrganizerSchedulePlanDetailPage.vue`, alongside existing "Manual" and "Auto" tabs.

### Component: `ScheduleCalendarView.vue`

Extracted to `pages/organizer/schedule-plan-detail/components/ScheduleCalendarView.vue`.

### Layout

- 7 columns, Monday–Sunday.
- Time rows: 07:00–22:00, one row per 30 minutes = 30 rows.
- Row height: `40px` → 1 hour = `80px`.
- Sticky left column with time labels (`07:00`, `07:30`, …).
- Week navigation: "← Prev" / "Next →" buttons, label shows date range (e.g. `Jan 5 – Jan 11, 2026`).

### Occurrence expansion (client-side)

A `expandOccurrences(entries, weekStart, weekEnd)` composable returns a flat list of `{ entry, date }` pairs for the displayed week, using the same logic as the backend `RecurrenceExpander`:

- `none` → include if `StartDate` falls in the week.
- `daily` → include every day in the week (if within `ValidUntil`).
- `weekly` → include the weekday matching `StartDate`'s day-of-week (if within `ValidUntil`).
- `every-n-days` → step from `StartDate` by `RecurrenceInterval`; include dates in the week.

### Rendering entry blocks

For each `{ entry, date }`:
- **Top offset:** `(startMinutes − 420) × (80 / 60)` px (420 = 7 × 60).
- **Height:** `durationMinutes × (80 / 60)` px (min 20px).
- Background color: one of 6 preset colors assigned per `CourseId` (consistent across weeks).
- Shows: course name (truncated), trainer label (truncated).
- Mismatch entries get an amber left border.

### Drag-and-drop

Native HTML5 drag API — no library.

- Entry blocks: `draggable="true"`, `dragstart` stores `entryId` + grab offset within the block.
- Grid cells: `dragover` (preventDefault to allow drop), `drop` computes new `StartDate` and `StartTime` from column index + row index.
- On drop: call `store.updateEntry(planId, entryId, { ...entry, startDate: newDate, startTime: newTime, endTime: newEndTime })` where `newEndTime = newStartTime + originalDuration`.
- Optimistic update: entry moves immediately in the store; reverts on API error with a toast.

---

## Data Flow Summary

```
Form submit
  → ScheduleEntryCreate { startDate, startTime, endTime, recurrenceType, recurrenceInterval?, validUntil? }
  → POST /api/schedule-plans/{planId}/entries
  → AddScheduleEntryCommand → ScheduleEntry entity saved

Calendar week render
  → expandOccurrences(store.entries, weekStart, weekEnd)
  → renders blocks per occurrence

Calendar drag drop
  → store.updateEntry(planId, entryId, updatedEntry)
  → PUT /api/schedule-plans/{planId}/entries/{entryId}
  → UpdateScheduleEntryCommand → entity updated
```
