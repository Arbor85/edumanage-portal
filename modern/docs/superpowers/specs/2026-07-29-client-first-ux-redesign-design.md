# EduManage Portal — Client-First UX Redesign
**Date:** 2026-07-29  
**Scope:** `modern/` Vue 3 app  
**Approach:** Role-aware single app — client-first by default, trainer tools as a Coach section

---

## 1. Goals

- Make the app the primary standalone tool clients use to train, track progress, and stay engaged — with or without a trainer.
- Redesign the visual identity to be dark, bold, and premium (Apple Fitness+ × Nike Training Club).
- Add engagement features that respect the user: cumulative progress visualization, daily micro-challenges, and satisfying workout interactions — no punishing streak mechanics.
- Preserve and extend trainer capabilities as a role-gated Coach section without disrupting the client experience.

---

## 2. Design System

### 2.1 Theme
- **Default:** Dark. Light mode remains optional via existing `DarkModeToggle`.
- Background stack (dark): `#0D0F12` (page) → `#141720` (cards) → `#1C2030` (elevated/modals) → `#252A3A` (inputs, secondary cards).

### 2.2 Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#00C896` | Primary actions, active states, positive data |
| `primary-light` | `#E6FAF4` | Light mode only surfaces |
| `primary-dark` | `#00A67A` | Hover states |
| `accent` | `#FF6B35` | PRs, challenge completions, high-intensity moments |
| `surface` | `#0D0F12` | Page background |
| `surface-card` | `#141720` | Cards |
| `surface-elevated` | `#1C2030` | Modals, dialogs |
| `surface-input` | `#252A3A` | Inputs, secondary cards |
| `text-primary` | `#FFFFFF` | Headlines, body |
| `text-secondary` | `#8B92A5` | Labels, secondary info |
| `text-muted` | `#4A5168` | Placeholders, disabled |
| `difficulty-beginner` | `#00C896` | Beginner badges |
| `difficulty-intermediate` | `#F59E0B` | Intermediate badges |
| `difficulty-advanced` | `#EF4444` | Advanced badges |

Update `tailwind.config.ts` to replace the existing palette with these tokens. All existing components reference `bg-surface`, `text-primary`, etc. via the existing token system — color values swap in place.

### 2.3 Typography
- **Font:** Inter (already loaded). No font change required.
- **Scale and weight usage:**
  - Page hero / workout name: `text-5xl` to `text-6xl font-black` (900)
  - Section headings: `text-2xl font-bold`
  - Category labels: `text-xs font-bold tracking-widest uppercase text-text-secondary`
  - Body: `text-base font-normal`
  - Stats / numbers: `text-4xl font-bold tabular-nums`
  - Set values (weight, reps): `text-3xl font-bold tabular-nums`
- Remove `TopNav.vue` per-page title — replace with inline large bold page headers inside each page component.

### 2.4 Motion Principles
All animations respect `prefers-reduced-motion`. Default durations:

| Interaction | Animation | Duration |
|-------------|-----------|----------|
| Button press | `scale(0.97)` | 100ms ease-out |
| Card hover | `translateY(-2px)` + shadow lift | 150ms ease |
| Page transition | Fade + `translateY(8px)` up | 200ms ease |
| Modal entrance | Fade + `scale(0.96→1)` | 200ms ease |
| Number reveal | Count-up from 0 | 600ms ease-out |
| Progress bar fill | Width animate from 0 | 800ms ease-out |
| Set completion | Green pulse ring + checkmark | 300ms |
| PR achieved | `#FF6B35` bolt pulse | 400ms |
| Challenge completion | Card fill + radial burst | 500ms |

Implement using CSS transitions + Headless UI for modals, and a small `useCountUp` composable for stat reveals.

### 2.5 Scrollbar & Polish
- Custom scrollbar styles on all scrollable containers (already in Tailwind plugin — keep).
- `border-radius` unified: cards `rounded-2xl`, buttons `rounded-xl`, inputs `rounded-lg`, badges `rounded-full`.
- Shadows: use glow variants on dark — `box-shadow: 0 0 20px rgba(0, 200, 150, 0.15)` on primary-colored elements.

---

## 3. Information Architecture & Navigation

### 3.1 Client Navigation (all users)

| Position | Icon | Route | Label |
|----------|------|-------|-------|
| 1 | `home` | `/` (Today) | Today |
| 2 | `dumbbell` | `/train` | Train |
| 3 | `trending-up` | `/progress` | Progress |
| 4 | `compass` | `/explore` | Explore |
| 5 | `user` | `/profile` | Profile |

- **SideBar.vue** rebuilt with these 5 items. Trainer-only Coach section appended below a `<hr>` divider when `authStore.isTrainer === true`.
- **BottomNav.vue** shows same 5 items. Active workout FAB becomes a persistent floating pill docked above the tab bar (`ActiveWorkoutPill.vue`) — shows exercise name + elapsed time. Tapping it returns to the active workout full-screen view.
- **TopNav.vue** removed. Each page owns its header.

### 3.2 Coach Section (trainers only)

Appended to sidebar below divider:

| Icon | Route | Label |
|------|-------|-------|
| `users` | `/coach/clients` | Clients |
| `clipboard-list` | `/coach/plans` | Plans |
| `calendar` | `/coach/meetings` | Meetings |
| `book-open` | `/coach/courses` | Courses |
| `package` | `/coach/equipment` | Equipment |

- Routes prefixed `/coach/*` map to existing page components (ClientsPage, PlansPage, etc.) — minimal routing change.
- A "Coach View" pill badge in the sidebar header indicates when a trainer is in Coach context.

### 3.3 Role Detection
- `authStore` reads `user['https://edumanage.app/roles']` from Auth0 token (custom claim set on Auth0 Action).
- Exposes `isTrainer: ComputedRef<boolean>`.
- If no role claim exists, defaults to `client`.
- Users can hold both roles (`['client', 'trainer']`).

### 3.4 Route Changes

| Old Route | New Route | Notes |
|-----------|-----------|-------|
| `/dashboard` | `/` | TodayPage replaces DashboardPage |
| `/exercises` | `/explore` | ExercisesPage becomes ExplorePage |
| `/routines` | `/train` | RoutinesPage becomes TrainPage |
| `/history` | `/progress` | HistoryPage becomes ProgressPage |
| `/clients` | `/coach/clients` | Trainer only |
| `/plans` | `/coach/plans` | Trainer only |
| `/meetings` | `/coach/meetings` | Trainer only |
| `/courses` | `/coach/courses` | Trainer only |
| `/equipment` | `/coach/equipment` | Trainer only |
| `/active-workout` | `/active-workout` | Unchanged |

---

## 4. Client Experience

### 4.1 Onboarding (new — `/onboarding`)

4-step wizard shown once after first login if `userProfile.onboardingComplete !== true`.

**Step 1 — Goal** (single select)
- Build muscle
- Lose weight  
- Stay active
- Follow my trainer's plan

**Step 2 — Experience**
- Beginner (< 1 year)
- Intermediate (1–3 years)
- Advanced (3+ years)

**Step 3 — Equipment** (multi-select)
- No equipment
- Dumbbells
- Barbell & rack
- Full gym access

**Step 4 — Reminder** (optional)
- Time picker for daily workout reminder
- Skip option

Stored on user profile via `PATCH /api/users/profile`. On completion, sets `onboardingComplete: true` and redirects to `/`.

Wizard uses a shared `OnboardingLayout.vue` — dark full-screen, large centered question, progress dots at top.

### 4.2 Today Page (`/` — TodayPage.vue)

Three vertical zones:

**Hero Zone — Today's Workout Card**
- If trainer has assigned a plan with a workout for today: show that workout (name, estimated duration, muscle group pills, difficulty badge).
- If no assigned workout: show a smart suggestion based on onboarding goals + equipment + last trained muscle group (avoid repeating same muscle group two days in a row).
- If client has no history and no plan: show "Start your first workout" prompt with a `Begin` button.
- CTA: single large `Start Workout` button (`w-full h-16 text-xl font-bold`).

**Daily Challenge Card**
- One randomly selected micro-task per day (seeded by date so all clients get consistent challenges, avoids duplicates within 30 days).
- Challenge types: reps (10 push-ups), distance (1km walk/run), duration (60s plank), flexibility (5min stretch).
- Single `Mark Done` button. On tap: card fills with primary green, checkmark animates in, confetti burst via `canvas-confetti` lib.
- If today's workout is in progress or completed, Challenge card moves to hero position.
- Stored in new `challengeStore.ts`. Logged via `POST /api/challenges/log`.

**Effort Snapshot**
- Three stat cards in a row: `Volume this week` (total kg lifted or min active), `Workouts done` (this month), `Personal records` (all-time count).
- Numbers animate (count-up) when scrolled into view using `IntersectionObserver`.
- Tapping any stat navigates to the relevant section of `/progress`.

### 4.3 Train Page (`/train` — TrainPage.vue)

Replaces RoutinesPage. Two tabs: **My Routines** | **Active Plan**.

- **My Routines** tab: existing routine list with new dark card styling. Search bar at top.
- **Active Plan** tab: shows trainer-assigned plan (if any) with workout schedule. Each day is a row — past days greyed out, today highlighted in primary, future days normal.
- Start workout button on each routine/plan workout.

### 4.4 Active Workout (ActiveWorkoutPage.vue — major redesign)

Full-screen immersive layout. No sidebar. No top nav. Custom `ActiveWorkoutLayout.vue`.

**Header bar** (compact, 56px):
- Left: `X` exit button (confirms before leaving)
- Center: workout name (truncated)
- Right: elapsed timer `HH:MM:SS` (counts up)

**Current Exercise Hero:**
- Exercise name: `text-5xl font-black` 
- Muscle group label: `text-xs uppercase tracking-widest text-text-secondary`
- Muscle diagram SVG (new `MuscleDiagram.vue` component) — highlights primary/secondary muscles in primary/accent colors

**Set List:**
- Each set is a large touch-target row (`min-h-16`)
- Weight and reps are tappable inline — tap opens a bottom sheet number picker (no modal, no route change)
- Completing a set: tap checkmark → green pulse ring animation → row slides to "done" state with strikethrough styling
- PR indicator: if weight × reps exceeds previous best, `#FF6B35` bolt icon pulses next to the weight field

**Rest Timer** (`RestTimerOverlay.vue`):
- Auto-starts after logging a set (uses trainer-configured rest time or global default 90s)
- Full-screen dark overlay with large countdown number + circular progress ring
- `Skip` button bottom center
- Counts down with subtle tick animation per second

**Exercise Queue** (bottom of screen):
- Horizontal scroll strip showing upcoming exercises
- Swipe left/right to jump (with confirmation if current set incomplete)

**Finish Screen** (`WorkoutCompleteView.vue`):
- Full-screen celebration view (not a modal)
- Stats: duration, total volume, sets completed, muscles worked
- Body silhouette with trained muscles highlighted
- Notes field: single-line text input ("How did it feel?")
- `Share` button: generates a branded static image card (workout name, stats, app logo) using `html2canvas`
- `Done` button: saves workout, navigates to Progress page

### 4.5 Progress Page (`/progress` — ProgressPage.vue)

Replaces HistoryPage.

**Tabs:** Overview | Records | History

**Overview tab:**
- Cumulative volume area chart (total kg lifted per week, 12-week view) — using `Chart.js` or `unovis` (lightweight)
- Muscle balance body silhouette: color intensity = training frequency this month
- Active days heatmap: 12-week grid, cell color = workout intensity (volume-based). No "streak" language — labeled "Your training pattern"

**Records tab:**
- List of all-time PRs per exercise (weight × reps, or distance/time for cardio)
- Sorted by most recently set
- Each row: exercise name, PR value, date achieved, delta from starting PR

**History tab:**
- Existing workout history list, restyled
- Each row: date, workout name, duration, volume
- Tap → detail view (existing behavior, restyled)

### 4.6 Explore Page (`/explore` — ExplorePage.vue)

Replaces ExercisesPage. Same data, better framing.

- Grid of exercise cards with muscle group filter pills at top (horizontal scroll)
- Search bar
- Equipment filter (uses onboarding data to pre-filter — can override)
- Exercise card: large image/illustration, name, muscle group, difficulty badge
- Tap → detail sheet with description, muscles, demo (if available), "Add to routine" button

---

## 5. Trainer (Coach) Experience

### 5.1 Coach Section Access
- Sidebar shows Coach section only when `authStore.isTrainer === true`
- All `/coach/*` routes have `meta: { requiresTrainer: true }` guard
- Non-trainers navigating to `/coach/*` are redirected to `/`

### 5.2 Clients Page (`/coach/clients` — ClientsPage.vue)

Existing functionality preserved, visual updates only:

- Kanban view default (existing — switch to List available)
- Client card additions: last active date, current plan name, engagement ring (colored border: green = active this week, amber = inactive 2+ weeks, gray = never logged workout)
- **Nudge button** (`NudgeButton.vue`): single tap sends push notification to client — "Your trainer is cheering you on 💪". Rate-limited to once per client per day. Calls `POST /api/notifications/nudge`.

### 5.3 Client Detail (expanded)

Client detail opens as a **full page** (`/coach/clients/:id`) instead of a dialog.

Sections:
- Current plan progress (% of plan workouts completed)
- Last 4 workouts (date, name, volume) 
- PRs achieved this month (count + list)
- Training pattern heatmap (same component as client's own Progress page, rendered for trainer view)
- Quick actions: Assign Plan, Schedule Meeting, Leave Note

### 5.4 Plans, Meetings, Courses, Equipment

Existing pages (`PlansPage`, `MeetingsPage`, `CoursesPage`, `EquipmentPage`) moved to `/coach/*` routes. Visual restyling only — no functional changes.

---

## 6. New Features Summary

| Feature | Type | Priority |
|---------|------|----------|
| Onboarding wizard | New page/flow | Critical |
| Daily challenges system | New store + backend entity + UI card | Critical |
| Progress page (charts, heatmap, PRs) | New page replacing History | Critical |
| PR detection | New logic in workoutStore | Critical |
| Inline set editing (bottom sheet picker) | New component | High |
| Rest timer auto-start | Behavior change in ActiveWorkout | High |
| Workout finish/celebration screen | New view | High |
| Skeleton loaders | New component pattern | High |
| Trainer nudge | New button + backend endpoint | High |
| Client detail full page | Route + page change | High |
| Muscle diagram SVG | New component | Medium |
| Workout share card (html2canvas) | New feature on finish screen | Medium |
| Body silhouette muscle balance | New component | Medium |
| Page transition animations | CSS + Vue transitions | Medium |
| Button press / card hover animations | CSS updates | Medium |
| Number count-up on reveal | New composable | Medium |
| Equipment filter using onboarding data | Store logic | Medium |
| Post-workout notes field | New field on finish screen | Medium |
| ActiveWorkoutPill (persistent floating pill) | New component | Medium |

---

## 7. Backend Requirements

New endpoints needed (create `src/services/prompts_ux-redesign.md` with full specs):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/challenges/today` | GET | Returns today's daily challenge |
| `/api/challenges/log` | POST | Logs a completed challenge |
| `/api/users/profile` | GET / PATCH | User profile including onboarding fields |
| `/api/notifications/nudge` | POST | Trainer sends nudge to client |
| `/api/progress/overview` | GET | Aggregated progress stats (volume by week, PRs, heatmap data) |
| `/api/exercises/:id/records` | GET | All-time PRs for an exercise for the current user |

Auth0 custom Action required: add `https://edumanage.app/roles` array claim to token from user metadata.

---

## 8. Component Inventory

### New Components
- `TodayPage.vue` — replaces DashboardPage
- `TrainPage.vue` — replaces RoutinesPage  
- `ProgressPage.vue` — replaces HistoryPage
- `ExplorePage.vue` — replaces ExercisesPage
- `OnboardingPage.vue` + `OnboardingLayout.vue`
- `WorkoutCompleteView.vue` — finish screen
- `RestTimerOverlay.vue` — fullscreen rest timer
- `MuscleDiagram.vue` — SVG muscle highlight
- `DailyChallengeCard.vue` — today page challenge
- `EffortSnapshotCard.vue` — today page stats row
- `ActiveWorkoutPill.vue` — persistent floating pill
- `VolumeChart.vue` — area chart (Chart.js wrapper)
- `TrainingHeatmap.vue` — GitHub-style calendar grid
- `BodySilhouette.vue` — muscle balance silhouette
- `PRList.vue` — personal records list
- `NudgeButton.vue` — trainer nudge
- `ClientDetailPage.vue` — full-page client detail
- `BottomSheetPicker.vue` — inline number picker for sets
- `WorkoutShareCard.vue` — html2canvas share image

### New Composables
- `useCountUp(target, duration)` — animated number reveal
- `useIntersectionReveal()` — trigger animations on scroll-into-view
- `useDailyChallenge()` — fetch + log challenge
- `useWorkoutSuggestion()` — smart workout suggestion logic

### New Stores
- `challengeStore.ts` — daily challenge state
- `progressStore.ts` — aggregated progress data, PRs

### Modified Components
- `SideBar.vue` — new nav items, Coach section
- `BottomNav.vue` — new nav items, ActiveWorkoutPill integration
- `AppLayout.vue` — remove TopNav, add ActiveWorkoutPill slot
- `ActiveWorkoutPage.vue` — major redesign (keep existing logic, replace template)
- `BaseButton.vue` — add press scale animation
- `BaseCard.vue` — add hover lift animation, new dark surface colors
- `BaseModal.vue` — add entrance animation
- `BaseSpinner.vue` — keep, also add `SkeletonLoader.vue` as alternative

---

## 9. Out of Scope

- `web-vue/` app — not touched in this redesign
- `mobile/` app — separate effort
- `backend/` (FastAPI legacy) — no changes
- Social/community features (following, sharing workouts publicly)
- Nutrition tracking
- Video exercise demonstrations
- Payments / subscriptions
