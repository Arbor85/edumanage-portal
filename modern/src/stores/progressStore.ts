import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useWorkoutStore } from './workoutStore'

export interface WeekData {
  weekStart: string   // ISO date of Monday
  label: string       // "Jul 27"
  sets: number
  durationMinutes: number
}

export interface HeatmapDay {
  date: string        // ISO date YYYY-MM-DD
  intensity: 0 | 1 | 2 | 3
}

export interface PR {
  exerciseName: string
  activityTrackType: string
  bestWeight: number | null
  bestReps: number | null
  bestDuration: number | null
  bestDistance: number | null
  achievedAt: string
}

export interface MuscleFrequency {
  muscle: string
  count: number
}

function mondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() === 0 ? 7 : d.getDay()
  d.setDate(d.getDate() - day + 1)
  d.setHours(0, 0, 0, 0)
  return d
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

const MUSCLE_KEYWORDS: Record<string, string[]> = {
  chest: ['bench', 'push-up', 'pushup', 'fly', 'flye', 'chest', 'pec', 'dip'],
  shoulders: ['press', 'lateral raise', 'front raise', 'shoulder', 'overhead', 'military', 'delt', 'raise'],
  triceps: ['tricep', 'pushdown', 'skull', 'extension', 'dip'],
  biceps: ['curl', 'bicep', 'hammer', 'chin-up', 'chinup'],
  back: ['row', 'pull', 'lat', 'pulldown', 'back', 'deadlift', 'shrug', 'rdl', 'nordic'],
  core: ['plank', 'crunch', 'sit-up', 'situp', 'ab ', 'core', 'twist', 'russian', 'leg raise'],
  glutes: ['hip thrust', 'glute', 'bridge', 'kickback', 'clamshell'],
  quads: ['squat', 'leg press', 'lunge', 'step', 'quad', 'leg extension', 'split squat'],
  hamstrings: ['deadlift', 'hamstring', 'leg curl', 'rdl', 'nordic', 'stiff leg'],
  calves: ['calf', 'standing raise', 'seated raise', 'jump rope'],
}

function detectMuscles(name: string): string[] {
  const lower = name.toLowerCase()
  return Object.entries(MUSCLE_KEYWORDS)
    .filter(([, kws]) => kws.some((kw) => lower.includes(kw)))
    .map(([m]) => m)
}

export const useProgressStore = defineStore('progress', () => {
  const workoutStore = useWorkoutStore()

  // ── Weekly data (last 8 weeks) ─────────────────────────────────
  const weeklyData = computed<WeekData[]>(() => {
    const weeks: WeekData[] = []
    const now = new Date()

    for (let i = 7; i >= 0; i--) {
      const monday = mondayOf(new Date(now.getTime() - i * 7 * 86_400_000))
      const sunday = new Date(monday.getTime() + 7 * 86_400_000)

      const weekWorkouts = workoutStore.history.filter((h) => {
        if (!h.completedAt) return false
        const d = new Date(h.completedAt)
        return d >= monday && d < sunday
      })

      weeks.push({
        weekStart: isoDate(monday),
        label: monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sets: weekWorkouts.reduce((a, w) => a + (w.completedSets ?? 0), 0),
        durationMinutes: Math.round(
          weekWorkouts.reduce((a, w) => a + (w.durationSeconds ?? 0), 0) / 60
        ),
      })
    }

    return weeks
  })

  // ── Heatmap (last 84 days) ─────────────────────────────────────
  const heatmapData = computed<HeatmapDay[]>(() => {
    const result: HeatmapDay[] = []
    const now = new Date()

    for (let i = 83; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86_400_000)
      const dateStr = isoDate(d)

      const workout = workoutStore.history.find(
        (h) => h.completedAt?.split('T')[0] === dateStr
      )

      let intensity: 0 | 1 | 2 | 3 = 0
      if (workout) {
        const sets = workout.completedSets ?? 0
        if (sets >= 9) intensity = 3
        else if (sets >= 4) intensity = 2
        else intensity = 1
      }

      result.push({ date: dateStr, intensity })
    }

    return result
  })

  // ── Muscle frequency (last 30 days) ───────────────────────────
  const muscleFrequency = computed<Record<string, number>>(() => {
    const thirtyDaysAgo = Date.now() - 30 * 86_400_000
    const freq: Record<string, number> = {}

    workoutStore.history
      .filter((h) => h.completedAt && new Date(h.completedAt).getTime() > thirtyDaysAgo)
      .forEach((workout) => {
        ;(workout.excercises ?? []).forEach((ex) => {
          if (!ex.name) return
          detectMuscles(ex.name).forEach((m) => {
            freq[m] = (freq[m] ?? 0) + 1
          })
        })
      })

    return freq
  })

  // ── Personal Records ───────────────────────────────────────────
  const personalRecords = computed<PR[]>(() => {
    const prMap = new Map<string, PR>()

    workoutStore.history.forEach((workout) => {
      if (!workout.completedAt) return
      ;(workout.excercises ?? []).forEach((ex) => {
        if (!ex.name) return
        const key = ex.name.toLowerCase()
        const existing = prMap.get(key)

        ;(ex.sets ?? []).forEach((set) => {
          if (!set.completed) return

          const candidate: PR = {
            exerciseName: ex.name!,
            activityTrackType: ex.activityTrackType,
            bestWeight: set.weight,
            bestReps: set.reps,
            bestDuration: set.duration,
            bestDistance: set.distance,
            achievedAt: workout.completedAt!,
          }

          if (!existing) {
            prMap.set(key, candidate)
            return
          }

          // Update if this set is better
          if (ex.activityTrackType === 'repetitions') {
            const curScore = (existing.bestWeight ?? 0) * (existing.bestReps ?? 1)
            const newScore = (set.weight ?? 0) * (set.reps ?? 1)
            if (newScore > curScore) prMap.set(key, { ...candidate })
          } else if (ex.activityTrackType === 'time') {
            if ((set.duration ?? 0) > (existing.bestDuration ?? 0))
              prMap.set(key, { ...candidate })
          } else if (ex.activityTrackType === 'distance') {
            if ((set.distance ?? 0) > (existing.bestDistance ?? 0))
              prMap.set(key, { ...candidate })
          }
        })
      })
    })

    return [...prMap.values()].sort(
      (a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
    )
  })

  // ── Totals ────────────────────────────────────────────────────
  const totalWorkouts = computed(() => workoutStore.history.length)
  const totalSets = computed(() =>
    workoutStore.history.reduce((a, w) => a + (w.completedSets ?? 0), 0)
  )
  const totalHours = computed(() =>
    Math.round(
      workoutStore.history.reduce((a, w) => a + (w.durationSeconds ?? 0), 0) / 3600
    )
  )

  return {
    weeklyData,
    heatmapData,
    muscleFrequency,
    personalRecords,
    totalWorkouts,
    totalSets,
    totalHours,
  }
})
