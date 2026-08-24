const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY as string | undefined
const BASE_URL = 'https://muscle-visualizer-api.p.rapidapi.com/api/v1/visualize/heatmap'
const COLORS = '#E74C3C,#F39C12,#3498DB,#2ECC71,#9B59B6,#1ABC9C,#F1C40F,#E67E22,#34495E,#7F8C8D,#BDC3C7,#95A5A6,#D35400,#C0392B,#8E44AD,#2980B9,#27AE60,#16A085,#F39C12,#D35400,#7F8C8D,#BDC3C7,#95A5A6,#34495E,#2C3E50,#1ABC9C,#27AE60,#16A085,#F1C40F,#F39C12,#E67E22,#D35400,#C0392B,#8E44AD,#2980B9,#3498DB,#2ECC71,#9B59B6';

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
  muscles: string[] = [],
): Promise<string | null> {
  if (!API_KEY) {
    return null;
  }

  const mappedMuscles = muscles.map(toApiName).filter((m): m is string => m !== null);

  const cacheKey = `$muscles_${mappedMuscles.join(',')}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }


  const url = new URL(BASE_URL)
  url.searchParams.set('muscles', mappedMuscles.join(',').toUpperCase());
  url.searchParams.set('colors', COLORS.split(',').filter((_, index) => index < mappedMuscles.length).join(','));
  url.searchParams.set('gender', 'male');
  url.searchParams.set('background', 'transparent');
  url.searchParams.set('size', 'small');
  url.searchParams.set('format', 'jpeg');

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'x-rapidapi-host': 'muscle-visualizer-api.p.rapidapi.com',
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
