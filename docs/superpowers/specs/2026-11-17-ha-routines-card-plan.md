# HA Routines Card — Implementation Plan

**Spec:** `2026-11-17-ha-routines-card-design.md`
**Date:** 2026-11-17

## Overview

Two independent deliverables that can be built and tested in parallel, then integrated manually:

1. **`ha-card/`** — new top-level directory containing the Lit-based Lovelace custom card, built to a single JS bundle.
2. **Modern frontend change** — `?routineId=` query-param handler added to `ActiveWorkoutPage.vue` so deep links from the card actually auto-start a routine.

No backend changes.

Order: the frontend deep-link hook is small and self-contained — do it first so manual acceptance of the card can happen the moment the card is built.

---

## Part A — Modern frontend deep-link hook

### Step A1 — Add query-param handler to `ActiveWorkoutPage.vue`

File: `modern/src/pages/ActiveWorkoutPage.vue`

Location: inside the existing `<script setup>`, next to the current `onMounted(() => exerciseStore.fetch())` block.

Imports needed:
- `useRoute` from `vue-router` (already have `useRouter`).
- `useRoutineStore` from `../stores/routineStore` (follow the pattern from `StartWorkoutDialog.vue` line 7–8).

New logic on mount:

```ts
const route = useRoute()
const routineStore = useRoutineStore()

onMounted(async () => {
  await exerciseStore.fetch()

  const routineId = typeof route.query.routineId === 'string' ? route.query.routineId : null
  if (!routineId) return

  // Preserve any existing in-progress workout.
  if (store.activeWorkout) {
    router.replace({ path: '/workout/active', query: {} })
    return
  }

  if (routineStore.routines.length === 0) {
    await routineStore.fetch()
  }

  const routine = routineStore.routines.find((r) => r.id === routineId)
  if (routine) {
    store.startFromRoutine(routine)
  }

  router.replace({ path: '/workout/active', query: {} })
})
```

Reuse notes:
- `store.startFromRoutine(routine)` is the same action `StartWorkoutDialog.vue:66` uses when the user manually picks a routine. Do **not** duplicate the start logic.
- Check the exact name of the routine-store fetch action before writing — use whatever `StartWorkoutDialog.vue` / `RoutinesPage.vue` uses (`fetch`, `fetchRoutines`, etc.). If the store auto-fetches on first access, the guard is unnecessary.

Behavior rules (from spec):
- Unknown routine id → silently drop; the existing "no active workout" UI handles it.
- Already-active workout → ignore the param, do not overwrite.
- Param is always cleared via `router.replace` so a refresh does not restart.

### Step A2 — Vitest for the deep-link handler

File: `modern/src/pages/__tests__/ActiveWorkoutPage.deepLink.test.ts` (new, next to any existing test folder — mirror the project's convention; if there is no `__tests__` folder next to `pages/`, place under `modern/src/__tests__/` or wherever the existing Vitests live).

Tests:
1. With `?routineId=abc` and a matching routine in the store → `startFromRoutine` called once with that routine; URL replaced to `/workout/active` with empty query.
2. With `?routineId=abc` but `store.activeWorkout` already set → `startFromRoutine` **not** called; URL still cleared.
3. With `?routineId=unknown` → `startFromRoutine` not called; URL cleared; no throw.
4. With no `routineId` param → mount is a no-op beyond the normal `exerciseStore.fetch()`.

Mock the Pinia stores (or use `createTestingPinia` — whichever the existing Vitests in this repo use; mirror that pattern). Mock `vue-router`'s `useRoute` / `useRouter`.

### Step A3 — Smoke test manually

Start modern dev server, open `http://localhost:5173/workout/active?routineId=<a-real-routine-id>` in a browser → routine should auto-start, URL should become `/workout/active`. Reload → routine stays, no restart loop.

---

## Part B — The `ha-card/` package

### Step B1 — Scaffold `ha-card/`

Create directory with the following files.

**`ha-card/package.json`:**

```json
{
  "name": "edumanage-ha-routines-card",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "esbuild src/edumanage-routines-card.ts --bundle --format=esm --target=es2020 --outfile=dist/edumanage-routines.js",
    "dev": "esbuild src/edumanage-routines-card.ts --bundle --format=esm --target=es2020 --outfile=dist/edumanage-routines.js --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "lit": "^3.1.0"
  },
  "devDependencies": {
    "esbuild": "^0.21.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "@types/node": "^20.0.0"
  }
}
```

**`ha-card/tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "lib": ["ES2020", "DOM"],
    "types": ["vitest/globals"],
    "skipLibCheck": true
  },
  "include": ["src/**/*", "test/**/*"]
}
```

`experimentalDecorators: true` + `useDefineForClassFields: false` is required by Lit's `@customElement` / `@property` decorators.

**`ha-card/.gitignore`:**

```
node_modules/
```

Note: `dist/` is **not** gitignored — the built bundle is checked in for release convenience (matches spec).

### Step B2 — `src/types.ts`

```ts
export interface CardConfig {
  type: 'custom:edumanage-routines-card'
  title?: string
  api_base_url: string
  frontend_base_url: string
  auth_token: string
}

export interface Routine {
  id: string
  name: string
  // Any other fields present on RoutineOut can be added here as needed.
  // Only declare what the card actually reads.
  exercises?: Array<unknown>
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}
```

### Step B3 — `src/api.ts`

```ts
import { ApiError, type Routine } from './types'

export async function fetchRoutines(
  baseUrl: string,
  token: string,
  signal?: AbortSignal,
): Promise<Routine[]> {
  const url = `${baseUrl.replace(/\/+$/, '')}/api/routines`
  let response: Response
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      signal,
    })
  } catch (err) {
    throw new ApiError(0, err instanceof Error ? err.message : 'Network error')
  }

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed with ${response.status}`)
  }

  return (await response.json()) as Routine[]
}
```

### Step B4 — `src/styles.ts`

A single exported `css` block. Reference HA CSS variables so the card inherits active theme:

- Container: `background: var(--card-background-color); color: var(--primary-text-color); border-radius: var(--ha-card-border-radius, 12px); padding: 16px;`
- Header row: flex row, title left, refresh button right.
- Routine row: flex row, name/meta on the left, Start button on the right.
- Start button: `background: var(--primary-color); color: var(--text-primary-color); border: none; padding: 6px 14px; border-radius: 8px; cursor: pointer;`
- Error state: `color: var(--error-color);`

Keep it short. No animation on day one.

### Step B5 — `src/edumanage-routines-card.ts`

The LitElement.

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { fetchRoutines } from './api'
import { ApiError, type CardConfig, type Routine } from './types'
import { styles } from './styles'

@customElement('edumanage-routines-card')
export class EduManageRoutinesCard extends LitElement {
  static styles = styles

  @state() private routines: Routine[] = []
  @state() private loading = false
  @state() private errorMessage: string | null = null
  @state() private errorStatus: number | null = null

  private config!: CardConfig
  private abortController?: AbortController

  setConfig(config: Partial<CardConfig>) {
    if (!config.api_base_url || typeof config.api_base_url !== 'string') {
      throw new Error('edumanage-routines-card: `api_base_url` is required')
    }
    if (!config.frontend_base_url || typeof config.frontend_base_url !== 'string') {
      throw new Error('edumanage-routines-card: `frontend_base_url` is required')
    }
    if (!config.auth_token || typeof config.auth_token !== 'string') {
      throw new Error('edumanage-routines-card: `auth_token` is required')
    }
    this.config = {
      type: 'custom:edumanage-routines-card',
      title: config.title ?? 'Routines',
      api_base_url: config.api_base_url.replace(/\/+$/, ''),
      frontend_base_url: config.frontend_base_url.replace(/\/+$/, ''),
      auth_token: config.auth_token,
    }
  }

  connectedCallback() {
    super.connectedCallback()
    void this.load()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.abortController?.abort()
  }

  private async load() {
    this.abortController?.abort()
    this.abortController = new AbortController()
    this.loading = true
    this.errorMessage = null
    this.errorStatus = null
    try {
      this.routines = await fetchRoutines(
        this.config.api_base_url,
        this.config.auth_token,
        this.abortController.signal,
      )
    } catch (err) {
      if (err instanceof ApiError) {
        this.errorStatus = err.status
        this.errorMessage = this.formatError(err)
      } else {
        this.errorMessage = 'Unexpected error'
      }
    } finally {
      this.loading = false
    }
  }

  private formatError(err: ApiError): string {
    if (err.status === 401) {
      return 'Failed to load routines (401). Your auth token may have expired.'
    }
    if (err.status === 0) {
      return `Could not reach the API. ${err.message}`
    }
    return `Failed to load routines (${err.status}).`
  }

  private startRoutine(id: string) {
    const url = `${this.config.frontend_base_url}/workout/active?routineId=${encodeURIComponent(id)}`
    window.open(url, '_blank', 'noopener')
  }

  render() {
    return html`
      <div class="card">
        <div class="header">
          <span class="title">${this.config.title}</span>
          <button class="refresh" @click=${() => this.load()} aria-label="Refresh">⟳</button>
        </div>
        ${this.renderBody()}
      </div>
    `
  }

  private renderBody() {
    if (this.loading) return html`<div class="state">Loading…</div>`
    if (this.errorMessage) return html`<div class="state error">${this.errorMessage}</div>`
    if (this.routines.length === 0) {
      return html`<div class="state">No routines yet. Create one in EduManage.</div>`
    }
    return html`
      <ul class="routines">
        ${this.routines.map(
          (r) => html`
            <li class="routine">
              <div class="info">
                <span class="name">${r.name}</span>
                ${r.exercises?.length
                  ? html`<span class="meta">${r.exercises.length} exercises</span>`
                  : nothing}
              </div>
              <button class="start" @click=${() => this.startRoutine(r.id)}>Start</button>
            </li>
          `,
        )}
      </ul>
    `
  }
}

// HA custom-card registry hint.
;(window as unknown as { customCards?: unknown[] }).customCards ??= []
;(window as unknown as { customCards: Array<Record<string, unknown>> }).customCards.push({
  type: 'edumanage-routines-card',
  name: 'EduManage Routines',
  description: 'List and launch EduManage routines',
})
```

Notes:
- `customCards` registration is what makes the card show up in HA's UI card picker. Not strictly required (YAML always works) but good UX.
- `window.open(url, '_blank', 'noopener')` — `noopener` prevents the opened tab from referencing the HA window.

### Step B6 — Tests

**`ha-card/test/config.test.ts`:**

```ts
import { describe, it, expect, beforeAll } from 'vitest'
import { EduManageRoutinesCard } from '../src/edumanage-routines-card'

beforeAll(() => {
  if (!customElements.get('edumanage-routines-card')) {
    customElements.define('edumanage-routines-card', EduManageRoutinesCard)
  }
})

describe('setConfig', () => {
  it('accepts a valid config', () => {
    const card = new EduManageRoutinesCard()
    expect(() =>
      card.setConfig({
        api_base_url: 'http://x:5090',
        frontend_base_url: 'http://x:5173',
        auth_token: 'jwt',
      }),
    ).not.toThrow()
  })

  it('throws if api_base_url is missing', () => {
    const card = new EduManageRoutinesCard()
    expect(() =>
      card.setConfig({ frontend_base_url: 'http://x', auth_token: 'jwt' } as never),
    ).toThrow(/api_base_url/)
  })

  it('throws if frontend_base_url is missing', () => {
    const card = new EduManageRoutinesCard()
    expect(() =>
      card.setConfig({ api_base_url: 'http://x', auth_token: 'jwt' } as never),
    ).toThrow(/frontend_base_url/)
  })

  it('throws if auth_token is missing', () => {
    const card = new EduManageRoutinesCard()
    expect(() =>
      card.setConfig({ api_base_url: 'http://x', frontend_base_url: 'http://x' } as never),
    ).toThrow(/auth_token/)
  })

  it('strips trailing slashes from base URLs', () => {
    const card = new EduManageRoutinesCard()
    card.setConfig({
      api_base_url: 'http://x:5090///',
      frontend_base_url: 'http://x:5173/',
      auth_token: 'jwt',
    })
    // Access via private config — cast to any is acceptable in tests.
    const cfg = (card as unknown as { config: CardConfig }).config
    expect(cfg.api_base_url).toBe('http://x:5090')
    expect(cfg.frontend_base_url).toBe('http://x:5173')
  })
})
```

Add `vitest.config.ts` if needed (`environment: 'jsdom'`). Install `jsdom` as a dev dep if the test environment requires it.

**`ha-card/test/api.test.ts`:**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchRoutines } from '../src/api'
import { ApiError } from '../src/types'

describe('fetchRoutines', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns routines on 200', async () => {
    const body = [{ id: '1', name: 'Push Day' }]
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 })),
    )
    const result = await fetchRoutines('http://x:5090', 'jwt')
    expect(result).toEqual(body)
  })

  it('sends Authorization header', async () => {
    const spy = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }))
    vi.stubGlobal('fetch', spy)
    await fetchRoutines('http://x:5090', 'jwt')
    expect(spy).toHaveBeenCalledWith(
      'http://x:5090/api/routines',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer jwt' }),
      }),
    )
  })

  it('throws ApiError with status 401 on 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 401 })))
    await expect(fetchRoutines('http://x', 'jwt')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
    })
  })

  it('throws ApiError with status 0 on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')))
    await expect(fetchRoutines('http://x', 'jwt')).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
    })
  })

  it('strips trailing slashes from baseUrl', async () => {
    const spy = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }))
    vi.stubGlobal('fetch', spy)
    await fetchRoutines('http://x:5090///', 'jwt')
    expect(spy).toHaveBeenCalledWith('http://x:5090/api/routines', expect.anything())
  })
})
```

### Step B7 — Build the bundle

```
cd ha-card
npm install
npm run build
```

Verify `dist/edumanage-routines.js` exists and is a single ES module. Commit `dist/`.

### Step B8 — `ha-card/README.md`

Document:

1. **Build:** `npm install && npm run build`.
2. **Install in HA:** copy `dist/edumanage-routines.js` → `<ha-config>/www/community/edumanage-routines/edumanage-routines.js`.
3. **Register resource:** HA → Settings → Dashboards → Resources → add `/local/community/edumanage-routines/edumanage-routines.js` as **JavaScript Module**.
4. **Add card YAML** (full example from the spec).
5. **Getting a token:** sign in to the EduManage frontend, open browser devtools → Application → Local Storage → copy the Auth0 access token, paste into `auth_token`.
6. **Token expiry:** expect a 401 after hours–days; the card shows a clear message; rotate the token manually.
7. **CORS caveat:** if the card shows a network error, verify `netbackend` allows the HA origin (`http://<ha-host>:8123`) in CORS.
8. **Security note:** anyone with HA access can read the YAML config and thus the JWT.

---

## Part C — Integration and acceptance

### Step C1 — CORS check

Check `netbackend` CORS config (search for `AddCors` / `UseCors` in `netbackend/src/EduManage.Api/`). If the allowed origins list does not already include the HA host, add it as a configurable value (appsettings + env override). This is only required if HA runs on a different origin than the modern frontend, which it almost certainly does.

Treat this as a one-liner config addition, not a feature. If the netbackend currently uses `AllowAnyOrigin` for development, this step is skipped — document in the README that production hardening is left to the netbackend owner.

### Step C2 — Manual acceptance

In a real HA instance:

1. Card renders with the configured title.
2. Routines list populates.
3. Refresh button re-fetches.
4. "Start" opens a new tab to the modern frontend; the routine auto-starts; URL is scrubbed.
5. Set `auth_token` to an expired/invalid JWT → card shows the 401 message.
6. Stop `netbackend` → card shows the network-error message.
7. Create a zero-routine account → card shows the empty state.

### Step C3 — Commit

Two commits, in order:

1. `feat(modern): auto-start routine from ?routineId= query param` — Part A.
2. `feat(ha-card): add Home Assistant Lovelace card for routines` — Part B (including `dist/` and README).

---

## Reuse checklist

- `store.startFromRoutine()` — do not duplicate start logic in the deep-link handler.
- Vitest config and conventions from the existing `modern/` test setup — mirror, do not reinvent.
- HA CSS variables — do not introduce custom color tokens; let the active HA theme drive appearance.
- `RoutineOut` field names on the backend DTO — read only what the card renders; do not mirror the whole type in `ha-card/src/types.ts`.

## Out of scope for this plan

- HACS packaging and release automation.
- An HA custom integration (Python) exposing routines as entities.
- Token-refresh story on the backend.
- Logging workout completion from inside HA.
