import { exerciseImageMap } from '../data/exerciseImageMap'
import type { ExcerciseOut } from '../types'

export const EXERCISE_IMAGE_FALLBACK = '/images/benchpress.png'

export function exerciseImageSrc(ex: ExcerciseOut): string {
  const mapEntry = exerciseImageMap[(ex.name ?? '').toLowerCase()]
  return ex.imagePath ?? mapEntry?.imagePath ?? EXERCISE_IMAGE_FALLBACK
}

export function exerciseGifSrc(ex: ExcerciseOut): string | null {
  const mapEntry = exerciseImageMap[(ex.name ?? '').toLowerCase()]
  return ex.gifPath ?? mapEntry?.gifPath ?? null
}
