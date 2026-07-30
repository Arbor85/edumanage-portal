# Routing Slide Transitions + Sidebar Animations

**Date:** 2026-07-30  
**Scope:** `modern/` Vue 3 frontend — `App.vue`, `AppLayout.vue`, `SideBar.vue`, `style.css`, new composable

---

## Problem

1. Page navigation produces a visible blink. The existing `mode="out-in"` transition fades the current page out completely before the new one fades in, leaving a gap that reads as a bug.
2. The sidebar is static. Hover produces only a color change (`bg-white/8`). There is no spatial sense of where the user is or where they're going.

---

## Goals

- Navigation between pages feels like moving through one continuous app, not loading separate pages.
- Slide direction encodes position in the nav hierarchy (deeper = slide left, shallower = slide right).
- The sidebar's active state has a physical, animated indicator.
- Hovering anywhere in the sidebar produces a subtle glow that tracks the cursor.

---

## Architecture Change — Layout Shell

**Current:** Every page component wraps itself in `<AppLayout>`, which renders `<SideBar>`, `<BottomNav>`, `<NotificationToast>`, and `<ActiveWorkoutPill>`. The `RouterView` in `App.vue` transitions the entire page including the sidebar, which would cause the sidebar to slide with the content.

**New:** `App.vue` becomes the permanent layout shell. It renders the sidebar and chrome directly and places `<RouterView>` (with slide transition) inside `<main>`. `AppLayout.vue` becomes a transparent `<slot />` passthrough — pages keep `<AppLayout>` in their templates unchanged.

The shell is shown when `route.meta.requiresAuth === true && route.name !== 'Onboarding'`. All other routes (Login, AuthCallback, InviteAccept, Join, Onboarding) render a bare `<RouterView />` with no sidebar or chrome.

**No page components need to change.**

---

## Files

| File | Change |
|------|--------|
| `src/App.vue` | Permanent layout shell; RouterView with `:name="transitionName"` inside main |
| `src/components/layout/AppLayout.vue` | Becomes `<template><slot /></template>` passthrough |
| `src/composables/useRouteTransition.ts` | New — nav order, direction tracking, `transitionName` ref |
| `src/components/layout/SideBar.vue` | Sliding pill + cursor glow |
| `src/style.css` | `slide-left` and `slide-right` transition classes |

---

## `useRouteTransition` Composable

Defines the canonical nav order matching sidebar top-to-bottom:

```
index  path
  0    /                  Today
  1    /train             Train
  2    /progress          Progress
  3    /explore           Explore
  4    /profile           Profile
  5    /coach/clients     Clients
  6    /coach/plans       Plans
  7    /coach/meetings    Meetings
  8    /coach/courses     Courses
  9    /coach/equipment   Equipment
```

Registers `router.beforeEach`. On each navigation:
- Find `from` index and `to` index in the order array.
- If `toIndex > fromIndex` → `transitionName = 'slide-left'`
- If `toIndex < fromIndex` → `transitionName = 'slide-right'`
- If either route is not in the array (public routes, `/workout/active`) → `transitionName = ''` (instant swap, no transition)

Exposes: `{ transitionName }` (a `ref<string>`).

---

## Slide CSS

The `<main>` container gets `position: relative; overflow: hidden` so absolutely-positioned pages during transition don't overflow.

During transition, both the entering and leaving pages are `position: absolute; inset: 0` — this lets them overlap without layout shift, enabling a true simultaneous slide (no `mode="out-in"`).

```
slide-left  (navigating deeper in the nav):
  enter: translateX(60px) + opacity 0  →  settled
  leave: settled  →  translateX(-60px) + opacity 0

slide-right  (navigating back up the nav):
  enter: translateX(-60px) + opacity 0  →  settled
  leave: settled  →  translateX(60px) + opacity 0
```

- **Duration:** 280ms
- **Easing:** `cubic-bezier(0.32, 0.72, 0, 1)` (iOS drawer curve — already used in `BottomSheetPicker`)
- **Properties animated:** `transform` + `opacity` only (GPU)
- **Reduced motion:** `opacity 150ms ease`, no transform

The 60px offset is deliberate — readable as directional on desktop without feeling like a mobile full-page flip.

---

## Sidebar — Sliding Pill

An absolutely-positioned `<div>` behind the nav links. The `<nav>` container gets `position: relative`.

**Position tracking:** Template refs array on each nav link element. On route change, the active element's `offsetTop` and `offsetHeight` are read. The pill is translated to match:

```css
transform: translateY(pillTop px);
height: pillHeight px;   /* set via inline style, not animated */
```

Only `transform` transitions — `transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1)`.

**First mount:** Pill is placed without transition (no jarring initial slide). Implemented via a `mounted` boolean ref — `false` on init, set to `true` after `nextTick` in `onMounted`. The pill's inline `transition` style is `'none'` while `!mounted`, then switches to `'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)'`. Subsequent route changes animate.

**Appearance:** `bg-primary/20 rounded-xl` — same visual as the current active link background. The per-link active `:class` background is removed; the pill handles it entirely.

**Coach section:** Separate pill instance for the coach nav block (different `<nav>` container). Client and coach pills are independent.

---

## Sidebar — Cursor-Following Glow

A `position: absolute; inset: 0; pointer-events: none` overlay `<div>` on the sidebar.

On `mousemove` on the `<aside>`, `--glow-y` CSS variable is updated to `event.clientY - sidebar.getBoundingClientRect().top`. No transition on the variable itself — direct assignment so it tracks without lag.

```css
background: radial-gradient(
  140px circle at 50% var(--glow-y),
  rgba(0, 200, 150, 0.07) 0%,   /* primary color at 7% opacity */
  transparent 100%
);
```

- Opacity transitions: `0` at rest → `1` on `mouseenter`, back to `0` on `mouseleave`
- Transition: `opacity 400ms ease`
- Z-index: above the pill, below the nav link text

---

## Reduced Motion

All transform-based motion (slide transitions, pill movement, glow) is suppressed under `prefers-reduced-motion: reduce`. Existing global rule in `style.css` handles this. Slide transitions fall back to opacity-only fade.

---

## Out of Scope

- Mobile bottom nav slide transitions (BottomNav uses the same router; adding directional slides there is a separate task)
- Keyboard navigation visual feedback beyond what already exists
- Any change to page component internals
