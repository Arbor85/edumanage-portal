// ─── Types ───────────────────────────────────────────────────────────────────

export type Sex = 'male' | 'female'
export type OccupationLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'highly_active'
  | 'very_highly_active'
export type DailySteps =
  | 'below_3k'
  | '3k_5k'
  | '5k_8k'
  | '8k_12k'
  | 'above_12k'
  | 'unknown'
export type ActivityType =
  | 'running'
  | 'strength'
  | 'cycling'
  | 'swimming'
  | 'walking'
  | 'team_sports'
  | 'other'
export type Intensity = 'low' | 'moderate' | 'high'
export type WeightTrend = 'stable' | 'increasing' | 'decreasing'
export type PrimaryGoal = 'loss' | 'maintenance' | 'gain' | 'recomp'

export interface TrainingActivity {
  id: string
  type: ActivityType
  sessionsPerWeek: number
  avgDurationMin: number
  intensity: Intensity
  weeklyVolumeKm?: number
}

export interface WizardAnswers {
  profile: {
    age: number
    sex: Sex
    heightCm: number
    weightKg: number
    waistCm?: number
    bodyFatPct?: number
    bodyFatMethod?: string
  }
  activity: { occupationLevel: OccupationLevel; dailySteps: DailySteps }
  training: { activities: TrainingActivity[]; volumeVariesSignificantly: boolean }
  history: {
    weightTrend: WeightTrend
    recentWeightChangeKg?: number
    tracksCalories: boolean
    avgDailyKcal?: number
    trackingDurationWeeks?: number
    weighFrequency?: 'daily' | 'few_per_week' | 'weekly' | 'rarely'
    consistentConditions?: boolean
  }
  health: {
    isMinor: boolean
    isPregnantOrBreastfeeding: boolean
    hasEatingDisorder: boolean
    hasMetabolicCondition: boolean
    unexplainedWeightChanges: boolean
  }
  goal: { primary: PrimaryGoal; desiredRateKgPerWeek?: number }
}

export interface CalorieRange {
  low: number
  high: number
}

export interface Scenario {
  kcalRange: CalorieRange
  weeklyWeightChangeRange: CalorieRange
  deficitOrSurplusRange: CalorieRange
  notes: string[]
}

export interface CalorieResults {
  bmr: number
  tdeeRange: CalorieRange
  tdeeSource: 'theoretical' | 'history-calibrated'
  scenarios: { loss: Scenario; maintenance: Scenario; gain: Scenario; recomp: Scenario }
  macros: {
    proteinGRange: CalorieRange
    fatGRange: CalorieRange
    carbGRange: CalorieRange
  }
  safetyFlags: string[]
  completed: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NEAT_MULTIPLIERS: Record<OccupationLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  highly_active: 1.725,
  very_highly_active: 1.9,
}

const STEPS_ADJUSTMENTS: Record<DailySteps, number> = {
  below_3k: -0.075,
  '3k_5k': -0.05,
  '5k_8k': 0,
  '8k_12k': 0.05,
  above_12k: 0.1,
  unknown: 0,
}

const MET_VALUES: Record<ActivityType, Record<Intensity, number>> = {
  running: { low: 7, moderate: 9, high: 12 },
  strength: { low: 3.5, moderate: 5, high: 6 },
  cycling: { low: 6, moderate: 8, high: 11 },
  swimming: { low: 5, moderate: 7, high: 9 },
  walking: { low: 3, moderate: 4, high: 4.5 },
  team_sports: { low: 5, moderate: 7, high: 9 },
  other: { low: 4, moderate: 6, high: 8 },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roundTo10(n: number): number {
  return Math.round(n / 10) * 10
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function getTrainingLoadScore(totalWeeklyHours: number): 'low' | 'moderate' | 'high' | 'very_high' {
  if (totalWeeklyHours < 3) return 'low'
  if (totalWeeklyHours < 6) return 'moderate'
  if (totalWeeklyHours <= 10) return 'high'
  return 'very_high'
}

function emptyScenario(): Scenario {
  return {
    kcalRange: { low: 0, high: 0 },
    weeklyWeightChangeRange: { low: 0, high: 0 },
    deficitOrSurplusRange: { low: 0, high: 0 },
    notes: [],
  }
}

// ─── Main computation ─────────────────────────────────────────────────────────

export function computeCalories(answers: WizardAnswers): CalorieResults {
  const { profile, activity, training, history, health, goal } = answers
  const safetyFlags: string[] = []

  // ── BMR ──────────────────────────────────────────────────────────────────
  let bmr: number
  const bodyFat = profile.bodyFatPct
  if (bodyFat !== undefined && bodyFat > 5 && bodyFat < 50) {
    // Katch-McArdle
    const lbm = profile.weightKg * (1 - bodyFat / 100)
    bmr = 370 + 21.6 * lbm
  } else {
    // Mifflin-St Jeor
    const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age
    bmr = profile.sex === 'male' ? base + 5 : base - 161
  }
  bmr = Math.round(bmr)

  // ── NEAT multiplier ───────────────────────────────────────────────────────
  const baseMultiplier = NEAT_MULTIPLIERS[activity.occupationLevel]
  const stepsAdjustment = STEPS_ADJUSTMENTS[activity.dailySteps]
  const neatMultiplier = clamp(baseMultiplier + stepsAdjustment, 1.15, 1.95)
  const neatTdee = bmr * neatMultiplier

  // ── EAT (Exercise Activity Thermogenesis) ─────────────────────────────────
  let totalWeeklyHours = 0
  let eatWeeklyTotal = 0
  for (const act of training.activities) {
    const durationHours = act.avgDurationMin / 60
    const met = MET_VALUES[act.type][act.intensity]
    const weeklyKcal = met * profile.weightKg * durationHours * act.sessionsPerWeek
    eatWeeklyTotal += weeklyKcal
    totalWeeklyHours += durationHours * act.sessionsPerWeek
  }
  const eatDaily = eatWeeklyTotal / 7

  // ── Total TDEE (includes TEF × 1.10) ─────────────────────────────────────
  let theoreticalTdee = (neatTdee + eatDaily) * 1.1

  // ── History calibration ───────────────────────────────────────────────────
  let tdeeSource: 'theoretical' | 'history-calibrated' = 'theoretical'
  const canCalibrate =
    history.tracksCalories &&
    history.avgDailyKcal !== undefined &&
    (history.trackingDurationWeeks ?? 0) >= 2 &&
    history.consistentConditions === true &&
    history.weightTrend === 'stable'

  let finalTdee = theoreticalTdee
  if (canCalibrate && history.avgDailyKcal !== undefined) {
    finalTdee = theoreticalTdee * 0.6 + history.avgDailyKcal * 0.4
    tdeeSource = 'history-calibrated'
  }

  const tdeeRange: CalorieRange = {
    low: roundTo10(finalTdee * 0.92),
    high: roundTo10(finalTdee * 1.08),
  }
  const tdeeMid = (tdeeRange.low + tdeeRange.high) / 2

  // ── Training load ─────────────────────────────────────────────────────────
  const trainingLoad = getTrainingLoadScore(totalWeeklyHours)
  const isHighLoad = trainingLoad === 'high' || trainingLoad === 'very_high'

  // ── Scenarios ─────────────────────────────────────────────────────────────
  const minFloor = profile.sex === 'male' ? 1600 : 1400

  // Loss
  let lossLow: number
  let lossHigh: number
  if (isHighLoad) {
    lossLow = roundTo10(tdeeMid * 0.9)
    lossHigh = roundTo10(tdeeMid * 0.95)
  } else {
    lossLow = roundTo10(tdeeMid * 0.8)
    lossHigh = roundTo10(tdeeMid * 0.9)
  }

  const lossNotes: string[] = [
    'A moderate deficit prioritises muscle retention and long-term adherence.',
  ]
  if (isHighLoad) {
    lossNotes.push('Given your training volume, a smaller deficit protects recovery and performance.')
  }

  if (lossLow < minFloor) {
    lossLow = minFloor
    lossHigh = minFloor + 100
    safetyFlags.push(
      'The calculated deficit would bring intake below recommended minimums. The target has been adjusted upward.',
    )
  }

  const lossDeficitLow = roundTo10(tdeeMid - lossHigh)
  const lossDeficitHigh = roundTo10(tdeeMid - lossLow)
  const lossWeeklyChangeLow = -(lossDeficitHigh / 7700)
  const lossWeeklyChangeHigh = -(lossDeficitLow / 7700)

  const lossScenario: Scenario = {
    kcalRange: { low: lossLow, high: lossHigh },
    weeklyWeightChangeRange: {
      low: Math.round(lossWeeklyChangeLow * 100) / 100,
      high: Math.round(lossWeeklyChangeHigh * 100) / 100,
    },
    deficitOrSurplusRange: { low: -lossDeficitHigh, high: -lossDeficitLow },
    notes: lossNotes,
  }

  // Maintenance
  const maintenanceScenario: Scenario = {
    kcalRange: { low: roundTo10(tdeeMid - 50), high: roundTo10(tdeeMid + 50) },
    weeklyWeightChangeRange: { low: -0.1, high: 0.1 },
    deficitOrSurplusRange: { low: -50, high: 50 },
    notes: [
      'Eating near your TDEE keeps weight stable. Day-to-day fluctuations of 0.5–2 kg from water, sodium, and digestion are completely normal.',
    ],
  }

  // Gain
  const gainLow = roundTo10(tdeeMid * 1.05)
  const gainHigh = roundTo10(tdeeMid * 1.1)
  const gainSurplusLow = gainLow - roundTo10(tdeeMid)
  const gainSurplusHigh = gainHigh - roundTo10(tdeeMid)
  const gainWeeklyChangeLow = gainSurplusLow / 7700
  const gainWeeklyChangeHigh = gainSurplusHigh / 7700

  const gainScenario: Scenario = {
    kcalRange: { low: gainLow, high: gainHigh },
    weeklyWeightChangeRange: {
      low: Math.round(gainWeeklyChangeLow * 100) / 100,
      high: Math.round(gainWeeklyChangeHigh * 100) / 100,
    },
    deficitOrSurplusRange: { low: gainSurplusLow, high: gainSurplusHigh },
    notes: [
      'A modest surplus minimises fat gain while supporting muscle growth.',
      'Progressive strength training is essential for directing surplus calories toward muscle.',
    ],
  }

  // Recomp
  const hasStrengthTraining =
    training.activities.filter((a) => a.type === 'strength').reduce((sum, a) => sum + a.sessionsPerWeek, 0) >= 2
  const bodyFatViable =
    bodyFat !== undefined &&
    ((profile.sex === 'male' && bodyFat > 18) || (profile.sex === 'female' && bodyFat > 26))

  let recompScenario: Scenario
  if (bodyFatViable && hasStrengthTraining) {
    const recompLow = roundTo10(tdeeMid * 0.95)
    const recompHigh = roundTo10(tdeeMid)
    recompScenario = {
      kcalRange: { low: recompLow, high: recompHigh },
      weeklyWeightChangeRange: { low: -0.05, high: 0.05 },
      deficitOrSurplusRange: { low: -roundTo10(tdeeMid * 0.05), high: 0 },
      notes: [
        'Body recomposition — losing fat while gaining muscle — is possible but slow.',
        'The scale may not change much; track body composition and strength instead.',
      ],
    }
  } else {
    recompScenario = {
      ...maintenanceScenario,
      weeklyWeightChangeRange: { low: -0.05, high: 0.05 },
      deficitOrSurplusRange: { low: -roundTo10(tdeeMid * 0.05), high: 0 },
      notes: [
        'Body recomposition — losing fat while gaining muscle — is possible but slow.',
        'The scale may not change much; track body composition and strength instead.',
      ],
    }
  }

  // ── Macros ────────────────────────────────────────────────────────────────
  const goalScenarioMap = {
    loss: lossScenario,
    maintenance: maintenanceScenario,
    gain: gainScenario,
    recomp: recompScenario,
  }
  const selectedScenario = goalScenarioMap[goal.primary]
  const kcalMid = (selectedScenario.kcalRange.low + selectedScenario.kcalRange.high) / 2

  const isActive = totalWeeklyHours >= 2
  const proteinLow = Math.round(profile.weightKg * (isActive ? 1.8 : 1.2))
  const proteinHigh = Math.round(profile.weightKg * (isActive ? 2.2 : 1.6))
  const fatLow = Math.round((kcalMid * 0.25) / 9)
  const fatHigh = Math.round((kcalMid * 0.35) / 9)

  const proteinMidKcal = ((proteinLow + proteinHigh) / 2) * 4
  const fatMidKcal = ((fatLow + fatHigh) / 2) * 9
  const carbMidG = (kcalMid - proteinMidKcal - fatMidKcal) / 4
  const carbLow = Math.round(carbMidG * 0.9)
  const carbHigh = Math.round(carbMidG * 1.1)

  // ── Safety flags ──────────────────────────────────────────────────────────
  if (health.isMinor) {
    safetyFlags.push(
      'Calorie restriction is not recommended for users under 18. Please consult a qualified professional.',
    )
  }
  if (health.isPregnantOrBreastfeeding) {
    safetyFlags.push(
      'Standard calorie targets are not appropriate during pregnancy or breastfeeding. Please consult a healthcare professional.',
    )
  }
  if (health.hasEatingDisorder) {
    safetyFlags.push(
      'These tools are not suitable as a primary guide when there is a history of disordered eating. Please work with a qualified professional.',
    )
  }
  if (health.hasMetabolicCondition) {
    safetyFlags.push(
      'A medical condition or medication may significantly affect your metabolism. These estimates may be less accurate — please consult your doctor.',
    )
  }

  // RED-S flag
  if (
    profile.sex === 'female' &&
    isHighLoad &&
    goal.primary === 'loss' &&
    lossScenario.kcalRange.low < 1800
  ) {
    safetyFlags.push(
      'Your combination of training load, goal, and estimated intake raises a risk of energy deficiency. Consider eating at maintenance or consulting a sports dietitian.',
    )
  }

  return {
    bmr,
    tdeeRange,
    tdeeSource,
    scenarios: {
      loss: lossScenario,
      maintenance: maintenanceScenario,
      gain: gainScenario,
      recomp: recompScenario,
    },
    macros: {
      proteinGRange: { low: proteinLow, high: proteinHigh },
      fatGRange: { low: fatLow, high: fatHigh },
      carbGRange: { low: carbLow, high: carbHigh },
    },
    safetyFlags,
    completed: true,
  }
}

export { emptyScenario }
