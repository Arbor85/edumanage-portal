// Normalizes dataset muscle names into the muscle group keys used by the SVG body maps.
export const MUSCLE_MAP: Record<string, string> = {
  'pectoralis major': 'chest',
  'pectorals': 'chest',
  'chest': 'chest',
  'delts': 'shoulders',
  'deltoids': 'shoulders',
  'shoulders': 'shoulders',
  'rear deltoids': 'shoulders',
  'front deltoids': 'shoulders',
  'biceps': 'biceps',
  'upper arms': 'biceps',
  'triceps': 'triceps',
  'lats': 'lats',
  'latissimus dorsi': 'lats',
  'back': 'lats',
  'upper back': 'lats',
  'traps': 'traps',
  'trapezius': 'traps',
  'lower back': 'lower_back',
  'spine': 'lower_back',
  'erector spinae': 'lower_back',
  'abs': 'core',
  'abdominals': 'core',
  'waist': 'core',
  'core': 'core',
  'hip flexors': 'core',
  'obliques': 'core',
  'serratus anterior': 'core',
  'glutes': 'glutes',
  'glute': 'glutes',
  'abductors': 'glutes',
  'quadriceps': 'quads',
  'quads': 'quads',
  'upper legs': 'quads',
  'adductors': 'quads',
  'hamstrings': 'hamstrings',
  'calves': 'calves',
  'calf': 'calves',
  'lower legs': 'calves',
  'forearms': 'forearms',
  'lower arms': 'forearms',
  'neck': 'neck',
  'levator scapulae': 'neck',
}

export const OTHER_MUSCLE_GROUP = 'other'

export const MUSCLE_GROUPS: { key: string; label: string }[] = [
  { key: 'chest', label: 'Chest' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'biceps', label: 'Biceps' },
  { key: 'triceps', label: 'Triceps' },
  { key: 'forearms', label: 'Forearms' },
  { key: 'lats', label: 'Back / Lats' },
  { key: 'traps', label: 'Traps' },
  { key: 'lower_back', label: 'Lower back' },
  { key: 'core', label: 'Core' },
  { key: 'glutes', label: 'Glutes' },
  { key: 'quads', label: 'Quads' },
  { key: 'hamstrings', label: 'Hamstrings' },
  { key: 'calves', label: 'Calves' },
  { key: 'neck', label: 'Neck' },
  { key: OTHER_MUSCLE_GROUP, label: 'Other / Cardio' },
]

export function normalizeMuscle(muscle: string): string {
  return MUSCLE_MAP[muscle.toLowerCase()] ?? muscle.toLowerCase()
}

export function muscleGroupOf(muscle: string | null | undefined): string {
  if (!muscle) return OTHER_MUSCLE_GROUP
  return MUSCLE_MAP[muscle.toLowerCase()] ?? OTHER_MUSCLE_GROUP
}

export function muscleGroupLabel(key: string): string {
  return MUSCLE_GROUPS.find((g) => g.key === key)?.label ?? key
}
