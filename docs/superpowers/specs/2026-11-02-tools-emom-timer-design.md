# Tools Category & EMOM Timer — Design Spec

**Date:** 2026-11-02  
**Status:** Approved

---

## Overview

Adds a new "Tools" section to the edumanage-portal for all authenticated users. Tools are self-contained interactive utilities users can run directly in the app. The first tool is an **EMOM Timer** (Every Minute On the Minute) — a configurable interval timer for structured workout rounds.

---

## Navigation & Routing

### Nav placement
"Tools" is added to the **client section** of the sidebar and bottom nav — the section visible to all authenticated users. It uses the `Timer` Lucide icon.

Files changed:
- `modern/src/components/layout/SideBar.vue`
- `modern/src/components/layout/BottomNav.vue`

### Routes
Two new routes added to `modern/src/router/index.ts`, both with `requiresAuth: true`:

| Path | Component | Description |
|------|-----------|-------------|
| `/tools` | `ToolsPage.vue` | Hub page — grid of tool cards |
| `/tools/emom-timer` | `tools/EmomTimerPage.vue` | EMOM timer tool |

Both are lazy-loaded via dynamic `import()`.

---

## File Structure

```
modern/src/pages/
  ToolsPage.vue              # hub grid
  tools/
    EmomTimerPage.vue        # EMOM timer
modern/src/composables/
  useEmomTimer.ts            # timer logic composable
```

---

## Tools Hub Page (`ToolsPage.vue`)

Authenticated page wrapped in `AppLayout`. Displays a CSS grid of tool cards. Each card contains:
- Icon (Lucide)
- Title
- Short description
- Clicking navigates to the tool's route via `RouterLink` or `router.push()`

Initial card:
- **EMOM Timer** — icon: `Timer` — description: "Every Minute On the Minute workout timer"

No store, no API calls. Purely static navigation. Grid layout accommodates future tools without layout changes.

---

## EMOM Timer Page (`tools/EmomTimerPage.vue`)

### States

**1. Setup**
User configures the session before starting:

| Field | Type | Range | Default |
|-------|------|-------|---------|
| Number of rounds | integer | 1–60 | 8 |
| Delay between rounds (seconds) | integer | 1–30 | 10 |

A "Start" button initiates the timer.

**2. Running**
Full-screen focused view. All setup inputs hidden.

Displayed elements:
- Phase label: `"Work"` during the 60-second round, `"Rest"` during the inter-round delay
- Round indicator: `"Round X of Y"` (only shown during work phases; during rest: `"Rest — Round X+1 coming up"` or similar)
- Large countdown clock: seconds remaining in current phase
- **Pause / Resume** button — freezes/resumes the countdown at any moment
- **Stop** button — cancels the session and returns to Setup state, preserving the last-used config values

**3. Complete**
Shown after the final round's work phase ends (no trailing rest after last round).

Displayed elements:
- "Workout complete!" message
- Total rounds completed
- "Start again" button — resets countdown, returns to Setup with same config values pre-filled

### Timer flow

```
[Setup] → Start
  → Work 60s (Round 1)
  → Rest Ns
  → Work 60s (Round 2)
  → Rest Ns
  → ...
  → Work 60s (Round N)  ← no rest after final round
  → [Complete]
```

Pause can interrupt any phase. Resume continues from the frozen second.

---

## Timer Composable (`useEmomTimer.ts`)

Encapsulates all timer state and tick logic. The page component stays thin — it only reads composable values and calls composable actions.

### Signature

```ts
function useEmomTimer(rounds: number, delaySeconds: number): {
  phase: Ref<'idle' | 'work' | 'rest' | 'complete'>
  currentRound: Ref<number>
  secondsLeft: Ref<number>
  isPaused: Ref<boolean>
  start(): void
  pause(): void
  resume(): void
  stop(): void
}
```

### Internals

- Single `setInterval` at 1-second tick
- On each tick: decrement `secondsLeft`
- When `secondsLeft` reaches 0:
  - If `phase === 'work'` and more rounds remain → switch to `'rest'`, set `secondsLeft = delaySeconds`
  - If `phase === 'work'` and no rounds remain → set `phase = 'complete'`, clear interval
  - If `phase === 'rest'` → increment `currentRound`, switch to `'work'`, set `secondsLeft = 60`
- `pause()` clears the interval, sets `isPaused = true`
- `resume()` restarts the interval, sets `isPaused = false`
- `stop()` clears the interval, resets all state to `'idle'`
- `onUnmounted` hook clears the interval to prevent memory leaks

---

## Constraints & Decisions

- **No Pinia store** — timer state is entirely local to the page; no need to persist across navigation
- **No Web Audio** — no sounds; visual-only feedback
- **Lucide icons only** — `Timer` for nav and hub card; `Play`, `Pause`, `Square` for controls
- **No backend changes** — fully client-side feature
- **Config preserved on completion** — "Start again" re-uses the last round/delay values
