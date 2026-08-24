const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY as string | undefined
const BASE_URL = 'https://muscle-visualizer-api.p.rapidapi.com/v1/visualize/workout'

// Maps dataset muscle names (lowercase) → API-accepted names
const MUSCLE_TO_API: Record<string, string> = {
  // chest
  'pectoralis major': 'chest', chest: 'chest',
  // shoulders
  delts: 'shoulders', deltoids: 'shoulders', shoulders: 'shoulders',
  'rear deltoids': 'shoulders', 'front deltoids': 'shoulders',
  // arms
  biceps: 'biceps', 'upper arms': 'biceps',
  triceps: 'triceps',
  forearms: 'forearms', 'lower arms': 'forearms',
  // back
  lats: 'lats', 'latissimus dorsi': 'lats', back: 'lats', 'upper back': 'lats',
  traps: 'traps', trapezius: 'traps',
  'lower back': 'lower back', spine: 'lower back', 'erector spinae': 'lower back',
  // core
  abs: 'abs', abdominals: 'abs', waist: 'abs', core: 'abs',
  'hip flexors': 'abs', obliques: 'abs',
  // lower body
  glutes: 'glutes', glute: 'glutes',
  quadriceps: 'quads', quads: 'quads', 'upper legs': 'quads',
  hamstrings: 'hamstrings',
  calves: 'calves', calf: 'calves', 'lower legs': 'calves',
  // misc
  neck: 'neck', 'levator scapulae': 'neck',
}

function toApiName(muscle: string): string | null {
  return MUSCLE_TO_API[muscle.toLowerCase()] ?? null
}

const cache = new Map<string, string>()

export function isApiConfigured(): boolean {
  return !!API_KEY
}

export async function fetchMuscleVisualization(
  primaryMuscle: string,
  secondaryMuscles: string[] = [],
): Promise<string | null> {
  if (!API_KEY) return null

  const primary = toApiName(primaryMuscle)
  if (!primary) return null

  const secondaries = secondaryMuscles.map(toApiName).filter(Boolean) as string[]

  const cacheKey = `${primary}|${secondaries.join(',')}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  const url = new URL(BASE_URL)
  url.searchParams.set('primary_muscles', primary)
  if (secondaries.length) url.searchParams.set('secondary_muscles', secondaries.join(','))

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'muscle-visualizer-api.p.rapidapi.com',
      },
    })
    if (!res.ok) return null
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    cache.set(cacheKey, objectUrl)
    return objectUrl
  } catch {
    return null
  }
}
