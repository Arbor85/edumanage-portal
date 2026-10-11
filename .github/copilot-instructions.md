
# Copilot & AI Agent Instructions for edumanage-portal

> `web-vue/` only contains stale build output (`dist/`, `node_modules/`) and no `src`/`package.json` — it is defunct. `modern/` is the actively developed frontend. Do not edit `web-vue/`.

## Monorepo Layout

| Directory | Stack | Status |
|-----------|-------|--------|
| `modern/` | Vue 3 + TypeScript + Vite + Storybook | **Primary frontend** |
| `mobile/` | Expo + React Native | **Primary mobile app** |
| `netbackend/` | ASP.NET Core (.NET 10), Clean Architecture | **Primary backend** |
| `backend/` | FastAPI (Python) + SQLite | Legacy fitness/training API |
| `web-vue/` | — | Defunct (no source, do not use) |

`netbackend/src/EduManage.Mcp` is a separate MCP server project alongside the API, Application, Domain, and Infrastructure projects.

## Build, Run, Test, Lint

### `modern` (primary frontend)
```bash
cd modern
npm install
npm run dev          # dev server
npm run build        # vue-tsc -b type-check + vite build (use build:ci to skip type-check)
npm run lint         # alias for type-check only (no separate eslint script)
npm run test         # vitest (watch mode); use `npx vitest run path/to/file.spec.ts -t "test name"` for a single test
npm run storybook    # Storybook on :6006
```

### `mobile` (Expo)
```bash
cd mobile
npm install
npm start            # expo start (tunnel)
npm run android / npm run ios / npm run web
npm run lint         # eslint .
```

### `netbackend` (.NET 10, primary backend)
```bash
cd netbackend
dotnet restore
dotnet run --project src/EduManage.Api/EduManage.Api.csproj
# HTTP: http://localhost:5090  |  Scalar: /scalar  |  Swagger: /swagger
dotnet test                                                     # full suite
dotnet test tests/EduManage.Application.Tests                   # one test project
dotnet test --filter "FullyQualifiedName~CreateOrderHandler"    # single test/class
```

### `backend` (legacy FastAPI)
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://127.0.0.1:8000, docs at /docs
```
DB: SQLite by default, auto-migrated on startup; override with `DATABASE_URL` env var. Routes live in `app/routers/`, core config in `app/core/`.

## Architecture

### `modern` / Vue frontend
- Composition API with `<script setup lang="ts">` only.
- File placement: pages → `src/pages/`; page-specific components → `src/pages/{page}/components/`; shared components → `src/components/`; API services → `src/services/`; composables → `src/composables/`; types → `src/types/`.
- Icons: **`@lucide/vue` / `lucide-vue-next` only** — never heroicons, phosphor, font-awesome, mdi, tabler, feather.
- Success/error feedback goes through the shared `src/components/NotificationToast.vue`.
- Entity pickers follow the `Select{Entity}` component pattern (searchable, in `src/components/`).
- Service/composable naming follows existing conventions (`clientsApi`, `routinesApi`, etc.) — reuse before creating new ones.
- All API URLs/secrets come from `.env`/`.env.*`; never hardcode.
- New pages: list view first (loading + empty states + search), pagination past ~20 items, List+Calendar toggle for time-related pages, List+Kanban toggle otherwise, edit/delete via modal or inline, add to nav menu. Details open in a responsive dialog on desktop and mobile.
- Custom scrollbar styling on every scrollable `div` for cross-browser consistency.
- When a frontend feature needs new backend endpoints, write `src/services/prompts_{feature}.md` describing the endpoint URL, method, request/response schema, and auth requirements — this is the handoff spec for backend work.

### `netbackend` / .NET Clean Architecture
```
EduManage.Domain/Entities          # core entities, zero dependencies on other layers
EduManage.Application/
  Contracts/                       # repository interfaces
  Features/{Feature}/              # MediatR commands, queries, handlers
EduManage.Infrastructure/
  Persistence/
    Configurations/                # one IEntityTypeConfiguration<T> per entity
    Repositories/                  # implementations of Contracts interfaces
EduManage.Api/Controllers/         # thin controllers delegating to MediatR
EduManage.Mcp/                     # MCP server exposing backend tools
```
Non-negotiable decisions (do not revert):
- EF Core **InMemory provider** (`UseInMemoryDatabase("EduManageDb")`), not a real database.
- One repository interface per entity (`IClientRepository`, `IPlanRepository`, `IMeetingRepository`, `ICourseRepository`, `IExerciseRepository`, `IRoutineRepository`, `IWorkoutHistoryRepository`) — never an aggregate/unified repository.
- JSON field conversion lives in EF configuration via `ValueConverter`, not in repositories.
- Prefer **records** for DTOs/commands/queries/value objects; classes only for mutable state or EF entities.
- `/api/clients/*` endpoints require Auth0 JWT bearer auth; other controllers are open unless changed explicitly.
- Full endpoint catalog (routes, request/response JSON shapes, DbSet/entity map) is documented in `netbackend/README.md` — consult it before adding/changing endpoints.

### Mobile (Expo)
- `app/(auth)/` — authentication stack; `app/(tabs)/` — main tabbed stack.
- Token storage via `expo-secure-store`.

## Adding a new entity end-to-end (netbackend)
1. Domain — entity class in `EduManage.Domain/Entities/`.
2. Application — repository interface in `Contracts/`, MediatR feature folder in `Features/`.
3. Infrastructure — EF configuration in `Configurations/`, repository implementation in `Repositories/`, register in `DependencyInjection.cs`.
4. Api — thin controller in `Controllers/` delegating to MediatR.

## Cross-cutting conventions
- All API endpoints/secrets across every app live in `.env`/`.env.*` files — never hardcode URLs. When adding a new env var, update that app's `README.md` and this file.
- Auth0 is the single auth mechanism everywhere it's used (netbackend JWT bearer, frontend auth flows).
- See `.claude/skills/edumanage-feature/SKILL.md` for the canonical full-stack feature-building walkthrough (file placement, new-page checklist, common pitfalls).

---
For questions, review the relevant app's `README.md` or ask a maintainer. Update this file if major conventions change.
