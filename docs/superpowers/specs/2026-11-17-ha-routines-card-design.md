# Home Assistant Routines Card — Design

**Date:** 2026-11-17
**Status:** Approved for implementation planning
**Author:** Lukasz Wojcik (with Claude)

## Summary

A Lovelace **custom card** for Home Assistant that lists the user's EduManage routines on an HA dashboard and launches a chosen routine in the existing Vue frontend with a single tap.

The card is a pure frontend artifact. It talks directly to `netbackend` (`/api/routines`) using a long-lived JWT pasted into the card's YAML config, and launches routines by opening a deep link into the `modern` frontend's active-workout page.

Scope is intentionally narrow: **view and launch**. All editing, history, and completion flows stay in the main app.

## Goals

- From an HA dashboard, see the list of my routines.
- Tap one routine → the corresponding "active workout" opens in the EduManage frontend, already started.
- Zero backend changes. Minimal frontend change.

## Non-Goals

- No HA custom integration (no Python component, no HA entities/sensors/services).
- No HA add-on (no Docker container).
- No logging workout completion from inside HA.
- No in-card routine editing, history, or stats.
- No automatic auth token refresh. Token rotation is a manual paste when it expires.
- No HACS packaging on day one. Manual install via `www/community/` is acceptable.

## Decisions (locked)

1. **Extension type:** Lovelace custom card only. Not a custom integration, not an add-on.
2. **Auth:** Long-lived Auth0 JWT stored in the card's YAML config. User rotates manually on 401. No backend changes to support this.
3. **"Start a routine" semantics:** Opens the modern frontend's `/workout/active?routineId=<id>` in a new browser tab. No new backend endpoint, no new `active session` concept.
4. **Deep link support:** Add a small change to `modern/src/pages/ActiveWorkoutPage.vue` to read `?routineId=` on mount and auto-start that routine via the existing store action.

## Architecture

```
┌───────────────────────────┐        ┌──────────────────────┐
│ Home Assistant dashboard  │        │  Browser / new tab   │
│  ┌─────────────────────┐  │        │                      │
│  │ edumanage-routines  │  │        │ modern frontend      │
│  │ (Lovelace card)     │──┼──open──▶  /workout/active     │
│  │                     │  │        │  ?routineId=<id>     │
│  └──────────┬──────────┘  │        │                      │
└─────────────┼─────────────┘        └──────────────────────┘
              │
              │ GET /api/routines
              │ Authorization: Bearer <jwt>
              ▼
       ┌──────────────┐
       │  netbackend  │
       └──────────────┘
```

Three moving pieces:

1. **The card** — a single-file Lit-based web component, built to one JS bundle, loaded by HA as a Lovelace resource.
2. **The deep-link hook** — tiny addition to `ActiveWorkoutPage.vue` so a URL like `/workout/active?routineId=abc` actually starts routine `abc`.
3. **Nothing on the backend.** `GET /api/routines` already returns everything the card needs.

## Repo layout

New top-level `ha-card/` directory, independent (own `package.json`), matching the monorepo convention.

```
ha-card/
├─ package.json            # deps: lit, typescript, esbuild
├─ tsconfig.json
├─ README.md               # install + configuration instructions
├─ src/
│  ├─ edumanage-routines-card.ts   # LitElement custom card
│  ├─ api.ts                       # fetch wrapper for /api/routines
│  ├─ types.ts                     # CardConfig + Routine types
│  └─ styles.ts                    # Lit css`` block
├─ test/
│  ├─ api.test.ts
│  └─ config.test.ts
└─ dist/
   └─ edumanage-routines.js        # built bundle (checked in for release)
```

### Why Lit

HA's frontend is built on Lit. Using Lit means the card picks up HA theme variables (`--primary-color`, `--card-background-color`, etc.) and feels native. Bundle size is tiny.

### Build

`esbuild` → single ES module file, output to `dist/edumanage-routines.js`. No code splitting. No external deps at runtime (Lit is bundled). `package.json` scripts:

- `npm run build` — produce `dist/edumanage-routines.js`
- `npm test` — Vitest
- `npm run dev` — esbuild in watch mode (optional, useful during development)

## Card configuration

User-facing YAML example (goes in Lovelace):

```yaml
type: custom:edumanage-routines-card
title: My Routines                   # optional, default "Routines"
api_base_url: http://192.168.1.50:5090
frontend_base_url: http://192.168.1.50:5173
auth_token: eyJhbGciOiJSUzI1NiIs...  # Auth0 JWT
```

### Config schema (TypeScript)

```ts
export interface CardConfig {
  type: 'custom:edumanage-routines-card';
  title?: string;                // default: "Routines"
  api_base_url: string;          // required, no trailing slash enforced
  frontend_base_url: string;     // required, no trailing slash enforced
  auth_token: string;            // required, Auth0 JWT
}
```

### Validation

`setConfig(config)` (the HA lifecycle hook) normalizes trailing slashes and throws a descriptive error if any of `api_base_url`, `frontend_base_url`, or `auth_token` is missing or non-string. HA renders the thrown error inline in the dashboard, which is exactly what we want.

## Card UI

Structure (single Lit template):

- **Header** — title + a refresh icon button (triggers refetch).
- **Body** — one of:
  - *Loading*: HA-styled spinner.
  - *Error*: short message, including HTTP status when available (`"Failed to load routines (401). Your auth token may have expired."`).
  - *Empty*: `"No routines yet. Create one in EduManage."`
  - *List*: one row per routine.
- **Routine row** — routine name (bold), small meta line (exercise count if present on the DTO), and a "Start" button aligned right.

Row action: `window.open(\`${frontend_base_url}/workout/active?routineId=${id}\`, '_blank')`.

Styling uses HA CSS variables so the card inherits the active HA theme. No custom theming knobs on day one.

## API client

`api.ts` exposes a single function:

```ts
export async function fetchRoutines(
  baseUrl: string,
  token: string,
  signal?: AbortSignal,
): Promise<Routine[]>
```

Behavior:

- `GET ${baseUrl}/api/routines` with `Authorization: Bearer ${token}` and `Accept: application/json`.
- On non-2xx, throws an `ApiError` carrying `status` and `message`.
- On network failure, throws `ApiError` with `status: 0`.
- Response shape mirrors `RoutineOut` from the backend (id, name, and whatever list fields are already returned — we read only what we render).

## Frontend change (modern)

File: `modern/src/pages/ActiveWorkoutPage.vue`

On mount:

1. Read `route.query.routineId` (string | undefined).
2. If present, look it up via the existing routine store (loading it first if the store is empty).
3. Call the same store action `StartWorkoutDialog.vue` calls when the user picks a routine.
4. Replace the URL (via `router.replace`) to drop the query param so a page refresh doesn't restart the routine.
5. If the id is unknown, surface the existing "no active workout" state; no special error UI needed.

Behavior rule: if there's **already** an active workout in progress when a `routineId` param arrives, do **not** overwrite it. Leave the existing session alone and clear the param. (This matches how the dialog guards against accidentally wiping an in-progress workout.)

Estimated size: 10–20 lines in `ActiveWorkoutPage.vue`, plus one Vitest.

## Installation flow (user-facing)

Documented in `ha-card/README.md`:

1. `cd ha-card && npm install && npm run build`
2. Copy `dist/edumanage-routines.js` into HA at `<config>/www/community/edumanage-routines/edumanage-routines.js`.
3. In HA → Settings → Dashboards → Resources, add `/local/community/edumanage-routines/edumanage-routines.js` as a JavaScript Module.
4. On any dashboard, add a card with YAML:
   ```yaml
   type: custom:edumanage-routines-card
   api_base_url: http://<host>:5090
   frontend_base_url: http://<host>:5173
   auth_token: <paste Auth0 JWT>
   ```
5. To get the token: open the EduManage frontend in your browser, open devtools → Application → Local Storage (or wherever Auth0 stashes it), copy the access token, paste it into `auth_token`.

## Testing

**Automated:**

- `ha-card/test/config.test.ts` — `setConfig` accepts valid configs, throws on missing/invalid fields, normalizes trailing slashes.
- `ha-card/test/api.test.ts` — mocked fetch covers 2xx, 401, 500, and network-failure branches.
- Modern: one Vitest in `modern/` that mounts `ActiveWorkoutPage` with `?routineId=<id>` and asserts the store start action fires, URL is replaced, and an existing active workout is preserved.

**Manual acceptance** (documented in `ha-card/README.md`):

- Load the built card in a real HA instance.
- Verify list renders, refresh works, "Start" opens a new tab, deep link auto-starts the routine.
- Verify a stale token shows a clear 401 error.

## Error handling

- Missing/invalid config → thrown from `setConfig`, HA renders inline.
- Fetch failure → inline error state in the card, with HTTP status and a short hint. Refresh button is always available.
- Deep link to an unknown routine id → active workout page shows its normal "no active workout" state; no crash.
- Already-active workout when a `routineId` param arrives → param is ignored and dropped; existing workout preserved.

## Security notes

- JWTs stored in Lovelace YAML are readable by anyone with HA access. This is acceptable for a home dashboard but should be called out in the README.
- The card only reads routines. There is no mutating call surface. Compromise of the token exposes read access to the user's routines via the existing Auth0-scoped endpoint — no worse than compromise of any other client holding the same token.
- CORS: `netbackend` must allow the HA frontend origin. If it doesn't already, add `http://<ha-host>:8123` to the allowed origins in `netbackend` configuration. Called out in the plan, not implemented as part of the spec.

## Open questions resolved during brainstorming

- *HA extension type?* → Lovelace custom card.
- *Auth model?* → Long-lived JWT in card config; manual rotation.
- *What does "start" mean?* → Open the Vue active-workout page as a deep link.
- *How does the deep link start a routine?* → Small `?routineId=` param handler added to `ActiveWorkoutPage.vue`.

## Out of scope (future work)

- Showing workout history as a secondary view.
- Quick-log "I did routine X" button (would use `POST /api/routines/complete`).
- HA custom integration exposing routines as entities (would enable automations like "notify me if I haven't done any routine in 3 days").
- Token refresh / API-key auth path on the backend.
- HACS packaging.
