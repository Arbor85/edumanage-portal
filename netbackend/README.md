# EduManage .NET Backend

## API Docs URLs

Local host URLs from launch settings:

- HTTP base URL: `http://localhost:5090`
- HTTPS base URL: `https://localhost:7166`

Documentation endpoints:

- Swagger UI:
  - `http://localhost:5090/swagger`
  - `https://localhost:7166/swagger`
- Scalar API Reference:
  - `http://localhost:5090/scalar`
  - `https://localhost:7166/scalar`
- OpenAPI JSON (v1):
  - `http://localhost:5090/openapi/v1.json`
  - `https://localhost:7166/openapi/v1.json`

## Auth0 Configuration

API uses Auth0 JWT bearer authentication.

Configuration keys:

- `Authentication:Auth0:Domain`
- `Authentication:Auth0:Audience`

Example local values are in `src/EduManage.Api/appsettings.local.json`.

Bearer token header format:

`Authorization: Bearer <access_token>`

`/api/clients/*` endpoints require authorization. Other controllers are currently open unless changed explicitly.

## API Endpoint Catalog

All routes are relative to API base URL.

### Clients (`/api/clients`) [Authorized]

- `GET /api/clients`
  - Request body: none
- `POST /api/clients`
  - Request JSON:
    ```json
    {
      "name": "John Doe",
      "tags": ["vip"],
      "imageUrl": "https://example.com/avatar.png",
      "status": "Lead",
      "invitationCode": "ABC12345"
    }
    ```
- `PUT /api/clients/{invitation_code}`
  - Request JSON:
    ```json
    {
      "name": "John Doe",
      "tags": ["vip", "online"],
      "imageUrl": "https://example.com/avatar.png",
      "status": "Active",
      "invitationCode": "ABC12345"
    }
    ```
- `DELETE /api/clients/{invitation_code}`
  - Request body: none
- `POST /api/clients/{invitation_code}/accept`
  - Request JSON:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "imageUrl": "https://example.com/avatar.png"
    }
    ```

### Courses (`/api/courses`)

- `GET /api/courses`
  - Request body: none
- `POST /api/courses`
  - Request JSON:
    ```json
    {
      "name": "Nutrition Basics",
      "type": "Online",
      "size": 8,
      "price": {
        "value": 199,
        "currency": "USD"
      },
      "description": "Introductory nutrition course"
    }
    ```
- `PUT /api/courses/{course_id}`
  - Request JSON: same shape as `POST /api/courses`
- `DELETE /api/courses/{course_id}`
  - Request body: none

### Excercises (`/api/excercises`)

- `GET /api/excercises`
  - Request body: none
- `POST /api/excercises`
  - Request JSON:
    ```json
    {
      "name": "Bench Press",
      "shortDescription": "Compound chest press movement",
      "primaryMuscle": "Chest",
      "secondaryMuscles": ["Front Deltoids", "Triceps"],
      "tags": ["compound", "push", "barbell"]
    }
    ```
- `PUT /api/excercises/{id}`
  - Request JSON: same shape as `POST /api/excercises`
- `DELETE /api/excercises/{id}`
  - Request body: none

Validation rules for `POST` and `PUT`:

Validation is enforced with FluentValidation for all controller write payloads in `src/EduManage.Api/Validators`.

- `name`: required, max 200 chars
- `primaryMuscle`: required, max 120 chars
- `secondaryMuscles`: optional array, can be empty
- `secondaryMuscles`: entries matching `primaryMuscle` are removed
- `secondaryMuscles`: duplicate entries are removed (case-insensitive)
- `shortDescription`: optional, max 500 chars
- `tags`: optional array, each tag max 50 chars

### Meetings (`/api/meetings`)

- `GET /api/meetings`
  - Request body: none
- `POST /api/meetings`
  - Request JSON:
    ```json
    {
      "clientId": "client-123",
      "startsAt": "2026-03-18T10:00:00Z",
      "price": 149
    }
    ```
- `PUT /api/meetings/{meeting_id}`
  - Request JSON: same shape as `POST /api/meetings`
- `DELETE /api/meetings/{meeting_id}`
  - Request body: none

### Plans (`/api/plans`)

- `GET /api/plans`
  - Request body: none
- `GET /api/plans/{plan_id}`
  - Request body: none
- `POST /api/plans`
  - Request JSON:
    ```json
    {
      "name": "8 Week Cut",
      "clientId": "client-123",
      "notes": "Focus on consistency",
      "status": "Draft",
      "workouts": [
        {
          "name": "Upper A",
          "notes": "Controlled tempo",
          "id": "routine-1",
          "user_id": "user-123",
          "excercises": [
            {
              "name": "Bench Press",
              "isBodyweight": false,
              "sets": [
                {
                  "type": "Working",
                  "reps": 8,
                  "weight": 80,
                  "notes": null
                }
              ]
            }
          ],
          "date": "2026-03-18"
        }
      ]
    }
    ```
- `PUT /api/plans/{plan_id}`
  - Request JSON: same shape as `POST /api/plans`
- `PATCH /api/plans/{plan_id}/status`
  - Request JSON:
    ```json
    {
      "status": "Active"
    }
    ```
- `DELETE /api/plans/{plan_id}`
  - Request body: none

### Routines (`/api/routines`)

- `GET /api/routines`
  - Request body: none
- `POST /api/routines`
  - Request JSON:
    ```json
    {
      "name": "Push Day",
      "notes": "RPE 7-8",
      "excercises": [
        {
          "name": "Bench Press",
          "isBodyweight": false,
          "sets": [
            {
              "type": "Working",
              "reps": 8,
              "weight": 80,
              "notes": null
            }
          ]
        }
      ]
    }
    ```
- `PUT /api/routines/{routine_id}`
  - Request JSON: same shape as `POST /api/routines`
- `DELETE /api/routines/{routine_id}`
  - Request body: none
- `POST /api/routines/complete`
  - Request JSON:
    ```json
    {
      "mode": "Routine",
      "startedAt": "2026-03-18T10:00:00Z",
      "completedAt": "2026-03-18T11:00:00Z",
      "durationSeconds": 3600,
      "totalSets": 12,
      "completedSets": 11,
      "excercises": [
        {
          "name": "Bench Press",
          "isBodyweight": false,
          "sets": [
            {
              "type": "Working",
              "reps": 8,
              "weight": 80,
              "notes": null,
              "completed": true
            }
          ]
        }
      ],
      "sourceWorkout": {
        "id": "routine-1",
        "name": "Push Day",
        "date": "2026-03-18"
      }
    }
    ```

## Persistence Models

The EF Core persistence model is defined in `src/EduManage.Infrastructure/Persistence/EduManageDbContext.cs`.

Registered DbSets:

- `Clients` -> `Client`
- `Plans` -> `Plan`
- `PlanWorkouts` -> `PlanWorkout`
- `Meetings` -> `Meeting`
- `Courses` -> `Course`
- `Exercises` -> `Exercise`
- `Routines` -> `Routine`
- `RoutineExercises` -> `RoutineExercise`
- `RoutineSets` -> `RoutineSet`
- `WorkoutHistory` -> `WorkoutHistory`
- `CompletedExercises` -> `CompletedExercise`
- `CompletedSets` -> `CompletedSet`
- `SourceWorkouts` -> `SourceWorkout`

Entity source files are in `src/EduManage.Domain/Entities`:

- `Client.cs`
- `Plan.cs`
- `PlanWorkout.cs`
- `Meeting.cs`
- `Course.cs`
- `Exercise.cs`
- `Routine.cs`
- `RoutineExercise.cs`
- `RoutineSet.cs`
- `WorkoutHistory.cs`
- `CompletedExercise.cs`
- `CompletedSet.cs`
- `SourceWorkout.cs`
- `Muscle.cs`

## Run

```powershell
dotnet restore
dotnet run --project src/EduManage.Api/EduManage.Api.csproj
```
