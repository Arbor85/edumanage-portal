import type { ExerciseSet } from './workoutTypes';

const parseNumber = (value: string) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const parseRepsForVolume = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith('rpe:') || trimmed.startsWith('rir:')) {
    return 10;
  }
  if (trimmed.includes('-')) {
    const cleaned = trimmed.replace(/\s+/g, '');
    const parts = cleaned.split('-');
    const upper = parts[1] ?? '';
    const upperValue = parseNumber(upper);
    return upperValue > 0 ? upperValue : 0;
  }
  return parseNumber(value);
};

export const DEFAULT_REST_SECONDS = 90;

export const getSetVolume = (set: ExerciseSet) => {
  const weight = parseNumber(set.weight);
  const reps = parseRepsForVolume(set.reps);
  return Math.round(weight * reps);
};

export const getVolumeChange = (previous: number | null, current: number) => {
  if (!previous || previous <= 0) return null;
  const diff = current - previous;
  if (diff === 0) return { direction: 'flat' as const, percent: 0 };
  const percent = Math.round((Math.abs(diff) / previous) * 100);
  return { direction: diff > 0 ? 'up' : 'down', percent } as const;
};

export const formatRest = (seconds: number | null | undefined) => {
  const total = typeof seconds === 'number' && seconds >= 0 ? seconds : DEFAULT_REST_SECONDS;
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
