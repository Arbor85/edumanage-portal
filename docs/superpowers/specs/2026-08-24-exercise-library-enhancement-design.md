# Exercise Library Enhancement Design

**Date:** 2026-08-24  
**Scope:** Seed 1,324 exercises from `hasaneyldrm/exercises-dataset`, extend the Exercise entity, download images as static files, and enhance muscle visualization using the existing `MuscleDiagram.vue` SVG component.

---

## 1. Data Model

### 1.1 New Exercise Entity Fields

All new fields are nullable so existing exercises remain valid.

| Field | Type | EF Storage | Source |
|-------|------|-----------|--------|
| `Instructions` | `List<string>?` | JSON ValueConverter | `instruction_steps.en` |
| `Equipment` | `string?` | plain column | `equipment` |
| `Level` | `string?` | plain column | `level` (beginner/intermediate/expert) |
| `Force` | `string?` | plain column | `force` (push/pull/static) |
| `Mechanic` | `string?` | plain column | `mechanic` (compound/isolation) |
| `Category` | `string?` | plain column | `category` |
| `ImagePath` | `string?` | plain column | `/images/exercises/{filename}.jpg` |
| `GifPath` | `string?` | plain column | `/images/exercises/{filename}.gif` |
| `DatasetId` | `string?` | plain column | dataset `id` field |

Existing fields (`PrimaryMuscle`, `SecondaryMuscles`, `Muscles`, `Tags`, `ActivityType`, `ActivityTrackType`) are unchanged.

### 1.2 EF Configuration

`ExerciseConfiguration.cs` gains:
- `Instructions` column configured with a `ValueConverter<List<string>, string>` serializing to/from JSON (same pattern as existing `Muscles` field).
- All other new fields use default EF conventions (nullable string columns).

### 1.3 DTOs

`ExcerciseOut` and `ExcerciseWriteRequest` in `Dtos.cs` gain all new fields. `ExcerciseOut` exposes them as nullable. `ExcerciseWriteRequest` also allows them nullable for manual creation.

---

## 2. Seed Script

### 2.1 Location & Runtime

`scripts/seed-exercises.js` at the repo root. Vanilla Node.js 18+ (built-in `fetch`, `fs/promises`). No extra npm packages required.

### 2.2 Steps

1. Fetch `exercises.json` from GitHub raw URL (`hasaneyldrm/exercises-dataset`).
2. For each exercise (1,324 total):
   - Download JPEG thumbnail from `images/` folder → `modern/public/images/exercises/{filename}.jpg` (skip if exists).
   - Download GIF from `videos/` folder → `modern/public/images/exercises/{filename}.gif` (skip if exists).
   - Log progress: `[N/1324] {name}`.
3. Transform each record to .NET seed JSON format (see §2.3).
4. Write full array to `netbackend/src/EduManage.Infrastructure/gym_exercises_full.json`.

The script is idempotent — re-running skips already-downloaded files and overwrites the JSON.

### 2.3 Field Mapping

| Dataset field | Entity field | Notes |
|--------------|-------------|-------|
| `id` | `DatasetId` | string |
| `name` | `Name` | |
| `instruction_steps.en` | `Instructions` | English only |
| `equipment` | `Equipment` | |
| `level` | `Level` | |
| `force` | `Force` | nullable in dataset |
| `mechanic` | `Mechanic` | nullable in dataset |
| `category` | `Category` | |
| `muscle_group` | `PrimaryMuscle` | |
| `secondary_muscles` | `SecondaryMuscles` | |
| `muscle_group` + `secondary_muscles` | `Muscles` | mapped to `[{Name}]` records |
| `image` filename | `ImagePath` | `/images/exercises/{filename}.jpg` |
| `gif_url` filename | `GifPath` | `/images/exercises/{filename}.gif` |
| inferred (see below) | `ActivityType` | |
| inferred | `ActivityTrackType` | always `Repetitions` unless category=cardio → `Time` |
| `level` | `Tags` | e.g. `["beginner"]` |

**ActivityType inference:**
- `category == "cardio"` → `Cardio`
- `equipment == "body only"` → `Bodyweight`
- `equipment` contains "machine" or "cable" → `Machine`
- otherwise → `Weighted`

### 2.4 Updated .NET Seeder

`ExerciseSeedExtensions.cs` updated to:
- Read `gym_exercises_full.json` instead of `gym_exercises.json`.
- Map all new fields when constructing `Exercise` objects.
- Idempotency check remains: skip exercises already present by name (case-insensitive).
- Old `gym_exercises.json` kept for reference but no longer read at startup.

---

## 3. Muscle Visualization

### 3.1 MuscleDiagram.vue Enhancements

**New props:**

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `primaryMuscle` | `string \| undefined` | `undefined` | Skip keyword inference; highlight this muscle |
| `secondaryMuscles` | `string[]` | `[]` | Highlight at lower opacity |
| `view` | `'front' \| 'back' \| 'both'` | `'front'` | Which body silhouette(s) to render |

**Rendering logic:**
- If `primaryMuscle` or `secondaryMuscles` are provided → data-driven mode (skip keyword/name inference).
- If neither provided → existing frequency/keyword mode (history pages unaffected).
- Primary muscle: `rgba(0,200,150,1.0)`.
- Secondary muscles: `rgba(0,200,150,0.45)`.
- Unaffected: `rgba(0,200,150,0.08)`.

**Back body SVG paths added** covering: traps, rear delts, lats, lower back, glutes, hamstrings, calves (rear). Front paths already present: chest, shoulders (front delt), biceps, triceps (front), core, quads, calves (front).

**Muscle name normalization:** a mapping table inside the component maps dataset muscle names (e.g. `"pectoralis major"`, `"lats"`) to SVG path IDs (e.g. `"chest"`, `"back"`). The same table is used for both inference fallback and explicit prop mode.

### 3.2 MuscleDistributionDialog.vue (new)

A modal dialog triggered from `ExerciseCard`. Contains:
- Exercise name as dialog title.
- `MuscleDiagram` with `view="both"`, `primaryMuscle`, `secondaryMuscles` props.
- Muscle list below diagram:
  - Primary muscle: teal badge labeled "Primary".
  - Each secondary: slate badge labeled "Secondary".
- Close button.

Component receives the full exercise object as a prop and extracts the muscle fields itself.

### 3.3 ExerciseCard.vue Changes

- Image display: use `exercise.ImagePath` for static image; on hover swap to `exercise.GifPath` (CSS transition). Fall back to existing dumbbell icon if both are null.
- Add `Activity` lucide icon button, visible on card hover alongside the existing delete button (bottom row). Clicking emits `open-muscle-dialog` with the exercise object.
- `ExercisesPage.vue` handles the event, sets a `selectedExercise` ref, renders `MuscleDistributionDialog` with `v-if`.

### 3.4 ExerciseDetailModal.vue Changes

- Below the existing primary/secondary muscle tag section, add `MuscleDiagram` with `view="both"`, `primaryMuscle`, `secondaryMuscles` from the exercise object.
- Section heading: "Affected Muscles".

---

## 4. Files Changed

### Backend (netbackend)
- `EduManage.Domain/Entities/Exercise.cs` — add new fields
- `EduManage.Infrastructure/Persistence/Configurations/ExerciseConfiguration.cs` — add ValueConverter for Instructions
- `EduManage.Infrastructure/Persistence/ExerciseSeedExtensions.cs` — read new JSON, map new fields
- `EduManage.Application/Contracts/Dtos.cs` — extend ExcerciseOut and ExcerciseWriteRequest
- `EduManage.Application/Features/Excercises/AddExcerciseCommand.cs` — map new fields
- `EduManage.Application/Features/Excercises/UpdateExcerciseCommand.cs` — map new fields
- `EduManage.Infrastructure/gym_exercises_full.json` — new seed file (generated by script)

### Frontend (modern)
- `src/components/MuscleDiagram.vue` — new props, back-body SVG, data-driven mode
- `src/components/MuscleDistributionDialog.vue` — new component
- `src/pages/ExercisesPage.vue` — handle `open-muscle-dialog`, render dialog
- `src/pages/exercises/components/ExerciseCard.vue` — image from ImagePath/GifPath, Activity icon
- `src/pages/exercises/components/ExerciseDetailModal.vue` — add MuscleDiagram section
- `src/types/index.ts` — extend ExcerciseOut and ExcerciseWriteRequest types
- `src/services/exercisesApi.ts` — no changes needed (passes through all fields)

### Scripts
- `scripts/seed-exercises.js` — new seed script
- `modern/public/images/exercises/` — new directory for downloaded images (gitignored)

---

## 5. Out of Scope

- Multi-language instructions (only English ingested).
- CDN migration (ImagePath/GifPath designed for easy swap to absolute CDN URLs later).
- Exercise image upload via UI.
- Updating existing manually-created exercises with dataset images.
