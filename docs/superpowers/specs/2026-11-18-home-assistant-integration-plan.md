# Home Assistant Integration — Implementation Plan

**Spec:** `2026-11-18-home-assistant-integration-design.md`
**Date:** 2026-11-18

## Order of work

Backend first (auth + queue), then Vue queue consumer, then HA card last. Each step is independently testable; stop and run tests after each.

---

## Step 1 — `ApiKeyAuthenticationHandler`

New files:

- `netbackend/src/EduManage.Api/Authentication/ApiKeyAuthenticationOptions.cs`
  - `sealed class ApiKeyAuthenticationOptions : AuthenticationSchemeOptions { public const string Scheme = "ApiKey"; public const string HeaderName = "X-Api-Key"; }`
- `netbackend/src/EduManage.Api/Authentication/ApiKeyAuthenticationHandler.cs`
  - `sealed class ApiKeyAuthenticationHandler(IOptionsMonitor<ApiKeyAuthenticationOptions> options, ILoggerFactory logger, UrlEncoder encoder, IApiKeyRepository repo) : AuthenticationHandler<ApiKeyAuthenticationOptions>(options, logger, encoder)`
  - `HandleAuthenticateAsync`:
    1. `if (!Request.Headers.TryGetValue(ApiKeyAuthenticationOptions.HeaderName, out var header) || string.IsNullOrEmpty(header)) return AuthenticateResult.NoResult();`
    2. `var apiKey = await repo.GetByKeyAsync(header!, Context.RequestAborted);`
    3. `if (apiKey is null) return AuthenticateResult.Fail("Invalid API key");`
    4. Build `ClaimsIdentity` with `new Claim(ClaimTypes.NameIdentifier, apiKey.UserId)`, authentication type `"ApiKey"`.
    5. Return `AuthenticateResult.Success(new AuthenticationTicket(principal, Scheme.Name))`.

Resolve repository by capturing `IApiKeyRepository` through the handler's primary constructor (DI is per-request because `AuthenticationHandler` is instantiated per request via `IAuthenticationHandlerProvider`).

No existing files changed in this step.

---

## Step 2 — Register the scheme and update policies

Edit `netbackend/src/EduManage.Api/Program.cs`:

- Chain `.AddScheme<ApiKeyAuthenticationOptions, ApiKeyAuthenticationHandler>(ApiKeyAuthenticationOptions.Scheme, _ => { })` onto the existing `AddAuthentication(...).AddJwtBearer(...)` call.
- Configure `AddAuthorization(options => { ... })`:
  ```csharp
  options.DefaultPolicy = new AuthorizationPolicyBuilder(
          JwtBearerDefaults.AuthenticationScheme, ApiKeyAuthenticationOptions.Scheme)
      .RequireAuthenticatedUser()
      .Build();
  ```
- Update the existing `"manage:clients"` policy registration to include both schemes via `.AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme, ApiKeyAuthenticationOptions.Scheme)`.

Verify: existing JWT calls to `/api/routines` and `/api/clients` still succeed.

---

## Step 3 — Lock `ApiKeysController` to JWT

Edit `netbackend/src/EduManage.Api/Controllers/ApiKeysController.cs`:

- Replace `[Authorize(Policy = "manage:clients")]` with `[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "manage:clients")]`.

Verify: `GET /api/mcp-keys` with only `X-Api-Key` returns 401. With a valid JWT, returns the list.

---

## Step 4 — `QueuedWorkout` domain + persistence

New files:

- `netbackend/src/EduManage.Domain/Entities/QueuedWorkout.cs` — entity exactly as in the spec (`Id`, `UserId`, `RoutineId`, `CreatedAt`, `Source`, all `string`).
- `netbackend/src/EduManage.Application/Contracts/IQueuedWorkoutRepository.cs` — interface with `ListAsync`, `AddAsync`, `DeleteAsync` as in the spec.
- `netbackend/src/EduManage.Infrastructure/Persistence/Configurations/QueuedWorkoutConfiguration.cs` — modeled after `McpApiKeyConfiguration`:
  ```csharp
  builder.HasKey(q => q.Id);
  builder.HasIndex(q => q.UserId);
  ```
- `netbackend/src/EduManage.Infrastructure/Persistence/Repositories/QueuedWorkoutRepository.cs` — modeled after `ApiKeyRepository`:
  ```csharp
  internal sealed class QueuedWorkoutRepository(EduManageDbContext context)
      : BaseRepository<QueuedWorkout, string>(context), IQueuedWorkoutRepository
  {
      public async Task<IReadOnlyList<QueuedWorkout>> ListAsync(string userId, CancellationToken ct) =>
          await Context.QueuedWorkouts.Where(q => q.UserId == userId)
              .OrderBy(q => q.CreatedAt).ToListAsync(ct);

      public async Task AddAsync(QueuedWorkout item, CancellationToken ct)
      {
          Context.QueuedWorkouts.Add(item);
          await Context.SaveChangesAsync(ct);
      }

      public async Task<bool> DeleteAsync(string id, string userId, CancellationToken ct)
      {
          var entity = await Context.QueuedWorkouts
              .FirstOrDefaultAsync(q => q.Id == id && q.UserId == userId, ct);
          if (entity is null) return false;
          Context.QueuedWorkouts.Remove(entity);
          await Context.SaveChangesAsync(ct);
          return true;
      }
  }
  ```

Edit existing files:

- `netbackend/src/EduManage.Infrastructure/Persistence/EduManageDbContext.cs` — add `public DbSet<QueuedWorkout> QueuedWorkouts => Set<QueuedWorkout>();`.
- `netbackend/src/EduManage.Infrastructure/DependencyInjection.cs` — register `IQueuedWorkoutRepository → QueuedWorkoutRepository` scoped.

---

## Step 5 — `QueuedWorkout` MediatR + DTOs + controller

Edit `netbackend/src/EduManage.Application/Contracts/Dtos.cs` — add:
```csharp
public record QueuedWorkoutCreate(string RoutineId, string? Source);
public record QueuedWorkoutOut(string Id, string RoutineId, string CreatedAt, string Source);
```

New files in `netbackend/src/EduManage.Application/Features/WorkoutQueue/`:

- `AddQueuedWorkoutCommand.cs` — command + handler. Generates `Id = Guid.NewGuid().ToString()`, `CreatedAt = DateTime.UtcNow.ToString("o")`, `Source = request.Source ?? "api"`. Returns `QueuedWorkoutOut`.
- `ListQueuedWorkoutsQuery.cs` — maps repo list to `IReadOnlyList<QueuedWorkoutOut>`.
- `DeleteQueuedWorkoutCommand.cs` — returns `bool`; throws nothing on miss (controller translates to 404).

New file `netbackend/src/EduManage.Api/Controllers/WorkoutQueueController.cs` — modeled after `ApiKeysController`:

```csharp
[ApiController]
[Route("api/workouts/queue")]
[Authorize]
public sealed class WorkoutQueueController(ISender mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet] public Task<IReadOnlyList<QueuedWorkoutOut>> List(CancellationToken ct) => ...;
    [HttpPost] public async Task<ActionResult<QueuedWorkoutOut>> Add([FromBody] QueuedWorkoutCreate body, CancellationToken ct) => ...;
    [HttpDelete("{id}")] public async Task<IActionResult> Delete([FromRoute] string id, CancellationToken ct) => ...;
}
```

---

## Step 6 — CORS

Edit `netbackend/src/EduManage.Api/Program.cs` and `appsettings.json`:

- Add `Cors:AllowedOrigins` config section with defaults `["http://localhost:5173", "http://homeassistant.local:8123"]`.
- Register a named policy `"Default"` reading from config: `.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()`.
- Apply via `app.UseCors("Default")` before `UseAuthentication`.

If CORS is already configured, extend the origins list and skip the rest.

---

## Step 7 — Vue queue consumer

New file `modern/src/services/workoutQueueApi.ts` — mirror the shape of `mcpApiKeysApi.ts`:

```ts
export const workoutQueueApi = {
  list(): Promise<QueuedWorkoutOut[]>
  queue(routineId: string): Promise<QueuedWorkoutOut>
  remove(id: string): Promise<void>
}
```

Uses the existing authenticated axios/fetch wrapper used by other services (follow the pattern in `mcpApiKeysApi.ts`).

New types in `modern/src/types/index.ts` (or alongside existing queue types):
```ts
export interface QueuedWorkoutOut {
  id: string
  routineId: string
  createdAt: string
  source: string
}
```

New composable `modern/src/composables/useQueuedWorkoutStart.ts`:

```ts
export function useQueuedWorkoutStart() {
  const routineStore = useRoutineStore()
  const workoutStore = useWorkoutStore()
  const notify = useNotifications()   // use the existing NotificationToast composable

  async function consumeOnce() {
    const queue = await workoutQueueApi.list()
    if (queue.length === 0) return
    if (workoutStore.activeWorkout) {
      const name = routineStore.routines.find(r => r.id === queue[0].routineId)?.name
      notify.info(`Queued workout${name ? ` "${name}"` : ''} will start after your current one finishes.`)
      return
    }
    if (routineStore.routines.length === 0) await routineStore.fetch()
    const next = queue[0]
    const routine = routineStore.routines.find(r => r.id === next.routineId)
    if (!routine) {
      await workoutQueueApi.remove(next.id)
      notify.warn('Queued routine was removed before it could start.')
      return
    }
    workoutStore.startFromRoutine(routine)
    await workoutQueueApi.remove(next.id)
  }

  return { consumeOnce }
}
```

Call site — edit `modern/src/App.vue` (top-level authenticated layout):

- On `onMounted`, after auth is ready: `useQueuedWorkoutStart().consumeOnce().catch(() => {})`.
- Swallow errors — a queue fetch failure must never block app load.

---

## Step 8 — HA card scaffold

New directory `ha-card/`. Files:

- `package.json` — `lit@^3`, `typescript@^5`, `esbuild@^0.20`, `vitest@^2`. Scripts: `build`, `dev`, `test`.
- `tsconfig.json` — target `ES2022`, `moduleResolution: bundler`, `experimentalDecorators: true`, `useDefineForClassFields: false` (Lit requirement).
- `esbuild.config.mjs` — bundle `src/edumanage-card.ts` → `dist/edumanage-card.js`, format `esm`, minify, bundle Lit.
- `src/types.ts` — `CardConfig`, `RoutineTile`, `QueuedWorkoutOut`.
- `src/api.ts` — four functions as in the spec, each sending `X-Api-Key` and throwing `ApiError { status, message }`.
- `src/styles.ts` — Lit `css\`\`` block referencing HA CSS variables.
- `src/edumanage-card.ts` — `LitElement` with `@customElement('edumanage-card')`; `setConfig`, `connectedCallback`, `disconnectedCallback`, `render`, event handlers for Start / Cancel / Refresh.
- `README.md` — install flow from the spec, security notes, troubleshooting (401, CORS).
- `.gitignore` — `node_modules/`, `dist/`.

Register with HA's card registry at module bottom:
```ts
(window as any).customCards = [...(((window as any).customCards) ?? []), {
  type: 'edumanage-card',
  name: 'EduManage',
  description: 'List and queue EduManage routines.',
}];
```

---

## Step 9 — HA card UI + polling

Implement `edumanage-card.ts` states per the spec: loading / queued-banner / idle-list / error / empty.

- `@state() private _routines`, `_queue`, `_loading`, `_error`.
- `connectedCallback`: call `_refresh()` immediately, then `setInterval(_refresh, pollInterval * 1000)`.
- `disconnectedCallback`: `clearInterval`.
- `_refresh`: `Promise.all([listRoutines, listQueue])`; on 401, set `_error` and stop polling.
- `_onStart(routineId)`: `queueWorkout`, then `_refresh()`; on error dispatch `hass-notification`.
- `_onCancel(id)`: `deleteQueue`, then `_refresh()`.
- Use HA CSS variables throughout; wrap in `<ha-card>`.

---

## Step 10 — Tests

**Backend** — new test project files under `netbackend/tests/` matching existing conventions:

- `ApiKeyAuthenticationHandlerTests` — three cases: no header → `NoResult`; unknown key → `Fail`; valid key → `Success` with `NameIdentifier` claim matching `apiKey.UserId`.
- `WorkoutQueueControllerTests` (or MediatR handler tests) — add/list/delete scoped by user; delete of another user's row returns false.
- Integration test (WebApplicationFactory): `GET /api/routines` succeeds with `X-Api-Key`; `GET /api/mcp-keys` returns 401 with only `X-Api-Key`, 200 with JWT.

**Frontend** — `modern/src/composables/__tests__/useQueuedWorkoutStart.test.ts`:

- empty queue → no-op.
- queue + idle → calls `startFromRoutine` with the correct routine, then `remove`.
- queue + active workout → neither start nor remove; emits info notification.
- queue + routine deleted → removes the stale entry; emits warn notification.

**HA card** — in `ha-card/test/`:

- `config.test.ts` — `setConfig` throws on missing `api_base_url` / `api_key`; clamps `poll_interval` to `[10, 600]`; defaults `title`.
- `api.test.ts` — mocked fetch covers 2xx/401/500/network for each of the four functions; verifies `X-Api-Key` header.

---

## Step 11 — Manual acceptance

Documented in `ha-card/README.md`:

1. Start `netbackend` and `modern` locally.
2. Create an API key via `McpApiKeysPage`, add to `secrets.yaml`.
3. Build and install the card in a local HA (docker-compose).
4. Verify: list renders → Start → queued banner appears → open EduManage in a browser → routine auto-starts → queue banner clears on next card refresh.
5. Rotate the API key in EduManage and verify the card shows a 401 error with the stale key.

---

## Risk notes

- **Repository DI scope in auth handler** — `AuthenticationHandler` is created by `IAuthenticationHandlerProvider` per request, which resolves from the request scope. Scoped repositories will work. If it doesn't, inject `IServiceScopeFactory` and create a scope inside `HandleAuthenticateAsync`.
- **CORS preflight on `X-Api-Key`** — custom headers trigger preflight. The CORS policy must `.AllowAnyHeader()` (or explicitly list `X-Api-Key`) or the HA browser call will fail silently with a preflight error.
- **InMemory EF provider** — `QueuedWorkout` lives in the same in-memory DB as everything else; queue rows are lost on backend restart. Acceptable for the current persistence model.
