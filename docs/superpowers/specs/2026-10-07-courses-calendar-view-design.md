# Courses Calendar View — Design Spec

**Date:** 2026-10-07  
**Status:** Approved  

---

## Overview

Add a Calendar view to the existing Courses page, giving coaches a date-aware way to see when all their course slots occur. Calendar sits alongside the existing List and Kanban views as a third toggle option. Within the calendar, a month/week sub-toggle lets the user switch between a monthly overview and a detailed weekly time grid.

---

## Architecture

### New files

```
modern/src/pages/CoursesPage/components/
  CourseCalendarView.vue        ← container: month/week sub-toggle + prev/next/today navigation
  CourseCalendarMonthView.vue   ← monthly 7-column grid with day chips
  CourseCalendarWeekView.vue    ← 7-column time grid (08:00–21:00), 40px/hour

modern/src/composables/
  useCoursesCalendar.ts         ← slot expansion: recurring availability rules → specific date occurrences
```

### Changed files

- `CoursesPage.vue` — add "Calendar" to the view-toggle; render `CourseCalendarView` when active
- No router changes, no new API endpoints, no new store state

### Data flow

The course store already loads all courses with their availability slots. `CourseCalendarView` reads directly from the store — no additional fetches. The `useCoursesCalendar` composable receives courses + the current visible date range as inputs and returns computed occurrences.

---

## Data Layer — `useCoursesCalendar.ts`

### Output type

```ts
interface CalendarOccurrence {
  date: Date
  course: CourseOut
  slot: CourseAvailabilityOut
}
```

### Slot expansion logic

`expandSlots(courses: CourseOut[], range: { from: Date; to: Date }): CalendarOccurrence[]`

For each course → for each availability slot:
1. Iterate every calendar day in `range`
2. Check if the day's weekday matches any entry in `slot.daysOfWeek`
3. Skip if the day is before `slot.validFrom` (when set)
4. Skip if the day is after `slot.validTo` (when set)
5. Emit a `CalendarOccurrence` for matching days

### Color assignment

Each course is assigned a color by its index in the course list, cycling through the same 8-color palette already used in `ScheduleCalendarView`. Color is stable for the lifetime of the page load.

### Exposed composable API

```ts
const { monthOccurrences, weekOccurrences, visibleRange } = useCoursesCalendar()
// monthOccurrences: computed — occurrences for the displayed month
// weekOccurrences:  computed — occurrences for the displayed week
// visibleRange:     reactive { from, to } updated by navigation actions
```

---

## `CourseCalendarView.vue` — Container

Owns:
- Current sub-view mode: `'month' | 'week'`
- Current anchor date (drives `visibleRange` in the composable)
- Navigation: prev / next / today buttons
- Header label: "October 2026" (month mode) or "6 – 12 Oct 2026" (week mode)
- Month/week sub-toggle

Renders either `CourseCalendarMonthView` or `CourseCalendarWeekView` based on mode, passing the relevant occurrences slice.

---

## `CourseCalendarMonthView.vue`

### Layout

7-column CSS grid (Mon → Sun). Each day cell:
- Day number in the top-left corner; today's date highlighted with a filled circle
- Days outside the current month rendered in a muted colour
- Up to **2 chips** per cell; overflow collapses to a "+N more" link

### Chip format

```
Photography · 09:00
```
Left border in the course colour, translucent background tint.

### "+N more" behaviour

Clicking "+N more" opens a small popover listing all remaining chips for that day. Each item in the popover is also clickable to open the detail popover.

### Detail popover (on chip click)

Shows:
- Course name
- Type badge (online / in-person / hybrid)
- Time range (e.g. 09:00 – 11:00)
- Days of week (e.g. Mon, Tue, Thu)

Dismisses on click-outside or Escape.

### Legend

A colour legend strip below the grid shows all courses present in the current month view.

---

## `CourseCalendarWeekView.vue`

### Layout

CSS grid: 48px time-label column + 7 equal day columns. Visible time range: **08:00 – 21:00** (scrollable). Row height: **40px per hour**.

### Block positioning

```
top    = (startHour - 8) * 40 + startMinute * (40 / 60)   [px]
height = durationMinutes * (40 / 60)                        [px]
```

Block content: course name (bold) + time range (smaller, muted). Left border in course colour, translucent background tint.

### Overlapping slots

When two or more slots occupy the same day column at the same time, they are split into equal-width lanes side by side (simple two-lane split; more than two lanes also split equally).

### Slots spanning past 21:00

Clipped at the 21:00 boundary — block height is capped so it does not overflow the grid.

### Detail popover (on block click)

Same content as the month view popover (course name, type, time range, days of week). Dismisses on click-outside or Escape.

### Legend

Same colour legend strip below the grid.

---

## Edge Cases

| Scenario | Behaviour |
|---|---|
| Course has no availability slots | Not shown in calendar |
| `validFrom` / `validTo` filtering | Occurrences outside the window are silently skipped |
| All slots outside visible range | Day cell / time column remains empty |
| Slot crosses midnight (e.g. 23:00–01:00) | Block clipped at 21:00 grid boundary |
| Two+ courses at same time, same day | Side-by-side lane split in week view; each gets its own chip in month view |

---

## Out of Scope

- Creating or editing courses/slots from the calendar (use existing List view modals)
- Drag-and-drop rescheduling
- Client-facing calendar (this is the coach view only)
- Printing / export
