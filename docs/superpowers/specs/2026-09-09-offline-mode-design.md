# Offline Mode Design

**Date:** 2026-09-09
**Scope:** Vue web app (`modern/`) — workout-critical path only
**Approach:** PWA lite (app shell service worker) + IndexedDB data cache via Dexie.js

---

## Goals

- Trainee and coach can open the app and view their routines, exercises, and plans with no network connection.
- Trainee and coach can start and complete a workout while offline.
- Completed workout data syncs to the backend automatically in the background the moment connectivity returns.
- No changes to the user's workout flow — offline behavior is transparent.

---

## Out of Scope

Clients, meetings, courses, equipment, organizer data, and all coach-management features are not cached. Only the workout-critical path is offline-capable.

---

## New Packages

| Package | Purpose |
|---------|---------|
| `vite-plugin-pwa` | Generates a service worker that caches the app shell (JS/CSS/HTML bundles) |
| `dexie` | Clean IndexedDB wrapper for all data caching and the sync queue |

---

## New Files

```
modern/src/
  db/
    offlineDb.ts              # Dexie database definition
  composables/
    useNetworkStatus.ts       # Reactive navigator.onLine wrapper
    useOfflineSync.ts         # Flushes workout queue on reconnect
  components/
    OfflineBanner.vue         # Non-blocking status bar
```

---

## Existing Files Modified

| File | Change |
|------|--------|
| `vite.config.ts` | Add `vite-plugin-pwa` with `generateSW` strategy, app shell caching only |
| `src/stores/routineStore.ts` | Fall back to IndexedDB when offline; write to IndexedDB after every fetch |
| `src/stores/planStore.ts` | Same pattern |
| `src/stores/exerciseStore.ts` | Same pattern; respects 1-hour freshness window via `syncMeta` |
| `src/stores/workoutStore.ts` | Route `finishWorkout()` through queue table when offline |
| `src/App.vue` | Mount `OfflineBanner`, start `useOfflineSync` |

---

## PWA Setup

`vite-plugin-pwa` is configured in `vite.config.ts` with the `generateSW` strategy. The service worker caches only static assets — the compiled JS/CSS/HTML bundles — so the app shell loads when the user opens the app offline after having visited it previously.

No runtime API caching is done in the service worker. All data caching is handled in JavaScript via IndexedDB. This avoids the complexity of intercepting Auth0-authenticated requests in a service worker context.

---

## Offline Database Schema

Single Dexie database: `EduManageOfflineDb` (version 1).

| Table | Primary Key | Indexes | Purpose |
|-------|-------------|---------|---------|
| `routines` | `id` | — | Full routine objects including exercises |
| `exercises` | `id` | — | Exercise library entries |
| `plans` | `id` | — | Plans with workout days |
| `workoutQueue` | `localId` (auto-increment) | — | Pending `CompleteRoutineCreate` payloads |
| `syncMeta` | `entity` | — | Last-synced timestamp per entity |

### `workoutQueue` entry shape

```ts
interface WorkoutQueueEntry {
  localId?: number
  payload: CompleteRoutineCreate
  queuedAt: string       // ISO timestamp
  attempts: number       // incremented on each failed POST; stops at 3
}
```

### `syncMeta` entry shape

```ts
interface SyncMetaEntry {
  entity: 'routines' | 'exercises' | 'plans'
  lastSyncedAt: string   // ISO timestamp
}
```

---

## Cache Population Strategy

The three workout-critical stores (`routineStore`, `planStore`, `exerciseStore`) follow this pattern for every fetch:

1. If `!navigator.onLine`: read from the corresponding Dexie table and return early.
2. If online: call the existing API service as usual.
3. On success: write the result to Dexie via `bulkPut` and update `syncMeta`.

**Cache freshness:** `exerciseStore` skips re-fetching if `syncMeta` shows a fetch within the last hour. Routines and plans always re-fetch when online (they change more frequently). A manual refresh button on the Explore page can force an exercise re-sync.

**After mutations (create/update/delete):** stores that already re-fetch after mutations will automatically refresh the IndexedDB copy. Stores that optimistically patch local state also patch the IndexedDB entry directly.

The API service files (`routinesApi.ts`, `plansApi.ts`, `exercisesApi.ts`) are not modified — all offline logic lives in the stores.

---

## Sync Queue

### Queuing (offline path)

`workoutStore.finishWorkout()` is modified to branch on `navigator.onLine`:

- **Online:** existing behavior — POST to `/api/routines/complete`, store result in history, clear active workout, redirect to completion screen.
- **Offline:** write payload to `workoutQueue` table, then clear active workout and redirect to completion screen as normal. The user sees no difference.

### Flushing (`useOfflineSync` composable)

Started once in `App.vue` on mount; lives for the app's lifetime.

**Triggers:**
- `window.addEventListener('online', flush)` — fires when connectivity returns
- On startup: if `navigator.onLine` and queue is non-empty, flush immediately (handles the case where the user reconnected between sessions)

**Flush logic (sequential, not parallel):**
1. Fetch all `workoutQueue` entries ordered by `queuedAt`.
2. For each entry: POST to `/api/routines/complete`.
3. On success: delete entry from queue; show `NotificationToast` ("Workout synced").
4. On failure: increment `attempts`. If `attempts >= 3`: show error toast ("Failed to sync workout — will retry when online") and leave entry in queue. Do not continue to next entry after a failure — retry next time.

---

## Network Status (`useNetworkStatus`)

```ts
const isOnline = ref(navigator.onLine)
window.addEventListener('online', () => { isOnline.value = true })
window.addEventListener('offline', () => { isOnline.value = false })
```

Exported as a singleton composable (called once, shared via provide/inject or imported directly). Used by `OfflineBanner` and `useOfflineSync`.

---

## UI Feedback

### `OfflineBanner.vue`

Positioned below the top navigation bar, above page content. Does not block interaction.

| State | Appearance |
|-------|-----------|
| Offline | Amber bar: "You're offline. Viewing cached data." |
| Back online, queue non-empty | Blue bar: "Syncing workouts…" + spinner |
| Sync complete | Banner disappears; `NotificationToast` fires "All workouts synced" |
| Sync error (3 attempts exceeded) | `NotificationToast` fires "Failed to sync 1 workout — will retry when online"; banner disappears |

### Active Workout Page

No changes. The workout tracking flow (`ActiveWorkoutPage`, `WorkoutTracker`, etc.) is entirely unchanged. The offline branching is invisible to the user during a workout.

---

## Edge Cases

**Page refresh while offline mid-workout:** `workoutStore` already recovers active workout state from `localStorage` on mount (existing behavior). The IndexedDB layer is additive and does not replace `localStorage` for the active workout.

**First visit ever (no cache):** If the user has never loaded the app online, the service worker has nothing cached and IndexedDB is empty. In this case the app shows a standard network error — no special handling needed.

**Auth token expiry while offline:** Auth0 token refresh requires network. If the token expires while offline, the user remains on whatever page they're on (the router guard doesn't re-check mid-session). On reconnect the existing 401 interceptor in `apiClient.ts` will trigger Auth0 re-authentication as usual.

**Sync queue corruption:** On app startup, `workoutQueue` entries with `attempts >= 3` are surfaced via a persistent toast so the user knows data is waiting and can contact support if needed. They are never silently dropped.
