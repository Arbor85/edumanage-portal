# Backend Changes: activityType + activityTrackType on Exercise

## Context

The frontend has been updated to replace the `isBodyweight: bool` property on exercises with two new enums:
- `activityType` — how the exercise is performed
- `activityTrackType` — what metric is tracked per set

Sets now also carry `duration` (seconds) and `distance` (meters) fields alongside `reps` and `weight`.

---

## 1. New Enums

```csharp
public enum ActivityType
{
    Weighted,    // free weights, barbells, dumbbells
    Machine,     // cable/pulley machines, fixed-path equipment
    Bodyweight,  // body weight — no added load
    Cardio       // running, cycling, rowing, etc.
}

public enum ActivityTrackType
{
    Repetitions, // count reps per set
    Time,        // track duration in seconds
    Distance     // track distance in meters
}
```

---

## 2. Changes to `Exercise` entity

**Remove:** `IsBodyweight`  
**Add:**
```csharp
public ActivityType ActivityType { get; set; } = ActivityType.Weighted;
public ActivityTrackType ActivityTrackType { get; set; } = ActivityTrackType.Repetitions;
```

**Migration:** populate `ActivityType` from the old `IsBodyweight`:
```sql
UPDATE Exercises
SET ActivityType = CASE WHEN IsBodyweight = 1 THEN 2 ELSE 0 END; -- 2 = Bodyweight, 0 = Weighted
```

---

## 3. Changes to `RoutineExercise` / embedded exercise in Routine

**Remove:** `IsBodyweight`  
**Add:**
```csharp
public ActivityType ActivityType { get; set; } = ActivityType.Weighted;
public ActivityTrackType ActivityTrackType { get; set; } = ActivityTrackType.Repetitions;
```

Same migration logic as above for any stored routines.

---

## 4. Changes to `RoutineSet` (and `WorkoutSet` / `CompletedSet`)

**Add:**
```csharp
public int? Duration { get; set; }   // seconds, non-null when ActivityTrackType = Time
public int? Distance { get; set; }   // meters, non-null when ActivityTrackType = Distance
```

---

## 5. API DTOs

### ExerciseOut (GET response)
Remove `isBodyweight`, add:
```json
{
  "activityType": "weighted",       // "weighted" | "machine" | "bodyweight" | "cardio"
  "activityTrackType": "repetitions" // "repetitions" | "time" | "distance"
}
```

### ExerciseWriteRequest (POST/PUT body)
Remove `isBodyweight`, add same two fields.

### RoutineExercise (embedded in RoutineOut, RoutineCreate, RoutineUpdate)
Remove `isBodyweight`, add same two fields.

### RoutineSet (embedded in all routine DTOs)
Add:
```json
{
  "duration": null,   // int? seconds
  "distance": null    // int? meters
}
```

### CompletedRoutineExercise (in WorkoutHistoryOut and CompleteRoutineCreate)
Remove `isBodyweight`, add `activityType` and `activityTrackType`.

### CompletedRoutineSet
Add `duration` and `distance` fields.

---

## 6. DefaultWorkout entity (if not already updated)

Same changes as `RoutineExercise` above — replace `isBodyweight` with `activityType` + `activityTrackType` on embedded exercises.

---

## 7. Migration notes

- Write a migration that converts existing `IsBodyweight = true` → `ActivityType = Bodyweight`, `IsBodyweight = false` → `ActivityType = Weighted`
- Default `ActivityTrackType = Repetitions` for all existing records
- `Duration` and `Distance` columns are nullable — no backfill needed
- After migration, drop `IsBodyweight` column from all relevant tables

---

## 8. Enum serialization

Use camelCase string serialization for the JSON API (not integers):
```
ActivityType.Weighted   → "weighted"
ActivityType.Machine    → "machine"
ActivityType.Bodyweight → "bodyweight"
ActivityType.Cardio     → "cardio"

ActivityTrackType.Repetitions → "repetitions"
ActivityTrackType.Time        → "time"
ActivityTrackType.Distance    → "distance"
```
