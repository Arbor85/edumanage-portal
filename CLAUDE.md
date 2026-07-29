# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Monorepo for an education management platform with four main apps:

| Directory | Stack | Purpose |
|-----------|-------|---------|
| `modern/` | Vue 3 + TypeScript + Vite + Storybook | Primary modern frontend |
| `web-vue/` | Vue 3 + TypeScript + Vite | Alternative Vue frontend |
| `mobile/` | Expo + React Native | Mobile app |
| `backend/` | FastAPI (Python) + SQLite | Legacy fitness/training API |
| `netbackend/` | ASP.NET Core (.NET 10) | Primary production backend |

Each app is independent with its own `package.json`/project file and dependencies.

## Commands

### modern / web-vue (Vue 3)
```bash
cd modern   # or cd web-vue
npm install
npm run dev        # dev server
npm run build      # vue-tsc type-check + vite build
npm run lint       # type-check only

# modern only:
npm run storybook  # Storybook on :6006
npm run test       # Vitest
```

### mobile (Expo)
```bash
cd mobile
npm install
npm start          # Expo tunnel
npm run android / npm run ios / npm run web
npm run lint
```

### backend (FastAPI)
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://127.0.0.1:8000, docs at /docs
```

### netbackend (.NET)
```bash
cd netbackend
dotnet restore
dotnet run --project src/EduManage.Api/EduManage.Api.csproj
# HTTP: http://localhost:5090  |  Scalar: /scalar  |  Swagger: /swagger
dotnet test   # unit tests
```

## Architecture

### Vue Frontends (modern / web-vue)

**File placement:**
- Pages → `src/pages/`
- Shared components → `src/components/`
- Page-specific components → `src/pages/{page}/components/`
- API services → `src/services/`
- Composables → `src/composables/`
- TypeScript types → `src/types/`

**Patterns:**
- Always use Composition API with `<script setup>`.
- Reuse existing services/composables before creating new ones. Follow naming conventions (`clientsApi`, `routinesApi`, etc.).
- Icons: **`lucide-vue-next` only** — no heroicons, phosphor, font-awesome, mdi, tabler, feather, etc.
- Success/error feedback → `src/components/NotificationToast.vue`.
- Custom scrollbar styles on all scrollable `div`s for cross-browser consistency.
- All API endpoints/secrets in `.env` or `.env.*`. Never hardcode URLs.
- Auth0 integration in `src/auth/` (web-vue) or via `services/auth0Service.ts`.

**New page checklist:**
1. List view first (loading + empty states + text search).
2. Pagination if list can exceed 20 items; refresh button if externally updated.
3. Time-related pages → List + Calendar views with toggle.
4. Non-time pages → List + Kanban views with toggle.
5. Edit/delete on list items via modals or inline editing.
6. Details view → responsive dialog (desktop and mobile); entity selectors via `Select{Entity}` components from `src/components/`.
7. Add new page to navigation menu.

**Backend integration:** When a frontend feature needs new backend endpoints, create `src/services/prompts_{feature}.md` with AI prompts specifying endpoint URL, HTTP method, request/response schemas, and auth requirements.

### .NET Backend (netbackend)

**Clean Architecture layers:**
```
EduManage.Domain/Entities          # core entities, no dependencies on other layers
EduManage.Application/
  Contracts/                       # repository interfaces
  Features/                        # MediatR commands, queries, handlers
EduManage.Infrastructure/
  Persistence/
    Configurations/                # one IEntityTypeConfiguration<T> per entity
    Repositories/                  # implementations of Contracts interfaces
EduManage.Api/Controllers/         # thin controllers delegating to MediatR
```

**Key decisions (do not revert):**
- EF Core uses **InMemory provider** (`UseInMemoryDatabase("EduManageDb")`).
- One repository interface per entity (`IClientRepository`, `IPlanRepository`, `IMeetingRepository`, `ICourseRepository`, `IExerciseRepository`, `IRoutineRepository`, `IWorkoutHistoryRepository`). No aggregate/unified repository.
- JSON field conversion lives in **EF configuration via ValueConverter**, not in repositories.
- Controllers are thin — delegate all logic to MediatR, no business logic in controllers.
- Prefer **records** for DTOs, commands, queries, and value objects; classes only for mutable state or EF entities.

**Auth:** JWT Bearer (Auth0) required for `/api/clients/*` endpoints.

### FastAPI Backend (backend)

- SQLite by default; override with `DATABASE_URL` env var. Auto-migrated on startup.
- Routes in `app/routers/`. Core config in `app/core/`.

### Mobile (Expo)

- `app/(auth)/` — authentication stack.
- `app/(tabs)/` — main tabbed app stack.
- Token storage via `expo-secure-store`.
