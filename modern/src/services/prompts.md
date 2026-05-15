# Missing Backend Endpoints

## Workout History

**Endpoint needed:** GET /api/history
**Purpose:** List WorkoutHistoryOut[] for the authenticated user
**Request body:** none
**Expected response:**
```json
[
  {
    "id": "uuid",
    "currentUserId": "auth0|...",
    "mode": "routine",
    "startedAt": "2024-01-15T10:00:00Z",
    "completedAt": "2024-01-15T11:00:00Z",
    "durationSeconds": 3600,
    "totalSets": 20,
    "completedSets": 18,
    "excercises": [...],
    "sourceWorkout": { "id": "uuid", "name": "Push Day", "date": "2024-01-15" }
  }
]
```
**Testing:**
```
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/history
```

---

## Exercise Cover Image

**Endpoint needed:** ExcerciseOut.imageUrl — string field on exercise
**Purpose:** Exercise card background image URL for the grid view
**Request body:** n/a — field to add to ExcerciseOut schema
**Expected response:** URL string, e.g. "https://storage.example.com/exercises/bench-press.jpg"
**Testing:** GET /api/excercises and verify imageUrl is present in response items

---

## Exercise Difficulty

**Endpoint needed:** ExcerciseOut.difficulty — "Beginner" | "Intermediate" | "Advanced"
**Purpose:** Explicit difficulty level for DifficultyBadge display (currently derived from tags)
**Request body:** n/a — field to add to ExcerciseOut schema + ExcerciseWriteRequest
**Expected response:** one of "Beginner", "Intermediate", "Advanced"
**Testing:** GET /api/excercises and verify difficulty field is populated

---

## Weekly Stats

**Endpoint needed:** GET /api/stats/weekly
**Purpose:** Workout time, calories burned, completed workouts, avg heart rate for current + previous week; used for StatCardRow delta badges on Dashboard
**Request body:** none
**Expected response:**
```json
{
  "thisWeek": {
    "workoutTimeMinutes": 180,
    "caloriesBurned": 1200,
    "completedWorkouts": 4,
    "avgHeartRate": 145
  },
  "lastWeek": {
    "workoutTimeMinutes": 160,
    "caloriesBurned": 1100,
    "completedWorkouts": 3,
    "avgHeartRate": 140
  }
}
```
**Testing:**
```
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/stats/weekly
```

---

## Nutrition (v2)

**Endpoint needed:** GET /api/nutrition/today
**Purpose:** Today's protein/water/meal data for DailyProgressCard and TodaysMealPlanCard on Dashboard
**Request body:** none
**Expected response:**
```json
{
  "proteinGrams": 120,
  "proteinTargetGrams": 150,
  "waterLitres": 2.4,
  "waterTargetLitres": 3.0,
  "meals": [
    { "name": "Breakfast", "calories": 400 },
    { "name": "Lunch", "calories": 600 },
    { "name": "Dinner", "calories": 700 }
  ]
}
```
**Testing:**
```
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/nutrition/today
```
**Note:** Dashboard renders placeholder values until this endpoint is available. Mark as v2.
