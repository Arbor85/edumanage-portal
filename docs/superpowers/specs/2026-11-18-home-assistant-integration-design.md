# Home Assistant Integration — Design

**Date:** 2026-11-18
**Status:** Ready for implementation planning
**Author:** Lukasz Wojcik (with Claude)

## Summary

A Lovelace **custom card** for Home Assistant that lists the user's EduManage routines on a dashboard and lets the user queue a routine for the next time the EduManage app is opened. The card authenticates to `netbackend` with a long-lived API key.

Two deliverables:

1. `netbackend` — new API-key authentication scheme (reusing the existing `McpApiKey` table), and a new `QueuedWorkout` concept so a "start" action initiated outside the Vue app can be picked up by the Vue app on next load.
2. `ha-card/` — new top-level monorepo directory containing a Lit-based custom element that HA loads as a Lovelace resource.

## Goals

- From an HA dashboard, see the user's routines.
- Tap "Start" on a routine in HA → next time the EduManage Vue app is opened, the routine auto-starts (via the existing client-side workout flow).
- HA card shows which routine is currently queued, if any.
- Reuse the existing `McpApiKey` table and `/api/mcp-keys` management UI — no new auth concept.
- Reuse existing MediatR queries (`ListRoutinesQuery`) rather than duplicating endpoints.

## Non-Goals

- No new "active workout" server-side entity. Workouts remain client-side state in the Vue `workoutStore` once started.
- No HA custom integration (no Python component, no HA entities/sensors).
- No HA add-on.
- No HACS packaging in v1 — manual install via `www/community/`.
- No scopes or per-endpoint permissions on API keys. An API key grants full user-scoped access, same as a JWT for the same user.
- No rate limiting in v1.

## Decisions (locked)

1. **Extension type:** Lovelace custom card only.
2. **Auth model:** API-key scheme. The existing `McpApiKey` entity is reused as the single long-lived credential store. The existing `McpApiKeysPage.vue` UI is reused for key creation.
3. **Scheme coexistence:** JWT remains the default authentication scheme. API-key is added as an additional scheme on the existing authorization policies. Existing endpoints work identically for both; no new `/api/integrations/*` surface.
4. **API-key management lockdown:** `ApiKeysController` (`/api/mcp-keys`) is restricted to JWT only. Even a valid API key cannot mint new keys or delete existing ones.
5. **"Start a routine" semantics:** HA posts to a new `/api/workouts/queue` endpoint which persists a `QueuedWorkout` record. The Vue app, on relevant mounts (e.g. Today page, app shell), polls once for queued workouts and if present auto-starts the oldest one through the existing client-side `workoutStore.startFromRoutine` action, then deletes the record.
6. **Card framework:** Lit + esbuild. Single ES-module bundle.

## Architecture

```
┌───────────────────────────┐
│ Home Assistant dashboard  │
│  ┌─────────────────────┐  │
│  │ edumanage-card      │  │
│  │ (Lit custom card)   │  │
│  └──────┬──────────────┘  │
└─────────┼─────────────────┘
          │  X-Api-Key: <key>
          │  GET  /api/routines
          │  GET  /api/workouts/queue
          │  POST /api/workouts/queue
          ▼
   ┌────────────────────────────────┐
   │ netbackend                     │
   │  AuthN: JWT (default) + ApiKey │
   │  New: QueuedWorkout entity +   │
   │       /api/workouts/queue      │
   └────────────────────────────────┘
          ▲
          │ JWT (Auth0)
          │ Normal usage
          │
   ┌──────┴──────────┐
   │ modern (Vue 3)  │
   │  On mount of    │
   │  TodayPage /    │
   │  AppShell:      │
   │  GET queue; if  │
   │  present, start │
   │  + DELETE queue │
   └─────────────────┘
```

## Backend changes (netbackend)

### 1. API-key authentication scheme

**New files:**

```
src/EduManage.Api/Authentication/
  ApiKeyAuthenticationOptions.cs    # : AuthenticationSchemeOptions
  ApiKeyAuthenticationHandler.cs    # : AuthenticationHandler<ApiKeyAuthenticationOptions>
```

**Handler behavior:**

1. Read `X-Api-Key` header. If absent, return `AuthenticateResult.NoResult()` so other schemes can try.
2. Resolve `IApiKeyRepository` from DI; look up the key.
3. If no match, return `AuthenticateResult.Fail("Invalid API key")`.
4. On match, build a `ClaimsPrincipal` with `ClaimTypes.NameIdentifier = apiKey.UserId` and `AuthenticationType = "ApiKey"`.
5. Return `AuthenticateResult.Success(ticket)`.

Because `ICurrentUserService.GetCurrentUserId()` reads `NameIdentifier`, every existing MediatR handler and controller continues to work unchanged for API-key-authenticated callers.

### 2. Program.cs wiring

- Register the new scheme alongside JWT:

  ```csharp
  builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
      .AddJwtBearer(...)                             // existing
      .AddScheme<ApiKeyAuthenticationOptions, ApiKeyAuthenticationHandler>("ApiKey", _ => { });
  ```

- Configure both the **default** policy and existing **named** policies to accept both schemes, so existing `[Authorize]` and `[Authorize(Policy = "manage:clients")]` attributes work identically for API-key callers:

  ```csharp
  options.DefaultPolicy = new AuthorizationPolicyBuilder(
          JwtBearerDefaults.AuthenticationScheme, "ApiKey")
      .RequireAuthenticatedUser()
      .Build();

  options.AddPolicy("manage:clients", p => p
      .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme, "ApiKey")
      .RequireAuthenticatedUser());
  ```

- `RoutinesController` and `WorkoutQueueController` use `[Authorize]` and are reached via the default policy. API-key is only tried when its header is present; otherwise authentication falls through to JWT.

### 3. Lock `ApiKeysController` to JWT only

`/api/mcp-keys` must not be reachable via API-key auth. Add an explicit scheme restriction at the controller level:

```csharp
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "manage:clients")]
public sealed class ApiKeysController(...)
```

This ensures an API-key holder cannot create more keys or delete existing ones for the same user.

### 4. `QueuedWorkout` entity and endpoints

**Domain:** `src/EduManage.Domain/Entities/QueuedWorkout.cs`

```csharp
public class QueuedWorkout
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string RoutineId { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;   // ISO 8601
    public string Source { get; set; } = string.Empty;      // "ha" for Home Assistant; future-proofing
}
```

String-based ids/timestamps follow the existing convention in `McpApiKey` for consistency.

**Contracts:** `src/EduManage.Application/Contracts/IQueuedWorkoutRepository.cs`

```csharp
public interface IQueuedWorkoutRepository
{
    Task<IReadOnlyList<QueuedWorkout>> ListAsync(string userId, CancellationToken ct);
    Task AddAsync(QueuedWorkout item, CancellationToken ct);
    Task<bool> DeleteAsync(string id, string userId, CancellationToken ct);
}
```

**Infrastructure:**

- `Persistence/Configurations/QueuedWorkoutConfiguration.cs` — `IEntityTypeConfiguration<QueuedWorkout>` modeled after `McpApiKeyConfiguration`.
- `Persistence/Repositories/QueuedWorkoutRepository.cs` — implements the contract against `EduManageDbContext`.
- Register the repository in `DependencyInjection.cs`.
- Add `DbSet<QueuedWorkout> QueuedWorkouts` to `EduManageDbContext`.

**Features (MediatR):** `src/EduManage.Application/Features/WorkoutQueue/`

- `AddQueuedWorkoutCommand(QueuedWorkoutCreate request, string userId) : IRequest<QueuedWorkoutOut>`
- `ListQueuedWorkoutsQuery(string userId) : IRequest<IReadOnlyList<QueuedWorkoutOut>>`
- `DeleteQueuedWorkoutCommand(string id, string userId) : IRequest<bool>`

DTOs are records in `Application/Contracts/Dtos.cs` next to the existing ones:

```csharp
public record QueuedWorkoutCreate(string RoutineId, string? Source);
public record QueuedWorkoutOut(string Id, string RoutineId, string CreatedAt, string Source);
```

**Controller:** `src/EduManage.Api/Controllers/WorkoutQueueController.cs`

```
GET    /api/workouts/queue           → ListQueuedWorkoutsQuery
POST   /api/workouts/queue           → AddQueuedWorkoutCommand
DELETE /api/workouts/queue/{id}      → DeleteQueuedWorkoutCommand
```

All three use `[Authorize]` (default policy — JWT or API-key both work).

`AddQueuedWorkoutCommand` sets `Source = request.Source ?? "api"` and `CreatedAt = DateTime.UtcNow.ToString("o")`.

### 5. CORS

Add a configurable allowed-origins entry for the HA frontend. In `appsettings.json`:

```json
"Cors": {
  "AllowedOrigins": ["http://localhost:5173", "http://homeassistant.local:8123"]
}
```

Applied globally — there is no integration-only route prefix in this design.

## Frontend changes (modern)

### 1. Queue consumption on app open

**New service:** `src/services/workoutQueueApi.ts` — thin wrapper around the three queue endpoints, following the existing `mcpApiKeysApi.ts` style.

**New composable:** `src/composables/useQueuedWorkoutStart.ts`

- Call site: `src/App.vue` top-level authenticated layout, on mount, after auth is ready. Runs once per app load — no polling. (Chosen over per-page hooks so the queue is consumed regardless of which route the user lands on.)
- Flow:
  1. `GET /api/workouts/queue`.
  2. If empty, exit.
  3. If any item exists and the `workoutStore.activeWorkout` is `null`, take the oldest, resolve the `RoutineOut` via `routineStore` (fetching routines first if the store is empty), call `workoutStore.startFromRoutine(routine)`, then `DELETE /api/workouts/queue/{id}`.
  4. If an active workout already exists, leave the queue entry in place (do not clobber the in-progress session). Optionally surface a toast "Queued workout {name} will start after you finish the current one."
  5. If the routine id is unknown (deleted since queueing), `DELETE` the stale entry and show a toast.

Routines are loaded from `routineStore` (fetching first if empty) before consuming the queue.

### 2. API key creation UX

No change needed — `McpApiKeysPage.vue` already exists and already surfaces key creation. The README for the HA card references this page as the way to obtain a key.

## HA custom card (`ha-card/`)

### Repo layout

```
ha-card/
├─ package.json             # lit, typescript, esbuild
├─ tsconfig.json
├─ esbuild.config.mjs
├─ README.md
├─ src/
│  ├─ edumanage-card.ts     # LitElement + customElements.define
│  ├─ api.ts                # listRoutines, listQueue, queueWorkout, deleteQueue
│  ├─ types.ts              # CardConfig, RoutineTile, QueuedWorkoutOut
│  └─ styles.ts             # Lit css`` block
├─ test/
│  ├─ api.test.ts
│  └─ config.test.ts
└─ dist/
   └─ edumanage-card.js     # built bundle, released via GitHub release
```

Independent `package.json`, consistent with the monorepo convention of per-app project files.

### Why Lit + esbuild

HA's frontend is Lit. Using Lit gives the card theme-variable inheritance (`--primary-color`, `--card-background-color`, `--ha-card-border-radius`) and keeps the bundle small. esbuild produces a single ES-module file suitable for HA's resource registration.

### Card YAML config

```yaml
type: custom:edumanage-card
api_base_url: http://192.168.1.50:5090
api_key: !secret edumanage_api_key
title: Workouts            # optional, default "Workouts"
poll_interval: 30          # optional seconds, default 30, min 10
```

### Config schema

```ts
export interface CardConfig {
  type: 'custom:edumanage-card';
  api_base_url: string;            // required
  api_key: string;                 // required
  title?: string;
  poll_interval?: number;          // seconds, clamped to [10, 600]
}
```

`setConfig(config)` validates required fields and throws a descriptive error if invalid. HA renders the thrown error inline.

### UI states

- **Loading** — three skeleton rows.
- **Queued banner (if queue non-empty)** — top of card: `"Queued: {routineName}"` with a small "Cancel" (X) button that calls `DELETE /api/workouts/queue/{id}`.
- **Idle list** — one row per routine: name, exercise count, right-aligned "Start" button.
- **Error** — inline message with HTTP status, e.g. `"Failed to load routines (401). Check the API key."` Refresh button always available.
- **Empty** — `"No routines yet. Create one in EduManage."`

### Interactions

- **Refresh icon** in the header — manual refetch of both routines and queue.
- **Start button** — `POST /api/workouts/queue` with `{ routineId, source: "ha" }`, then optimistically swap to the queued banner on 2xx. On error, toast via `fire-event('hass-notification', ...)` and leave the list intact.
- **Cancel** on queued banner — `DELETE /api/workouts/queue/{id}`, swap back to list.
- **Polling** — on `connectedCallback`, start an interval (`poll_interval` seconds) that refetches both lists. Cleared in `disconnectedCallback`.

### API client (`api.ts`)

Four functions:

```ts
listRoutines(baseUrl, apiKey, signal) : Promise<RoutineTile[]>
listQueue(baseUrl, apiKey, signal)    : Promise<QueuedWorkoutOut[]>
queueWorkout(baseUrl, apiKey, routineId) : Promise<QueuedWorkoutOut>
deleteQueue(baseUrl, apiKey, id)      : Promise<void>
```

Each sends `X-Api-Key: <apiKey>` and `Accept: application/json`. Non-2xx throws `ApiError { status, message }`. Network failure throws `ApiError { status: 0 }`.

Response shape mirrors backend DTOs; the card reads only the fields it renders (routine `id`, `name`, `excercises.length`).

## Install flow (user-facing, in `ha-card/README.md`)

1. Open EduManage → `McpApiKeysPage` → create a new API key, copy it.
2. In HA, add the key to `secrets.yaml`: `edumanage_api_key: "<paste>"`.
3. `cd ha-card && npm install && npm run build`.
4. Copy `dist/edumanage-card.js` into HA at `<config>/www/community/edumanage/edumanage-card.js`.
5. HA → Settings → Dashboards → Resources → add `/local/community/edumanage/edumanage-card.js` as a JavaScript Module.
6. Add a card on any dashboard with the YAML above.

## Testing

**Backend (`netbackend`):**

- Unit test `ApiKeyAuthenticationHandler`: missing header → NoResult; unknown key → Fail; valid key → Success with `NameIdentifier`.
- Integration test: `GET /api/routines` succeeds with `X-Api-Key`, returns the owner's routines; `GET /api/mcp-keys` returns 401 with `X-Api-Key`, 200 with JWT.
- Unit tests on `QueuedWorkout` MediatR handlers (add/list/delete) covering ownership scoping.

**Frontend (`modern`):**

- Vitest for `useQueuedWorkoutStart`: no-op when queue empty; starts + deletes when queue has one; leaves queue intact when active workout exists; deletes stale entry when routine id unknown.

**HA card (`ha-card`):**

- `config.test.ts` — `setConfig` accepts valid configs, throws on missing/invalid fields, clamps `poll_interval`.
- `api.test.ts` — mocked fetch covers 2xx, 401, 500, network failure for each of the four API functions.

**Manual acceptance** (documented in `ha-card/README.md`):

- Load the built card in a real HA instance; list renders; refresh works; "Start" queues; opening EduManage auto-starts the routine; queued banner clears.
- Stale API key shows a clear 401 error.

## Error handling

- Missing/invalid card config → thrown from `setConfig`, HA renders inline.
- Fetch failure in the card → inline error state with status; refresh button always available.
- Queue entry with unknown `routineId` on the Vue side → entry is deleted, user sees a one-line toast.
- Active workout in progress when queue consumption runs → queue entry is left in place for the next app open.

## Security notes

- API keys are long-lived credentials stored in HA's `secrets.yaml`. Compromise of HA exposes the key. Called out in the README.
- `/api/mcp-keys` cannot be called with an API key, so a leaked key cannot be used to mint more keys.
- The `X-Api-Key` scheme short-circuits before authorization; a missing or invalid header is a hard 401 (never silently falls through to JWT).
- CORS allows only the configured HA origin plus the Vue dev origin.

## Out of scope (future work)

- Server-side "active workout" entity so HA can see in-progress state.
- Per-endpoint scopes on API keys (e.g. a read-only key).
- Showing workout history in the card.
- HA custom integration exposing routines as entities for automations.
- HACS packaging.
- Token rotation / expiry policy on API keys.
