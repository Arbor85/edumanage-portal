---
name: edumanage-feature
description: Guide for building full-stack features in the edumanage-portal monorepo. Use when adding new pages, components, or API endpoints following the project's established patterns (Vue 3 frontend, ASP.NET Core Clean Architecture backend, Expo mobile).
---

# EduManage Feature Builder

Use this skill when building any new feature in the edumanage-portal monorepo.

## Monorepo Structure

| Directory | Stack | Purpose |
|-----------|-------|---------|
| `modern/` | Vue 3 + TypeScript + Vite | Primary frontend |
| `mobile/` | Expo + React Native | Primary mobile app |
| `netbackend/` | ASP.NET Core (.NET 10) | Primary backend |

---

## Vue Frontend (modern / web-vue)

### File placement
- Pages → `src/pages/`
- Shared components → `src/components/`
- Page-specific components → `src/pages/{page}/components/`
- API services → `src/services/`
- Composables → `src/composables/`
- TypeScript types → `src/types/`

### Rules
- Always use Composition API with `<script setup lang="ts">`.
- Icons: **`lucide-vue-next` only** — never heroicons, phosphor, font-awesome, mdi, tabler, feather, etc.
- Success/error feedback → `NotificationToast.vue` from `src/components/`.
- Entity selectors → use existing `Select{Entity}` components from `src/components/`.
- All scrollable `div`s → add custom scrollbar styles for cross-browser consistency.
- All API URLs → `.env` / `.env.*` only. Never hardcode.
- Reuse existing services/composables before creating new ones. Follow naming conventions (`clientsApi`, `routinesApi`, etc.).

### New page checklist
1. **List view** with loading state, empty state, and text search.
2. **Pagination** if list can exceed 20 items; **refresh button** if data is externally updated.
3. **Time-related pages** → List + Calendar views with toggle.
4. **Non-time pages** → List + Kanban views with toggle.
5. **Edit/delete** on list items via modals or inline editing.
6. **Details view** → responsive dialog (works on desktop and mobile).
7. Add the new page to the **navigation menu**.
8. **Refresh button** for manually updating the list view.
9. **Detail page** open reflects in page URL (deep linking).

### Backend integration from frontend
When a frontend feature needs new backend endpoints, create `src/services/prompts_{feature}.md` specifying:
- Endpoint URL and HTTP method
- Request/response schemas
- Auth requirements

---

## .NET Backend (netbackend)

### Clean Architecture layers
```
EduManage.Domain/Entities                    # core entities — no deps on other layers
EduManage.Application/
  Contracts/                                 # repository interfaces
  Features/{Feature}/                        # MediatR commands, queries, handlers
EduManage.Infrastructure/
  Persistence/
    Configurations/                          # one IEntityTypeConfiguration<T> per entity
    Repositories/                            # implementations of Contracts interfaces
EduManage.Api/Controllers/                   # thin controllers → delegate to MediatR
```

### Key decisions (do not change)
- EF Core uses **InMemory provider** (`UseInMemoryDatabase("EduManageDb")`).
- One repository interface per entity — no aggregate/unified repository.
- JSON field conversion → **EF configuration via ValueConverter**, not in repositories.
- Controllers are thin — no business logic; delegate everything to MediatR.
- **Records** for DTOs, commands, queries, value objects. Classes only for mutable state or EF entities.
- JWT Bearer (Auth0) required on `/api/clients/*` endpoints.

### Adding a new entity end-to-end
1. **Domain** — add entity class in `EduManage.Domain/Entities/`.
2. **Application** — add repository interface in `Contracts/`, add MediatR feature folder in `Features/`.
3. **Infrastructure** — add EF configuration in `Configurations/`, add repository implementation in `Repositories/`, register in `DependencyInjection.cs`.
4. **Api** — add thin controller in `Controllers/`.

---

## Running the apps

```bash
# Frontend
cd modern && npm run dev

# .NET backend
cd netbackend && dotnet run --project src/EduManage.Api/EduManage.Api.csproj
# API: http://localhost:5090 | Scalar: /scalar | Swagger: /swagger

# FastAPI backend (legacy)
cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload

# Mobile
cd mobile && npm start
```

---

## Common pitfalls to avoid
- Don't use icon libraries other than `lucide-vue-next`.
- Don't add business logic to .NET controllers.
- Don't hardcode API URLs — use env vars.
- Don't create a new repository interface that spans multiple entities.
- Always show loading and empty states in list views.
