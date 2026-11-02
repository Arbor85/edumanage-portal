# Calorie Calculator (Assessment + Results) — Design Spec

**Date:** 2026-11-02  
**Status:** Approved  
**Scope:** Subsystem 1 of 3 — Initial Assessment, Calculation Engine, Results Dashboard

---

## Overview

A guided questionnaire that collects user biometrics, activity, training, and goals, then computes BMR, TDEE, and four personalised calorie scenarios (loss, maintenance, gain, recomposition) plus macro ranges. Results are displayed as a dashboard with charts. Data is **session-only** (no backend, no IndexedDB). Lives in the existing Tools section.

---

## 1. Navigation & Routing

### New tool card
Added to `modern/src/pages/ToolsPage.vue`:
- Icon: `Calculator` (Lucide)
- Title: "Calorie Calculator"
- Description: "Estimate your TDEE and healthy calorie targets"
- Route: `/tools/calorie-calculator`

### Routes
Added to `modern/src/router/index.ts`, both `requiresAuth: true`:

| Path | Component | Notes |
|------|-----------|-------|
| `/tools/calorie-calculator` | `tools/CalorieWizardPage.vue` | Multi-step questionnaire |
| `/tools/calorie-calculator/results` | `tools/CalorieResultsPage.vue` | Redirects to wizard if store not completed |

**Results route guard:** if `calorieStore.results.completed === false`, redirect to `/tools/calorie-calculator`.

### File layout
```
modern/src/pages/tools/
  CalorieWizardPage.vue          # wizard shell (progress bar, nav, step host)
  CalorieResultsPage.vue         # results dashboard
  calorie/
    steps/
      StepBasicInfo.vue
      StepActivity.vue
      StepTraining.vue
      StepHistory.vue
      StepHealth.vue
      StepGoal.vue
    components/
      CalorieRangeChart.vue      # Chart.js horizontal bar chart
      MacrosCard.vue
      SafetyFlagsCard.vue
      ScenarioTable.vue

modern/src/stores/
  calorieStore.ts

modern/src/utils/
  calorieCalc.ts                 # pure calculation functions, no Vue/store deps
```

---

## 2. State — `calorieStore.ts`

Pinia store. **Not persisted** — session only. Cleared when user clicks "Recalculate".

### Wizard answer types

```ts
type Sex = 'male' | 'female'
type OccupationLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'highly_active' | 'very_highly_active'
type DailySteps = 'below_3k' | '3k_5k' | '5k_8k' | '8k_12k' | 'above_12k' | 'unknown'
type ActivityType = 'running' | 'strength' | 'cycling' | 'swimming' | 'walking' | 'team_sports' | 'other'
type Intensity = 'low' | 'moderate' | 'high'
type WeightTrend = 'stable' | 'increasing' | 'decreasing'
type PrimaryGoal = 'loss' | 'maintenance' | 'gain' | 'recomp'

interface TrainingActivity {
  type: ActivityType
  sessionsPerWeek: number
  avgDurationMin: number
  intensity: Intensity
  weeklyVolumeKm?: number      // optional, running/cycling
}

interface WizardAnswers {
  // Step 1 — Basic info
  profile: {
    age: number
    sex: Sex
    heightCm: number
    weightKg: number
    waistCm?: number
    bodyFatPct?: number
    bodyFatMethod?: string
  }
  // Step 2 — Daily activity
  activity: {
    occupationLevel: OccupationLevel
    dailySteps: DailySteps
  }
  // Step 3 — Training
  training: {
    activities: TrainingActivity[]
    volumeVariesSignificantly: boolean
  }
  // Step 4 — Weight history
  history: {
    weightTrend: WeightTrend
    recentWeightChangeKg?: number       // over last 4 weeks
    tracksCalories: boolean
    avgDailyKcal?: number
    trackingDurationWeeks?: number
    weighFrequency?: 'daily' | 'few_per_week' | 'weekly' | 'rarely'
    consistentConditions?: boolean
  }
  // Step 5 — Health screening
  health: {
    isMinor: boolean
    isPregnantOrBreastfeeding: boolean
    hasEatingDisorder: boolean
    hasMetabolicCondition: boolean
    unexplainedWeightChanges: boolean
  }
  // Step 6 — Goal
  goal: {
    primary: PrimaryGoal
    desiredRateKgPerWeek?: number
  }
}
```

### Results type

```ts
interface CalorieRange { low: number; high: number }

interface Scenario {
  kcalRange: CalorieRange
  weeklyWeightChangeRange: CalorieRange   // kg, negative = loss
  deficitOrSurplusRange: CalorieRange     // kcal/day relative to TDEE
  notes: string[]                          // static explanatory strings
}

interface CalorieResults {
  bmr: number
  tdeeRange: CalorieRange
  tdeeSource: 'theoretical' | 'history-calibrated'
  scenarios: {
    loss: Scenario
    maintenance: Scenario
    gain: Scenario
    recomp: Scenario
  }
  macros: {
    proteinGRange: CalorieRange
    fatGRange: CalorieRange
    carbGRange: CalorieRange
  }
  safetyFlags: string[]
  completed: boolean
}
```

### Store actions
- `setStepData(step, data)` — update wizard answers for a given step
- `compute()` — calls `calorieCalc.ts`, writes results, sets `completed = true`
- `reset()` — clears all answers and results, sets `completed = false`

---

## 3. Wizard — `CalorieWizardPage.vue`

Shell component that manages step index and renders the active step component.

### Layout
- Back button (← to Tools hub on step 1; previous step otherwise)
- Page title: "Calorie Calculator"
- Progress bar: step X of 6 (percentage fill)
- Active step component (dynamic component or v-if chain)
- Next / Finish button (disabled until step validates)

### Step routing
Steps are **not separate routes** — they are view states inside the single `/tools/calorie-calculator` page. Browser back button goes to the previous step (handled via a local `currentStep` ref).

### Step components contract
Each step component:
- Receives current store values as props (pre-fills on back navigation)
- Emits `valid(data)` when its local form is valid — parent enables Next
- Emits `submit(data)` when Next/Finish is clicked — parent writes to store

### Conditional logic
- Step 3 (Training): user can add multiple activities with an "Add activity" button; list is empty by default (valid with 0 activities)
- Step 4 (History): calorie tracking sub-questions (avg intake, duration, conditions) shown only if `tracksCalories = true`
- Step 5 (Health): all are yes/no toggles; any `true` generates a safety flag but does **not** block progress
- Step 6 (Goal): desired rate input shown after goal selection; system clamps unrealistic values and explains why

### On completion (step 6 Next)
1. Write step 6 data to store
2. Call `calorieStore.compute()`
3. `router.push('/tools/calorie-calculator/results')`

---

## 4. Calculation Engine — `calorieCalc.ts`

Pure TypeScript — no framework dependencies. Takes `WizardAnswers`, returns `CalorieResults`. All formulas deterministic and unit-testable.

### 4.1 BMR

**Default — Mifflin-St Jeor:**
```
Male:   BMR = (10 × weight) + (6.25 × height) − (5 × age) + 5
Female: BMR = (10 × weight) + (6.25 × height) − (5 × age) − 161
```

**Alternative — Katch-McArdle** (used when `bodyFatPct` is provided and plausible):
```
LBM = weightKg × (1 − bodyFatPct / 100)
BMR = 370 + (21.6 × LBM)
```

Katch-McArdle is preferred for athletes because it ignores fat mass, which doesn't contribute significantly to resting metabolism.

### 4.2 TDEE — Layered construction

TDEE is not a single multiplier. It is built in layers:

**Layer 1 — NEAT (Non-Exercise Activity Thermogenesis)**
Occupation × steps multiplier applied to BMR:

| Occupation | Base multiplier |
|-----------|----------------|
| Sedentary | 1.20 |
| Lightly active | 1.375 |
| Moderately active | 1.55 |
| Highly active | 1.725 |
| Very highly active | 1.90 |

Steps bucket adjusts the multiplier by ±0.05 to ±0.10. For example, a sedentary worker taking >12k steps/day is closer to lightly active.

**Layer 2 — EAT (Exercise Activity Thermogenesis)**
Each training activity contributes weekly exercise calories, estimated via MET values:

| Activity | Low intensity MET | Moderate | High |
|----------|------------------|----------|------|
| Running | 7 | 9 | 12 |
| Strength training | 3.5 | 5 | 6 |
| Cycling | 6 | 8 | 11 |
| Swimming | 5 | 7 | 9 |
| Walking | 3 | 4 | 4.5 |
| Team sports | 5 | 7 | 9 |
| Other | 4 | 6 | 8 |

`EAT_weekly = Σ (MET × weightKg × durationHours × sessions)`  
`EAT_daily = EAT_weekly / 7`

The NEAT multiplier is applied to BMR only, not to exercise calories, to avoid double-counting.

**Layer 3 — TEF (Thermic Effect of Food)**
`TEF = (NEAT_TDEE + EAT_daily) × 0.10`

**Theoretical TDEE:**
`TDEE_theoretical = BMR × NEAT_multiplier + EAT_daily + TEF`

**Layer 4 — History calibration (optional)**
Applied only when:
- `tracksCalories = true`
- `avgDailyKcal` is provided
- `trackingDurationWeeks ≥ 2`
- `consistentConditions = true`
- `weightTrend = 'stable'`

If all conditions met, a history-derived TDEE is computed:
`TDEE_history = avgDailyKcal`  (stable weight = intake ≈ expenditure)

Final TDEE is blended: 60% theoretical, 40% history when calibration applies. `tdeeSource` is set to `'history-calibrated'`.

**TDEE range:**
Output is always a range reflecting estimation uncertainty: `[TDEE × 0.92, TDEE × 1.08]`.

### 4.3 Training load assessment

Used to moderate recommendations (not block them). A `trainingLoadScore` (low / moderate / high / very_high) is derived from:
- Total weekly training hours
- Intensity distribution
- Number of disciplines

High/very_high load → loss deficit capped at −10% instead of −20%, with a note about recovery.

RED-S risk flagged when: female + high training load + loss goal + estimated intake would drop below 1600 kcal.

### 4.4 Four scenarios

All computed from the TDEE midpoint, then expressed as ranges.

**Loss:**
- Default deficit: 10–20% below TDEE
- High training load: capped at 10% deficit
- Min floor: 1400 kcal (female), 1600 kcal (male) — safety flag if breached
- Weekly weight loss range: deficit range ÷ 7700 kcal/kg (fat energy density)
- Desired rate is noted but clamped to ≤ 0.75 kg/week

**Maintenance:**
- TDEE range ± 50 kcal
- Weekly weight change: ±0.1 kg (normal fluctuation)

**Gain:**
- Surplus: 5–10% above TDEE
- Weekly weight gain range: surplus ÷ 7700
- Note: progressive strength training required for muscle-oriented gain

**Recomposition:**
- Maintenance or −5% deficit
- Only viable note shown if: body fat > 20% (male) or > 28% (female), AND strength training ≥ 2×/week
- Otherwise: note explains recomp is slow and maintenance is the practical target

### 4.5 Macros

Computed for the user's selected goal scenario.

| Macro | Formula |
|-------|---------|
| Protein | Active users (training ≥ 2×/week): 1.8–2.2 g/kg; others: 1.2–1.6 g/kg |
| Fat | 25–35% of midpoint calories |
| Carbs | Remaining calories ÷ 4 (after protein and fat accounted for) |

All expressed as ranges in g/day.

### 4.6 Safety flags (strings shown in UI)

Generated for any of:
- User is a minor → "Calorie restriction is not recommended for users under 18. Please consult a qualified professional."
- User is pregnant/breastfeeding → "Standard calorie targets are not appropriate during pregnancy or breastfeeding. Please consult a healthcare professional."
- User has eating disorder history → "These tools are not suitable as a primary guide when there is a history of disordered eating. Please work with a qualified professional."
- User has metabolic condition → "A medical condition or medication may significantly affect your metabolism. These estimates may be less accurate — please consult your doctor."
- Loss scenario breaches minimum floor → "The calculated deficit would bring intake below recommended minimums. The target has been adjusted upward. Consider a smaller deficit or consult a professional."
- RED-S risk → "Your combination of training load, goal, and estimated intake raises a risk of energy deficiency. Consider eating at maintenance or consulting a sports dietitian."

---

## 5. Results Dashboard — `CalorieResultsPage.vue`

Single scrollable page, authenticated, guarded. "Recalculate" button at top calls `calorieStore.reset()` and navigates to `/tools/calorie-calculator`.

### Cards (top to bottom)

**Profile card**
Age, sex, height, weight, occupation, primary goal. Inline chip for goal.

**Metabolic card**
- BMR: single number (e.g. "1,820 kcal")
- TDEE: range (e.g. "2,340 – 2,740 kcal/day")
- Source label: "Theoretical estimate" or "Adjusted using your calorie history"
- 2–3 sentence plain-language explanation of TDEE and why it's a range

**Recommendations table** — `ScenarioTable.vue`
Four rows. Selected goal row highlighted with primary color.

| Goal | Daily calories | Weekly change | vs. TDEE |
|------|---------------|---------------|----------|
| Weight loss | 1,900–2,100 kcal | −0.3 to −0.5 kg | −400–500 kcal |
| Maintenance | 2,290–2,390 kcal | ±0.1 kg | — |
| Muscle gain | 2,470–2,570 kcal | +0.1 to +0.2 kg | +150–250 kcal |
| Recomposition | 2,290–2,390 kcal | ~0 kg | — |

**Calorie range chart** — `CalorieRangeChart.vue`
Horizontal bar chart (Chart.js). Each bar spans the kcal range for a scenario. A vertical dashed line marks the TDEE midpoint. Color-coded by scenario; selected goal bar is fully opaque, others are muted.

**Macros card** — `MacrosCard.vue`
Protein / fat / carbs ranges in g/day, shown as three horizontally stacked bars with proportions. Short note if protein priority applies.

**Safety flags card** — `SafetyFlagsCard.vue`
Amber/warning tone. Rendered only when `safetyFlags.length > 0`. Each flag as a separate item. "These are estimates, not medical advice."

**Methodology footer**
Which BMR equation was used and why (Mifflin-St Jeor or Katch-McArdle). Whether history calibration was applied. Disclaimer that all values are estimates.

---

## 6. Constraints & Decisions

- **No AI calls** — all explanations are static strings baked into the calculation engine and result components
- **No persistence** — session only; `calorieStore.reset()` on "Recalculate"
- **No backend changes** — entirely frontend
- **Lucide icons only** — `Calculator` for the hub card
- **Chart.js via vue-chartjs** — already installed; no new dependencies
- **Unit tests** — `calorieCalc.ts` must have tests covering: BMR (male/female, with/without body fat), TDEE layers, all four scenarios, safety flag triggers, macro ranges
- **All recommendations expressed as ranges** — never a single value
- **Safety flags inform but never block** — results always shown
