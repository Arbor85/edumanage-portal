# UX Redesign — Backend Endpoint Specs

Generate the following endpoints in the .NET backend (`netbackend/`).
All endpoints require Auth0 JWT Bearer authentication unless stated otherwise.
Follow existing Clean Architecture patterns: Controller → MediatR Command/Query → Handler → Repository.

---

## 1. User Profile

### GET /api/users/profile
Returns the current authenticated user's profile and onboarding state.

**Auth:** Required (Bearer token — user reads their own profile)

**Response 200:**
```json
{
  "userId": "auth0|abc123",
  "goal": "muscle",
  "experience": "intermediate",
  "equipment": ["dumbbells", "barbell"],
  "reminderTime": "08:00",
  "onboardingComplete": true
}
```

**Fields:**
- `goal`: `"muscle" | "weight_loss" | "active" | "follow_trainer" | null`
- `experience`: `"beginner" | "intermediate" | "advanced" | null`
- `equipment`: array of `"none" | "dumbbells" | "barbell" | "full_gym"`
- `reminderTime`: `"HH:mm"` string or `null`
- `onboardingComplete`: `boolean`

**Response 404:** Profile not yet created → frontend treats as onboarding not complete.

---

### PATCH /api/users/profile
Creates or updates the current user's profile. Upsert semantics.

**Auth:** Required

**Request body (all fields optional — partial update):**
```json
{
  "goal": "muscle",
  "experience": "intermediate",
  "equipment": ["dumbbells", "barbell"],
  "reminderTime": "08:00",
  "onboardingComplete": true
}
```

**Response 200:** Updated profile (same schema as GET).

---

## 2. Daily Challenges

### GET /api/challenges/today
Returns today's daily challenge. The same challenge is returned for all users on a given day (seeded by date). Cycles through a predefined pool, no repeats within 30 days.

**Auth:** Required

**Response 200:**
```json
{
  "id": "2026-07-29",
  "description": "Do 10 push-ups",
  "type": "reps",
  "target": 10,
  "unit": "reps",
  "completedByUser": false
}
```

**Fields:**
- `type`: `"reps" | "distance" | "duration" | "flexibility"`
- `completedByUser`: whether the current user has logged this challenge today

---

### POST /api/challenges/log
Logs that the current user completed today's challenge.

**Auth:** Required

**Request body:**
```json
{
  "challengeId": "2026-07-29"
}
```

**Response 200:**
```json
{ "logged": true }
```

**Response 409:** Already logged today — return 200 idempotently (safe to call twice).

---

## 3. Notifications

### POST /api/notifications/nudge
Trainer sends a motivational push notification to one of their clients.
Rate-limited: one nudge per trainer per client per 24 hours (enforce in handler).

**Auth:** Required. Caller must be a trainer and the target must be their client.

**Request body:**
```json
{
  "clientUserId": "auth0|xyz789"
}
```

**Response 200:**
```json
{ "sent": true }
```

**Response 403:** Caller is not the client's trainer.
**Response 429:** Rate limit exceeded — nudge already sent in last 24h.

---

## 4. Progress Overview

### GET /api/progress/overview
Returns aggregated progress data for the current user for the Progress page.

**Auth:** Required

**Query params:**
- `weeks` (optional, default 12): number of weeks to return for the volume chart

**Response 200:**
```json
{
  "weeklyVolume": [
    { "weekStart": "2026-07-21", "totalKg": 4820.5 },
    { "weekStart": "2026-07-14", "totalKg": 3910.0 }
  ],
  "heatmap": [
    { "date": "2026-07-29", "intensity": 2 }
  ],
  "muscleFrequency": {
    "chest": 4,
    "back": 3,
    "legs": 5
  },
  "totalWorkouts": 38,
  "totalVolumeKg": 91200.0,
  "personalRecordCount": 12
}
```

**Heatmap intensity:** `0` = rest, `1` = light (<50% avg volume), `2` = normal, `3` = heavy (>150% avg).

**weeklyVolume:** Ordered newest first. Volume = sum of (weight × reps) across all sets.

---

## 5. Personal Records

### GET /api/exercises/{exerciseId}/records
Returns the all-time personal record for a specific exercise for the current user, plus their starting performance.

**Auth:** Required

**Response 200:**
```json
{
  "exerciseId": 42,
  "exerciseName": "Bench Press",
  "bestSet": {
    "weight": 100.0,
    "reps": 5,
    "volume": 500.0,
    "achievedAt": "2026-06-15T10:30:00Z"
  },
  "firstSet": {
    "weight": 60.0,
    "reps": 8,
    "volume": 480.0,
    "recordedAt": "2025-12-01T09:00:00Z"
  },
  "deltaKg": 40.0,
  "deltaPercent": 66.7
}
```

**Response 404:** No history for this exercise for this user.

---

### GET /api/progress/records
Returns all-time PRs across all exercises for the current user, sorted by most recently achieved.

**Auth:** Required

**Response 200:**
```json
[
  {
    "exerciseId": 42,
    "exerciseName": "Bench Press",
    "bestSet": { "weight": 100.0, "reps": 5, "volume": 500.0, "achievedAt": "2026-06-15T10:30:00Z" },
    "firstSet": { "weight": 60.0, "reps": 8, "volume": 480.0, "recordedAt": "2025-12-01T09:00:00Z" },
    "deltaKg": 40.0,
    "deltaPercent": 66.7
  }
]
```

---

## 6. Auth0 Custom Action

Add a custom Action in Auth0 that injects the user's role into the token on login/token refresh.

**Action trigger:** Login / Post Login

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://edumanage.app'
  const roles = event.authorization?.roles ?? []
  api.idToken.setCustomClaim(`${namespace}/roles`, roles)
  api.accessToken.setCustomClaim(`${namespace}/roles`, roles)
}
```

Assign roles `client` and/or `trainer` to users via Auth0 Dashboard → User Management → Roles.

---

## Testing Instructions

For each endpoint:
1. Use Scalar UI at `http://localhost:5090/scalar` to test manually.
2. Authenticate via the "Authorize" button using a valid Auth0 Bearer token.
3. Verify 200 responses match the schemas above.
4. For `/api/notifications/nudge`, verify 403 when caller is not the client's trainer.
5. For `/api/challenges/log`, call twice — second call should return 200 (idempotent).
