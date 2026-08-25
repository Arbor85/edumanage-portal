# Plan–Meeting Correlation

**Date:** 2026-08-25

## Problem

Plans contain scheduled workouts (PlanWorkout) with dates. Meetings are separate client sessions. Currently there is no link between the two — a trainer scheduling a workout on a specific date has no way to simultaneously create a corresponding client meeting.

## Goal

When a trainer schedules a workout within a plan, they can mark it as a meeting. The system then auto-creates, auto-updates, and auto-deletes the corresponding meeting as the workout is managed. The trainer sees a simple toggle with optional price and start time fields; the backend handles all meeting lifecycle automatically.

## Decisions

- **Same client as the plan** — meetings inherit `ClientId` from the plan; no per-workout client selection.
- **Backend-orchestrated** — all meeting create/update/delete logic lives in the backend plan handlers. The frontend sends meeting config fields as part of the normal plan save; no direct calls to the meetings API from the plan UI.
- **Regular meetings** — auto-created meetings are plain `Meeting` records; no special type or flag on the meeting side.
- **Date sync** — when a workout's date changes, the linked meeting's `StartsAt` updates automatically as part of the plan save.

---

## Data Model

### Backend — `PlanWorkout` entity (new fields)

| Field | Type | Default | Purpose |
|---|---|---|---|
| `IsMeeting` | `bool` | `false` | Whether this workout generates a meeting |
| `MeetingId` | `string?` | `null` | ID of the auto-created meeting |
| `MeetingPrice` | `double?` | `null` (→ 0) | Price passed to the meeting |
| `MeetingStartTime` | `string?` | `null` (→ "00:00") | Time portion of `StartsAt` (HH:mm) |

`Meeting` entity is unchanged.

### Frontend — `PlanWorkoutInput` / `PlanWorkoutOutput` (new fields)

```typescript
isMeeting: boolean
meetingId: string | null
meetingPrice: number | null
meetingStartTime: string | null   // "HH:mm" or null
```

---

## Backend Logic

All meeting lifecycle is handled in two existing command handlers.

### `UpdatePlanCommand` handler

After persisting workouts, diff incoming vs previous workout state:

| Condition | Action |
|---|---|
| `isMeeting: true` + no `MeetingId` | Create meeting: `ClientId` from plan, `StartsAt` = workout `Date` + `MeetingStartTime` (default `"00:00"`), `Price` = `MeetingPrice` (default `0`). Store returned ID in `PlanWorkout.MeetingId`. |
| `isMeeting: false` + existing `MeetingId` | Delete meeting. Clear `MeetingId`. |
| `isMeeting: true` + `MeetingId` exists + date changed | Update meeting `StartsAt` to new date + stored `MeetingStartTime`. |
| Workout removed + had `MeetingId` | Delete meeting. |

### `DeletePlanCommand` handler

Before deleting the plan, iterate all workouts. For any workout with a `MeetingId`, delete the corresponding meeting.

---

## Frontend Changes

### `types/index.ts`

Add four fields to `PlanWorkoutInput` and `PlanWorkoutOutput`:
`isMeeting`, `meetingId`, `meetingPrice`, `meetingStartTime`.

### `PlanFormModal.vue`

Within the per-workout edit surface:

1. **Toggle row** — "Schedule as meeting". Disabled (with tooltip) if the plan has no `clientId`.
2. **Conditional fields** (shown only when toggle is on):
   - **Start time** — time input, placeholder `09:00`
   - **Price** — number input, placeholder `0`

These fields are sent as part of the normal plan save payload. No additional API calls.

When a workout date changes (date picker or calendar drag-and-drop), `isMeeting` and the new date are included in the save — the backend updates `StartsAt` automatically.

The meeting store requires no changes; created/updated/deleted meetings appear correctly the next time the meetings page loads.

---

## Files Touched

| Layer | File |
|---|---|
| Backend entity | `EduManage.Domain/Entities/PlanWorkout.cs` |
| Backend EF config | `EduManage.Infrastructure/Persistence/Configurations/PlanWorkoutConfiguration.cs` |
| Backend DTOs | `EduManage.Application/Contracts/Dtos.cs` |
| Backend handler | `EduManage.Application/Features/Plans/UpdatePlan/UpdatePlanCommandHandler.cs` |
| Backend handler | `EduManage.Application/Features/Plans/DeletePlan/DeletePlanCommandHandler.cs` |
| Frontend types | `modern/src/types/index.ts` |
| Frontend UI | `modern/src/pages/PlansPage/components/PlanFormModal.vue` |
