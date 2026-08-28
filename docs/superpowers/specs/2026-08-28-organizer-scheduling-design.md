# Organizer Role & Scheduling System — Design Spec

**Date:** 2026-08-28
**Status:** Approved for implementation

---

## Overview

Introduces a new `gym-organizer` Auth0 role that sits above trainers. An organizer owns an organization, invites trainers to join, manages buildings, defines availability windows for both trainers and buildings, associates trainers with courses they are qualified to teach, and creates schedule plans that assign trainer + building + course + time window. A schedule plan lifecycle is Draft → Published → Unpublished. Trainers see their published schedule entries read-only. An auto-scheduler generates a draft schedule from a curated set of courses, buildings, and trainers.

---

## Data Model

### Organization
```
Id: string (GUID)
Name: string
OwnerId: string          — Auth0 userId of the organizer
InviteCode: string       — GUID, regenerated on request
```

### OrganizationMembership
```
OrganizationId: string   — FK → Organization
TrainerUserId: string    — Auth0 userId of the trainer
JoinedAt: string         — ISO datetime
```
One row per trainer-org pair. A trainer can appear in multiple orgs.

### TrainerAvailability
```
Id: string (GUID)
OrganizationId: string   — FK → Organization (availability is org-scoped)
TrainerUserId: string
DaysOfWeek: List<string> — JSON: ["Monday", "Wednesday"]
StartTime: string        — HH:mm
EndTime: string          — HH:mm
ValidFrom: string        — ISO date
ValidTo: string          — ISO date
```
Multiple rows per trainer. One row = one recurring weekly pattern within a validity window.

### Building
```
Id: string (GUID)
OrganizationId: string   — FK → Organization
Name: string
Address: string
Capacity: int
```

### BuildingAvailability
```
Id: string (GUID)
BuildingId: string       — FK → Building
DaysOfWeek: List<string> — JSON
StartTime: string        — HH:mm
EndTime: string          — HH:mm
ValidFrom: string        — ISO date
ValidTo: string          — ISO date
```
Same structure as TrainerAvailability.

### TrainerCourseAssociation
```
Id: string (GUID)
OrganizationId: string
TrainerUserId: string
CourseId: string         — FK → existing Course entity
```
Organizer declares which courses each trainer is qualified to teach.

### SchedulePlan
```
Id: string (GUID)
OrganizationId: string
Name: string
Status: string           — "Draft" | "Published"
CreatedAt: string        — ISO datetime
```

### ScheduleEntry
```
Id: string (GUID)
SchedulePlanId: string   — FK → SchedulePlan
TrainerUserId: string
BuildingId: string
CourseId: string
IsRecurring: bool

— if IsRecurring = true:
DaysOfWeek: List<string> — JSON
StartTime: string        — HH:mm
EndTime: string          — HH:mm
ValidFrom: string        — ISO date
ValidTo: string          — ISO date

— if IsRecurring = false:
Date: string             — ISO date
StartTime: string        — HH:mm
EndTime: string          — HH:mm

HasMismatch: bool        — true when entry is outside trainer/building declared availability
```

---

## Backend API

### Auth0 Permissions
- `manage:organization` — required for all organizer write endpoints
- `view:schedule` — required for trainer read-only schedule endpoint
- Existing `manage:clients` permission unchanged

### Organization Endpoints
```
POST   /api/organizations                         — create org; caller becomes owner
GET    /api/organizations/mine                    — get my org + trainer count
POST   /api/organizations/invite                  — generate/rotate InviteCode; returns invite URL
POST   /api/organizations/join/{code}             — trainer joins org (gym-trainer role required)
GET    /api/organizations/trainers                — list trainers in my org
DELETE /api/organizations/trainers/{trainerId}    — remove trainer from org
```

### Trainer Availability (organizer manages on trainer's behalf)
```
GET    /api/organizations/trainers/{trainerId}/availability
POST   /api/organizations/trainers/{trainerId}/availability
PUT    /api/organizations/trainers/{trainerId}/availability/{id}
DELETE /api/organizations/trainers/{trainerId}/availability/{id}
```

### Buildings
```
GET    /api/buildings
POST   /api/buildings
PUT    /api/buildings/{id}
DELETE /api/buildings/{id}
GET    /api/buildings/{id}/availability
POST   /api/buildings/{id}/availability
PUT    /api/buildings/{id}/availability/{availId}
DELETE /api/buildings/{id}/availability/{availId}
```

### Trainer–Course Associations
```
GET    /api/organizations/trainer-courses                        — list all associations in org
POST   /api/organizations/trainer-courses                        — body: { trainerId, courseId }
DELETE /api/organizations/trainer-courses/{id}
```

### Schedule Plans
```
GET    /api/schedule-plans
POST   /api/schedule-plans
PUT    /api/schedule-plans/{id}
DELETE /api/schedule-plans/{id}
POST   /api/schedule-plans/{id}/publish
POST   /api/schedule-plans/{id}/unpublish
```

### Schedule Entries
```
GET    /api/schedule-plans/{planId}/entries
POST   /api/schedule-plans/{planId}/entries
PUT    /api/schedule-plans/{planId}/entries/{entryId}
DELETE /api/schedule-plans/{planId}/entries/{entryId}
```

### Auto-Scheduler
```
POST   /api/schedule-plans/{planId}/auto-schedule
       Request:  { courseIds: string[], buildingIds: string[], trainerIds: string[] }
       Response: {
         scheduled: ScheduleEntryOut[],
         unscheduled: { courseId: string, courseName: string, reason: string }[]
       }
       — does NOT persist; returns proposal only

POST   /api/schedule-plans/{planId}/auto-schedule/confirm
       Request:  { entries: ScheduleEntryCreate[] }
       — persists confirmed entries; replaces any auto-generated entries in the plan
```

### Trainer Read-Only Schedule
```
GET    /api/my-schedule   — published ScheduleEntry rows where TrainerUserId = current user
```

---

## Auto-Scheduling Algorithm

Runs synchronously in a MediatR handler. No background jobs.

**Input:** organizer-selected subset of courseIds, buildingIds, trainerIds within the org.

**Step 1 — Build working sets**
Load from DB:
- `TrainerCourseAssociation` rows for selected trainers (qualified trainer→course pairs)
- `TrainerAvailability` rows for selected trainers
- `BuildingAvailability` rows for selected buildings
- Existing `ScheduleEntry` rows in this plan (conflict baseline)

**Step 2 — For each course, find a valid slot**

```
for each course in courseIds:
  candidates = trainers where TrainerCourseAssociation(trainer, course) exists
  for each candidate trainer:
    for each building in buildingIds:
      slots = intersect(trainerAvailability, buildingAvailability)
               where ValidFrom–ValidTo windows overlap
               and DaysOfWeek sets intersect
      for each slot:
        if no conflict with already-scheduled entries (same trainer or building at overlapping time):
          → schedule here; mark HasMismatch = false; break
  if no valid slot found after all candidates and buildings:
    → add to unscheduled[]
```

**Conflict resolution priority:** prefer earlier slots, prefer trainers with fewer scheduled entries (most available first).

**Step 3 — Output**
- Valid slot found → `scheduled[]` with `HasMismatch = false`
- No slot at all → `unscheduled[]` with one of:
  - `"No qualified trainer in selection"`
  - `"No overlapping availability between trainer and building"`
  - `"All available slots conflict with existing entries"`

**Note:** `HasMismatch = true` is only set when organizer manually creates an entry outside declared availability. Auto-scheduler never produces mismatched entries — it only schedules within declared availability windows.

---

## Frontend

### Role Gating
- `gym-organizer` role → show Organizer nav section, hide trainer nav
- `gym-trainer` role → show existing trainer nav + new "My Schedule" item
- Detected via `https://edumanage.app/roles` claim in Auth0 token (existing pattern in `authStore.ts`)

### New Pages (`src/pages/organizer/`)

**`OrganizerDashboardPage.vue`**
Summary cards: trainer count, building count, active (published) plan count, total unscheduled course count across all plans.

**`OrganizerTrainersPage.vue`**
- List of org trainers
- Invite link generator: "Generate Invite Link" button → copies URL to clipboard; regenerates `InviteCode`
- Per trainer row: expand panel with two sub-sections:
  - Availability slots — inline add/edit/delete rows (`DaysOfWeek` multi-select, time range, date range)
  - Qualified courses — multi-select from org's courses; saves as `TrainerCourseAssociation` records

**`OrganizerBuildingsPage.vue`**
- List + modal create/edit for buildings (name, address, capacity)
- Per building row: expand panel with availability slots (same inline pattern as trainer availability)

**`OrganizerSchedulePlansPage.vue`**
- List of plans with status badge (Draft / Published)
- Create plan button → modal with name field
- Click plan → navigate to detail page

**`OrganizerSchedulePlanDetailPage.vue`**
Header: plan name, status badge, Publish / Unpublish button (disabled if plan has no entries).

Two tabs:

*Manual tab*
- Table of current schedule entries (trainer, building, course, time window, mismatch badge)
- Add entry form:
  - Trainer dropdown (org trainers)
  - Course dropdown (filtered to trainer's `TrainerCourseAssociation` qualifications)
  - Building dropdown
  - Toggle: One-off (date picker + start/end time) or Recurring (days of week multi-select + start/end time + valid from/to)
  - On save: backend computes `HasMismatch`; if true, entry saves with amber warning badge inline
- Edit / delete per row

*Auto tab*
- Three multi-select lists: Courses (from org), Buildings, Trainers
- "Generate Schedule" button → calls `POST /auto-schedule` → shows preview:
  - Scheduled entries table (same columns as manual tab)
  - Unscheduled list with course name + reason, styled in red
  - Mismatch entries highlighted in amber (none expected from auto, but shown defensively)
- "Confirm & Save" button → calls `/auto-schedule/confirm` → switches to Manual tab showing persisted entries

### New Trainer Page

**`MySchedulePage.vue`**
- Read-only published schedule entries for the current trainer
- List view (course name, building name + address, time window) + calendar toggle (reuses `MeetingCalendar` component pattern)
- No edit controls
- Empty state: "No schedule has been published for you yet"

### New Stores & Services

| File | Purpose |
|------|---------|
| `src/stores/organizerStore.ts` | org, trainers, buildings, availabilities, trainer-course associations |
| `src/stores/schedulePlanStore.ts` | plans, entries, auto-schedule proposal state |
| `src/stores/myScheduleStore.ts` | trainer's read-only published entries |
| `src/services/organizerApi.ts` | API calls for all organizer endpoints |
| `src/services/schedulePlanApi.ts` | API calls for plans, entries, auto-schedule |
| `src/services/myScheduleApi.ts` | API call for `/api/my-schedule` |

---

## Backend Architecture (following existing patterns)

**New repository interfaces** (`EduManage.Application/Contracts/`):
- `IOrganizationRepository`
- `IOrganizationMembershipRepository`
- `ITrainerAvailabilityRepository`
- `IBuildingRepository`
- `IBuildingAvailabilityRepository`
- `ITrainerCourseAssociationRepository`
- `ISchedulePlanRepository`
- `IScheduleEntryRepository`

**New EF configurations** (`EduManage.Infrastructure/Persistence/Configurations/`):
- One `IEntityTypeConfiguration<T>` per entity
- `DaysOfWeek` stored as JSON via `ValueConverter<List<string>, string>` (existing pattern)

**New MediatR features** (`EduManage.Application/Features/`):
- `Organizations/` — CRUD + invite + join commands/queries
- `TrainerAvailability/` — CRUD commands/queries
- `Buildings/` — CRUD commands/queries
- `BuildingAvailability/` — CRUD commands/queries
- `TrainerCourseAssociations/` — CRUD commands/queries
- `SchedulePlans/` — CRUD + publish/unpublish commands/queries
- `ScheduleEntries/` — CRUD commands/queries
- `AutoSchedule/` — `AutoScheduleCommand` + `ConfirmAutoScheduleCommand`

**New controllers** (`EduManage.Api/Controllers/`):
- `OrganizationsController`
- `BuildingsController`
- `SchedulePlansController`
- `MyScheduleController`

---

## Out of Scope

- Notifications to trainers when a schedule is published
- Trainer ability to accept/reject schedule entries
- Multi-organizer ownership of a single organization
- Conflict resolution across multiple organizations (trainer in two orgs)
- Audit trail for mismatch overrides
