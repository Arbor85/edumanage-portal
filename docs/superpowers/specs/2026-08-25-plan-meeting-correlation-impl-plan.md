# Implementation Plan: Plan–Meeting Correlation

Reference spec: `2026-08-25-plan-meeting-correlation-design.md`

---

## Key constraint: PlanWorkout is JSON-serialized

`PlanWorkout` is stored as a JSON column inside `Plan` (see `PlanConfiguration`). Adding fields to `PlanWorkout` requires no EF migration — they serialize automatically. There is no separate `PlanWorkout` table.

`UpdatePlanCommand` regenerates all workout IDs (`Guid.NewGuid()`) on every save. The frontend must echo back `meetingId` in `PlanWorkoutInput` so the backend knows which meetings already exist for a given workout.

---

## Step 1 — `PlanWorkout.cs`: add 4 fields

**File:** `netbackend/src/EduManage.Domain/Entities/PlanWorkout.cs`

Add after existing fields:
```csharp
public bool IsMeeting { get; set; }
public string? MeetingId { get; set; }
public double? MeetingPrice { get; set; }
public string? MeetingStartTime { get; set; }   // "HH:mm", null → "00:00"
```

---

## Step 2 — `Dtos.cs`: update PlanWorkoutInput and PlanWorkoutOutput

**File:** `netbackend/src/EduManage.Application/Contracts/Dtos.cs`

Replace:
```csharp
public sealed record PlanWorkoutInput(
    string Name,
    string? Note,
    IReadOnlyList<RoutineExcercise> Excercises,
    string Date,
    IReadOnlyList<SupersetGroup>? SupersetGroups = null);
```
With:
```csharp
public sealed record PlanWorkoutInput(
    string Name,
    string? Note,
    IReadOnlyList<RoutineExcercise> Excercises,
    string Date,
    IReadOnlyList<SupersetGroup>? SupersetGroups = null,
    bool IsMeeting = false,
    string? MeetingId = null,
    double? MeetingPrice = null,
    string? MeetingStartTime = null);
```

Replace:
```csharp
public sealed record PlanWorkoutOutput(
    string Name,
    string? Note,
    string Id,
    string? UserId,
    IReadOnlyList<RoutineExcercise> Excercises,
    string Date,
    IReadOnlyList<SupersetGroup> SupersetGroups);
```
With:
```csharp
public sealed record PlanWorkoutOutput(
    string Name,
    string? Note,
    string Id,
    string? UserId,
    IReadOnlyList<RoutineExcercise> Excercises,
    string Date,
    IReadOnlyList<SupersetGroup> SupersetGroups,
    bool IsMeeting = false,
    string? MeetingId = null,
    double? MeetingPrice = null,
    string? MeetingStartTime = null);
```

---

## Step 3 — `ListPlansQuery.cs`: update MapToOut

**File:** `netbackend/src/EduManage.Application/Features/Plans/ListPlansQuery.cs`

In `MapToOut`, the `PlanWorkoutOutput` constructor call needs the 4 new fields appended:
```csharp
var workoutOutputs = plan.Workouts.Select(pw => new PlanWorkoutOutput(
    pw.Name, pw.Notes, pw.Id, pw.UserId,
    [.. pw.Exercises.Select(...)],
    pw.Date,
    JsonSerializer.Deserialize<List<SupersetGroup>>(pw.SupersetGroupsJson, SerializerOptions) ?? [],
    pw.IsMeeting,
    pw.MeetingId,
    pw.MeetingPrice,
    pw.MeetingStartTime)).ToList();
```

---

## Step 4 — `UpdatePlanCommand.cs`: meeting lifecycle

**File:** `netbackend/src/EduManage.Application/Features/Plans/UpdatePlanCommand.cs`

### 4a — Add IMeetingRepository dependency

Change handler constructor from:
```csharp
Handler(IPlanRepository repository, IClientRepository clientRepository)
```
To:
```csharp
Handler(IPlanRepository repository, IClientRepository clientRepository, IMeetingRepository meetingRepository)
```

Add using:
```csharp
using EduManage.Application.Features.Meetings;
```

### 4b — Collect old meeting IDs before replacing workouts

Before `plan.Workouts = [...]`, capture:
```csharp
var oldMeetingIds = plan.Workouts
    .Where(w => w.MeetingId != null)
    .Select(w => w.MeetingId!)
    .ToHashSet();
```

### 4c — Build new workouts with meeting lifecycle

Replace the current `plan.Workouts = [... request.Request.Workouts.Select(...)]` block with an async loop that:

```csharp
var newWorkouts = new List<PlanWorkout>();
var keptMeetingIds = new HashSet<string>();

foreach (var w in request.Request.Workouts)
{
    string? meetingId = w.MeetingId;

    if (w.IsMeeting && !string.IsNullOrWhiteSpace(plan.ClientId))
    {
        var startsAt = BuildStartsAt(w.Date, w.MeetingStartTime);
        var price = w.MeetingPrice ?? 0;

        if (meetingId == null)
        {
            // Create new meeting
            var meeting = new Meeting
            {
                Id = Guid.NewGuid().ToString("N"),
                ClientId = plan.ClientId,
                StartsAt = startsAt,
                Price = price,
                UserId = request.CurrentUserId
            };
            await meetingRepository.AddAsync(meeting, cancellationToken);
            meetingId = meeting.Id;
        }
        else
        {
            // Update existing meeting (date may have changed)
            var existing = await meetingRepository.GetByIdAsync(meetingId, cancellationToken);
            if (existing != null)
            {
                existing.StartsAt = startsAt;
                existing.Price = price;
                await meetingRepository.UpdateAsync(existing, cancellationToken);
            }
        }
        keptMeetingIds.Add(meetingId);
    }
    else if (!w.IsMeeting && meetingId != null)
    {
        // Toggle turned off — delete the meeting
        await meetingRepository.DeleteByIdAsync(meetingId, cancellationToken);
        meetingId = null;
    }

    newWorkouts.Add(new PlanWorkout
    {
        Id = Guid.NewGuid().ToString("N"),
        PlanId = plan.Id,
        Name = w.Name,
        Notes = w.Note,
        UserId = request.CurrentUserId,
        Date = w.Date,
        SupersetGroupsJson = JsonSerializer.Serialize(w.SupersetGroups ?? [], SerializerOptions),
        IsMeeting = w.IsMeeting && !string.IsNullOrWhiteSpace(plan.ClientId),
        MeetingId = meetingId,
        MeetingPrice = w.MeetingPrice,
        MeetingStartTime = w.MeetingStartTime,
        Exercises = [.. w.Excercises.Select(e => new RoutineExercise { ... })]
    });
}

// Delete meetings for workouts that were removed
foreach (var orphanId in oldMeetingIds.Except(keptMeetingIds))
{
    await meetingRepository.DeleteByIdAsync(orphanId, cancellationToken);
}

plan.Workouts = newWorkouts;
```

### 4d — Add BuildStartsAt helper (private static)

```csharp
private static string BuildStartsAt(string date, string? time)
{
    var t = string.IsNullOrWhiteSpace(time) ? "00:00" : time;
    return $"{date}T{t}:00";
}
```

### 4e — Change Handle to async-aware

The current `Handle` method builds `plan.Workouts` synchronously. Change the workout-building block to use `await` (already present — `Handle` returns `Task<PlanOut>`).

---

## Step 5 — `DeletePlanCommand.cs`: delete linked meetings

**File:** `netbackend/src/EduManage.Application/Features/Plans/DeletePlanCommand.cs`

Add `IMeetingRepository meetingRepository` to handler constructor.

Before `await repository.DeleteByIdAsync(...)`:
```csharp
foreach (var workout in plan.Workouts.Where(w => w.MeetingId != null))
{
    await meetingRepository.DeleteByIdAsync(workout.MeetingId!, cancellationToken);
}
```

---

## Step 6 — `AddPlanCommand.cs`: meetings on creation

**File:** `netbackend/src/EduManage.Application/Features/Plans/AddPlanCommand.cs`

Same as Step 4: add `IMeetingRepository`, iterate workouts, create meetings for any with `IsMeeting: true` and a non-null `ClientId`. Since new plans start with `Workouts` passed in the request, apply the same create-meeting logic before building the `Plan` entity.

---

## Step 7 — `types/index.ts`: add 4 fields to frontend types

**File:** `modern/src/types/index.ts`

Find `PlanWorkoutInput` and `PlanWorkoutOutput` interfaces and add:
```typescript
isMeeting?: boolean
meetingId?: string | null
meetingPrice?: number | null
meetingStartTime?: string | null   // "HH:mm"
```

---

## Step 8 — `PlanFormModal.vue`: meeting toggle UI

**File:** `modern/src/pages/PlansPage/components/PlanFormModal.vue`

### 8a — Initialize new fields when loading existing plan workouts (line ~218)

In the `.map((w) => ...)` that populates `form.value.workouts`:
```typescript
isMeeting: w.isMeeting ?? false,
meetingId: w.meetingId ?? null,
meetingPrice: w.meetingPrice ?? null,
meetingStartTime: w.meetingStartTime ?? null,
```

### 8b — Initialize new fields when adding a new blank workout (lines ~249, ~261)

Add to both push calls:
```typescript
isMeeting: false, meetingId: null, meetingPrice: null, meetingStartTime: null,
```

### 8c — Initialize new fields when copying a workout via calendar drag (onCellDrop, line ~180)

In the copy branch (`form.value.workouts.push({ ...src, ... })`), explicitly override:
```typescript
isMeeting: src.isMeeting ?? false,
meetingId: null,           // copied workout starts without a linked meeting
meetingPrice: src.meetingPrice ?? null,
meetingStartTime: src.meetingStartTime ?? null,
```

### 8d — Add meeting toggle section in per-workout edit surface (after Note field, ~line 435)

```html
<!-- Meeting toggle -->
<div class="flex flex-col gap-3 pt-1">
  <div class="flex items-center justify-between gap-3">
    <div>
      <p class="text-sm font-medium text-text-primary dark:text-white">Schedule as meeting</p>
      <p v-if="!form.clientId" class="text-xs text-text-secondary mt-0.5">
        Assign a client to the plan to enable
      </p>
    </div>
    <button
      type="button"
      :disabled="!form.clientId"
      class="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
      :class="form.workouts[index].isMeeting
        ? 'bg-primary'
        : 'bg-gray-200 dark:bg-white/20'"
      @click="!form.clientId ? null : (form.workouts[index].isMeeting = !form.workouts[index].isMeeting)"
    >
      <span
        class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
        :class="form.workouts[index].isMeeting ? 'translate-x-4' : 'translate-x-0'"
      />
    </button>
  </div>

  <template v-if="form.workouts[index].isMeeting">
    <div class="flex gap-3">
      <div class="flex-1 flex flex-col gap-1">
        <label class="text-xs font-medium text-text-secondary">Start time</label>
        <input
          type="time"
          :value="form.workouts[index].meetingStartTime ?? '09:00'"
          class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-sm text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary"
          @change="form.workouts[index].meetingStartTime = ($event.target as HTMLInputElement).value"
        />
      </div>
      <div class="flex-1 flex flex-col gap-1">
        <label class="text-xs font-medium text-text-secondary">Price</label>
        <input
          type="number"
          min="0"
          step="0.01"
          :value="form.workouts[index].meetingPrice ?? 0"
          placeholder="0"
          class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-sm text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary"
          @input="form.workouts[index].meetingPrice = parseFloat(($event.target as HTMLInputElement).value) || null"
        />
      </div>
    </div>
  </template>
</div>
```

---

## Implementation order

1. Step 1 — `PlanWorkout.cs`
2. Step 2 — `Dtos.cs`
3. Step 3 — `ListPlansQuery.cs` (MapToOut)
4. Step 4 — `UpdatePlanCommand.cs`
5. Step 5 — `DeletePlanCommand.cs`
6. Step 6 — `AddPlanCommand.cs`
7. Step 7 — `types/index.ts`
8. Step 8 — `PlanFormModal.vue`

Run `dotnet test` after Step 6, `npm run build` in `modern/` after Step 8.
