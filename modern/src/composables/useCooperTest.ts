export type Sex = 'male' | 'female'
export type Category = 'very_poor' | 'poor' | 'average' | 'good' | 'very_good'

export interface AgeGroup {
  label: string
  minAge: number
  maxAge: number
  poor: number      // >= poor → Poor  (< poor → Very Poor)
  average: number   // >= average → Average
  good: number      // >= good → Good
  veryGood: number  // >= veryGood → Very Good
}

export interface CooperMetrics {
  distance: number
  speed: number
  pace: string
  vo2max: number
  category: Category
  ageGroup: AgeGroup
  metersToNext: number | null
  nextCategory: Category | null
  barPosition: number  // 0–1 position along the progress bar
}

export interface Interpretation {
  categoryComment: string
  vo2maxComment: string
  nextStepComment: string
  recommendation: string
}

export interface HistoryEntry {
  id: string
  date: string
  age: number
  sex: Sex
  distance: number
  category: Category
  vo2max: number
  pace: string
  speed: number
}

// ── Reference norms ───────────────────────────────────────────
export const MALE_NORMS: AgeGroup[] = [
  { label: '13–14', minAge: 13, maxAge: 14, poor: 2100, average: 2200, good: 2400, veryGood: 2700 },
  { label: '15–16', minAge: 15, maxAge: 16, poor: 2200, average: 2300, good: 2500, veryGood: 2800 },
  { label: '17–19', minAge: 17, maxAge: 19, poor: 2300, average: 2400, good: 2700, veryGood: 3000 },
  { label: '20–29', minAge: 20, maxAge: 29, poor: 1600, average: 2200, good: 2400, veryGood: 2801 },
  { label: '30–39', minAge: 30, maxAge: 39, poor: 1500, average: 1900, good: 2300, veryGood: 2701 },
  { label: '40–49', minAge: 40, maxAge: 49, poor: 1400, average: 1700, good: 2100, veryGood: 2501 },
  { label: '50+',   minAge: 50, maxAge: Infinity, poor: 1300, average: 1600, good: 2000, veryGood: 2401 },
]

export const FEMALE_NORMS: AgeGroup[] = [
  { label: '13–14', minAge: 13, maxAge: 14, poor: 1500, average: 1600, good: 1900, veryGood: 2001 },
  { label: '15–16', minAge: 15, maxAge: 16, poor: 1600, average: 1700, good: 2000, veryGood: 2101 },
  { label: '17–19', minAge: 17, maxAge: 19, poor: 1700, average: 1800, good: 2100, veryGood: 2301 },
  { label: '20–29', minAge: 20, maxAge: 29, poor: 1500, average: 1800, good: 2200, veryGood: 2701 },
  { label: '30–39', minAge: 30, maxAge: 39, poor: 1400, average: 1700, good: 2000, veryGood: 2501 },
  { label: '40–49', minAge: 40, maxAge: 49, poor: 1200, average: 1500, good: 1900, veryGood: 2301 },
  { label: '50+',   minAge: 50, maxAge: Infinity, poor: 1100, average: 1400, good: 1700, veryGood: 2201 },
]

export const CATEGORY_ORDER: Category[] = ['very_poor', 'poor', 'average', 'good', 'very_good']

export const CATEGORY_LABELS: Record<Category, string> = {
  very_poor: 'Very Poor',
  poor: 'Poor',
  average: 'Average',
  good: 'Good',
  very_good: 'Very Good',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  very_poor: '#ef4444',
  poor:      '#f97316',
  average:   '#eab308',
  good:      '#84cc16',
  very_good: '#22c55e',
}

// ── Core calculations ─────────────────────────────────────────
export function getAgeGroup(age: number, sex: Sex): AgeGroup | null {
  const norms = sex === 'male' ? MALE_NORMS : FEMALE_NORMS
  return norms.find(g => age >= g.minAge && age <= g.maxAge) ?? null
}

export function classify(distance: number, ag: AgeGroup): Category {
  if (distance >= ag.veryGood) return 'very_good'
  if (distance >= ag.good)     return 'good'
  if (distance >= ag.average)  return 'average'
  if (distance >= ag.poor)     return 'poor'
  return 'very_poor'
}

function formatPace(distance: number): string {
  const totalSecs = Math.round((12_000 / distance) * 60)
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function barPosition(distance: number, ag: AgeGroup): number {
  const catIdx = CATEGORY_ORDER.indexOf(classify(distance, ag))
  const lowers = [0, ag.poor, ag.average, ag.good, ag.veryGood]
  const uppers = [ag.poor, ag.average, ag.good, ag.veryGood, ag.veryGood + 500]
  const low  = lowers[catIdx]
  const high = uppers[catIdx]
  const within = high === low ? 0.5 : Math.min(Math.max((distance - low) / (high - low), 0), 1)
  return (catIdx + within) / 5
}

export function calculateMetrics(distance: number, age: number, sex: Sex): CooperMetrics | null {
  const ageGroup = getAgeGroup(age, sex)
  if (!ageGroup) return null

  const category = classify(distance, ageGroup)
  const catIdx   = CATEGORY_ORDER.indexOf(category)

  let metersToNext: number | null = null
  let nextCategory: Category | null = null
  if (category !== 'very_good') {
    nextCategory = CATEGORY_ORDER[catIdx + 1]
    const thresholdMap: Record<Category, number> = {
      very_poor: ageGroup.poor,
      poor:      ageGroup.average,
      average:   ageGroup.good,
      good:      ageGroup.veryGood,
      very_good: ageGroup.veryGood,
    }
    metersToNext = thresholdMap[category] - distance
  }

  return {
    distance,
    speed:    Math.round((distance / 200) * 10) / 10,
    pace:     formatPace(distance),
    vo2max:   Math.round(((distance - 504.9) / 44.73) * 10) / 10,
    category,
    ageGroup,
    metersToNext,
    nextCategory,
    barPosition: barPosition(distance, ageGroup),
  }
}

// ── Interpretation ────────────────────────────────────────────
export function generateInterpretation(m: CooperMetrics, sex: Sex): Interpretation {
  const { category, vo2max, ageGroup, metersToNext, nextCategory } = m
  const sexLabel = sex === 'male' ? 'men' : 'women'

  const categoryComment: Record<Category, string> = {
    very_poor: `Your result falls in the Very Poor range for ${sexLabel} in the ${ageGroup.label} age group. While this is the starting point, it also means you have the most potential for rapid improvement. Early-stage aerobic training typically produces the fastest relative gains.`,
    poor:      `Your result places you in the Poor category for ${sexLabel} aged ${ageGroup.label}. You have a base to work from. With consistent aerobic training over 6–8 weeks, moving into the Average range is a realistic target.`,
    average:   `You've scored in the Average range for ${sexLabel} aged ${ageGroup.label} — right in the middle of the reference population. This is a solid platform. Targeted training can move you into Good within one training cycle.`,
    good:      `A Good result — you're outperforming the majority of ${sexLabel} in the ${ageGroup.label} group. Your aerobic fitness is at a level associated with meaningful health and performance benefits.`,
    very_good: `Excellent — Very Good for ${sexLabel} aged ${ageGroup.label}. This reflects a well-developed aerobic base. Maintaining this level requires consistent training; further gains will come more gradually at this stage.`,
  }

  const vo2maxComment =
    vo2max < 35 ? `Your estimated VO2max of ${vo2max} ml/kg/min suggests a low aerobic capacity, typical of a sedentary lifestyle. This is the value most responsive to training.`
    : vo2max < 42 ? `Your estimated VO2max of ${vo2max} ml/kg/min reflects a moderate aerobic capacity — a good base to develop further.`
    : vo2max < 50 ? `Your estimated VO2max of ${vo2max} ml/kg/min is solid, in the range of regularly active individuals.`
    : `Your estimated VO2max of ${vo2max} ml/kg/min is high, characteristic of well-trained endurance athletes.`

  const nextStepComment =
    metersToNext && nextCategory
      ? `To reach the next category (${CATEGORY_LABELS[nextCategory]}), you need ${metersToNext} more metres — roughly ${((metersToNext / m.distance) * 12).toFixed(1)} extra minutes at your current pace. A focused 6–8 week training block is a realistic timeframe for most people.`
      : `You are in the highest classification bracket. The focus now is consistency and injury prevention rather than chasing further distance.`

  const recommendation: Record<Category, string> = {
    very_poor: 'Start with 3 sessions per week of easy continuous running or brisk walking, 20–30 minutes each. Build duration before intensity.',
    poor:      'Add one interval session per week — 2-minute faster efforts alternating with 2-minute easy jogs for 20 minutes. Supplement with two easy aerobic runs.',
    average:   'Introduce a weekly tempo run (sustained comfortably-hard effort for 20–25 minutes) on top of your aerobic base work.',
    good:      'Add structured interval training (e.g. 4 × 1 km at a hard effort with 90-second recoveries) once a week to push towards Very Good.',
    very_good: 'Prioritise recovery and variety. Cross-training, strength work, and periodised blocks will sustain this level long-term.',
  }

  return {
    categoryComment: categoryComment[category],
    vo2maxComment: vo2maxComment + ' Note: this is a field estimate using the Cooper formula, not equivalent to a laboratory measurement.',
    nextStepComment,
    recommendation: recommendation[category],
  }
}

// ── History ───────────────────────────────────────────────────
const LS_KEY = 'arbor_cooper_history'

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveToHistory(entry: Omit<HistoryEntry, 'id'>): void {
  const history = loadHistory()
  history.unshift({ ...entry, id: Date.now().toString() })
  localStorage.setItem(LS_KEY, JSON.stringify(history.slice(0, 50)))
}

export function deleteFromHistory(id: string): void {
  const history = loadHistory().filter(e => e.id !== id)
  localStorage.setItem(LS_KEY, JSON.stringify(history))
}
