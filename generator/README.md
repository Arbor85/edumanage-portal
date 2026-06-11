# Exercise Database Generator

A .NET 9 console application that builds a comprehensive fitness exercise database by aggregating data from multiple public sources, deduplicating, normalizing, and enriching the results.

## Quick Start

```bash
cd src/ExerciseGenerator.Console
dotnet run
```

Output files are written to `output/` relative to where the command is run:

- `output/exercises.json` — complete exercise database
- `output/report.json` — run statistics and diagnostics

## Project Structure

```
src/
├── ExerciseGenerator.Console/          Entry point, DI wiring, JSON output
├── ExerciseGenerator.Application/      Services, interfaces, business logic
│   ├── Interfaces/                     IExerciseSource, IDeduplicationService, …
│   └── Services/                       Aggregator, Dedup, Tags, Muscles, Description, …
├── ExerciseGenerator.Domain/           Domain models: Exercise, Muscle, Report
└── ExerciseGenerator.Infrastructure/   HTTP sources, retry handler, DI
    └── Sources/                        Wger, ExerciseDB, CrossFit, MuscleWiki, ExRx, Built-in
```

## Data Sources

| Source | API Key | Notes |
|--------|---------|-------|
| Built-in Library | None | 160+ curated exercises, always runs |
| [Wger REST API](https://wger.de/api/v2/) | None | Free, paginated, English-language |
| [ExerciseDB (RapidAPI)](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb) | Optional | Set `ExerciseDb:ApiKey` in `appsettings.json` |
| CrossFit Library | None | Best-effort HTML scrape |
| MuscleWiki | None | Best-effort API / scrape |
| ExRx | None | Best-effort HTML scrape |

## Configuration

`appsettings.json`:

```json
{
  "ExerciseDb": {
    "ApiKey": "<YOUR_RAPIDAPI_KEY>"
  }
}
```

Or via environment variable:

```bash
ExerciseDb__ApiKey=<key> dotnet run
```

## Output Format

### exercises.json

```json
[
  {
    "id": 1,
    "name": "Barbell Back Squat",
    "shortDescription": "Stand with feet shoulder-width apart, bar resting on upper traps...",
    "primaryMuscle": "Quadriceps",
    "secondaryMuscles": ["Gluteus Maximus", "Hamstrings", "Core"],
    "muscles": [
      { "name": "Quadriceps" },
      { "name": "Gluteus Maximus" }
    ],
    "tags": ["barbell", "compound", "powerlifting", "bodybuilding", "intermediate"],
    "activityType": "weighted",
    "activityTrackType": "repetitions"
  }
]
```

### report.json

```json
{
  "generatedAt": "2024-01-01T00:00:00Z",
  "executionTimeSeconds": 12.5,
  "recordsPerSource": {
    "Built-In Library": 160,
    "Wger API": 845
  },
  "totalFetchedRecords": 1005,
  "duplicatesRemoved": 120,
  "validationErrorsRemoved": 3,
  "finalRecordCount": 882,
  "validationErrors": [],
  "sourceErrors": []
}
```

## Deduplication Algorithm

Two-pass approach:
1. **Exact normalization** — lowercase, strip punctuation, collapse whitespace
2. **Fuzzy matching** — combined score: 60% Levenshtein similarity + 40% Jaccard token similarity. Threshold: **90%**. Keeps the record with the highest data completeness score.

## ActivityType / ActivityTrackType Values

| ActivityType | ActivityTrackType | Example |
|---|---|---|
| `weighted` | `repetitions` | Barbell Back Squat |
| `bodyweight` | `repetitions` | Pull-Up |
| `distance` | `distance` | Running |
| `duration` | `duration` | Plank |
| `calories` | `calories` | Assault Bike |
| `machine` | `repetitions` | Leg Press Machine |

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)

## Build

```bash
dotnet build ExerciseGenerator.sln
```

## Tags Reference

Available tags assigned automatically:

**Equipment**: `barbell`, `dumbbell`, `kettlebell`, `machine`, `bodyweight`, `rings`, `rope`, `sled`

**Sports**: `crossfit`, `bodybuilding`, `powerlifting`, `strongman`, `weightlifting`, `gymnastics`, `mobility`, `cardio`

**Movement pattern**: `compound`, `isolation`, `olympic-lift`, `rowing`, `running`, `jumping`

**Level**: `beginner`, `intermediate`, `advanced`
