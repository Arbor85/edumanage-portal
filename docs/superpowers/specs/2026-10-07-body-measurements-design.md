# Body Measurements Tracking — Design Spec

**Date:** 2026-10-07  
**Status:** Approved  

---

## Overview

Add a Measurements tab to the existing Progress page where users can log body metrics over time (weight, waist, thigh, bicep, chest, butt, blood pressure) and visualize trends as a multi-axis line chart with a tabular history below.

---

## Architecture

### Backend — new files

```
EduManage.Domain/Entities/
  BodyMeasurement.cs

EduManage.Application/
  Contracts/IBodyMeasurementRepository.cs
  Features/BodyMeasurements/
    LogBodyMeasurementCommand.cs
    ListBodyMeasurementsQuery.cs
    DeleteBodyMeasurementCommand.cs

EduManage.Infrastructure/Persistence/
  Configurations/BodyMeasurementConfiguration.cs
  Repositories/BodyMeasurementRepository.cs

EduManage.Api/Controllers/
  BodyMeasurementsController.cs
```

### Frontend — new files

```
src/services/
  bodyMeasurementsApi.ts

src/stores/
  bodyMeasurementStore.ts

src/pages/ProgressPage/components/
  MeasurementsTab.vue
  MeasurementLogForm.vue
  MeasurementList.vue
  MeasurementChart.vue
```

### Changed files

- `src/types/index.ts` — add `BodyMeasurementOut`, `BodyMeasurementCreate`
- `src/pages/ProgressPage.vue` — add Measurements tab

---

## Data Model

### Domain Entity

```csharp
public class BodyMeasurement
{
    public string Id { get; set; }
    public string UserId { get; set; }
    public DateOnly Date { get; set; }
    public float? WeightKg { get; set; }
    public float? WaistCm { get; set; }
    public float? ThighCm { get; set; }
    public float? BicepCm { get; set; }
    public float? ChestCm { get; set; }
    public float? ButtCm { get; set; }
    public int? SystolicMmHg { get; set; }
    public int? DiastolicMmHg { get; set; }
}
```

All metric fields are nullable — a user only logs what they measured on a given day. At least one metric field must be non-null (enforced by FluentValidation).

### API DTOs

```csharp
record BodyMeasurementOut(
    string Id,
    string Date,           // ISO date YYYY-MM-DD
    float? WeightKg,
    float? WaistCm,
    float? ThighCm,
    float? BicepCm,
    float? ChestCm,
    float? ButtCm,
    int? SystolicMmHg,
    int? DiastolicMmHg
);

record BodyMeasurementCreate(
    string Date,
    float? WeightKg,
    float? WaistCm,
    float? ThighCm,
    float? BicepCm,
    float? ChestCm,
    float? ButtCm,
    int? SystolicMmHg,
    int? DiastolicMmHg
);
```

### Frontend Types

```typescript
interface BodyMeasurementOut {
  id: string
  date: string           // YYYY-MM-DD
  weightKg: number | null
  waistCm: number | null
  thighCm: number | null
  bicepCm: number | null
  chestCm: number | null
  buttCm: number | null
  systolicMmHg: number | null
  diastolicMmHg: number | null
}

interface BodyMeasurementCreate {
  date: string
  weightKg: number | null
  waistCm: number | null
  thighCm: number | null
  bicepCm: number | null
  chestCm: number | null
  buttCm: number | null
  systolicMmHg: number | null
  diastolicMmHg: number | null
}
```

---

## API

```
POST   /api/body-measurements        create a new entry (auth required)
GET    /api/body-measurements        list current user's entries, date desc
DELETE /api/body-measurements/:id    delete one entry (must belong to current user)
```

No update endpoint — incorrect entries are deleted and re-entered.

### Authorization

All three endpoints require JWT Bearer auth. Handlers read `UserId` from `ICurrentUserService` — users can only read and delete their own entries.

---

## Backend Implementation

### `ListBodyMeasurementsQuery`

- Filters by `UserId == currentUser.UserId`
- Orders by `Date` descending
- Returns `IReadOnlyList<BodyMeasurementOut>`

### `LogBodyMeasurementCommand`

- Accepts `BodyMeasurementCreate`
- Sets `UserId` from `ICurrentUserService`
- Validates: at least one metric field must be non-null
- Returns `BodyMeasurementOut`

### `DeleteBodyMeasurementCommand`

- Accepts entry `id`
- Verifies `UserId` matches current user before deleting (returns 404 if not found or not owned)

### EF Configuration

Simple flat table `BodyMeasurements`. `Date` stored as `date` column type. All metric columns nullable.

---

## Frontend Implementation

### `bodyMeasurementsApi.ts`

Three functions mirroring the API surface: `listMeasurements()`, `logMeasurement(data)`, `deleteMeasurement(id)`.

### `bodyMeasurementStore.ts`

Pinia store:
- `measurements: BodyMeasurementOut[]`
- `isLoading: boolean`
- `fetch()`, `log(data)`, `remove(id)`

### `MeasurementsTab.vue`

Container. Calls `store.fetch()` on mount. Renders `MeasurementLogForm` → `MeasurementChart` → `MeasurementList` top to bottom.

### `MeasurementLogForm.vue`

- Date input defaulting to today (`new Date().toISOString().slice(0, 10)`)
- Grid of 7 inputs: Weight (kg), Waist (cm), Thigh (cm), Bicep (cm), Chest (cm), Butt (cm), and Systolic/Diastolic side-by-side (mmHg)
- All inputs optional — user fills only what they measured
- "Log" button: calls `store.log()`, clears inputs on success, shows toast on error
- Client-side guard: at least one field must be filled before submit is enabled

### `MeasurementChart.vue`

Chart.js line chart with the following behavior:

**Metric definitions** (8 total):

| Key | Label | Unit | Color |
|-----|-------|------|-------|
| weightKg | Weight | kg | #6c63ff |
| waistCm | Waist | cm | #0891b2 |
| thighCm | Thigh | cm | #16a34a |
| bicepCm | Bicep | cm | #d97706 |
| chestCm | Chest | cm | #dc2626 |
| buttCm | Butt | cm | #db2777 |
| systolicMmHg | Systolic BP | mmHg | #7c3aed |
| diastolicMmHg | Diastolic BP | mmHg | #2563eb |

**Metric selector:** A row of colored toggle chips above the chart. Only metrics that have at least one non-null data point are shown. Clicking a chip toggles that metric's line and Y-axis.

**Y-axes:** Each active metric gets its own Y-axis. Axes alternate left/right to avoid crowding (first active = left, second = right, third = left, etc.).

**X-axis:** Dates sorted ascending. Only dates where the metric has a value are connected — gaps are not interpolated (`spanGaps: false`).

**Empty state:** If no measurements exist yet, show a friendly prompt to log the first entry.

### `MeasurementList.vue`

Table with columns: Date | Weight | Waist | Thigh | Bicep | Chest | Butt | BP | ✕

- Metrics not logged on a given day shown as `—`
- Blood pressure shown as `120/80` (systolic/diastolic); if only one value is present, shown as `120/—` or `—/80`
- Delete button per row — no confirmation dialog (entries are trivial to re-enter)
- Rows sorted newest first (same order as store)

---

## Edge Cases

| Scenario | Behaviour |
|---|---|
| All fields empty on submit | Submit button disabled; no request sent |
| Only one of systolic/diastolic filled | Allowed — stored as partial; chart shows only the filled line |
| Duplicate date entry | Allowed — multiple entries per day are valid |
| No measurements yet | Chart shows empty state prompt; list shows empty state message |
| Delete own entry | Removed immediately from store and list |
| Delete another user's entry | Backend returns 404 |

---

## Out of Scope

- Editing an existing entry (delete and re-enter)
- Units toggle (imperial / metric)
- Coach viewing a client's body measurements
- Goal targets overlaid on the chart
- Export to CSV
