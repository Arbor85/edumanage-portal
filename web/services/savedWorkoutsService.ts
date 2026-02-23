import { SavedWorkout } from '../types';

// In-memory mock for now. Replace with API calls or persistent storage as needed.
let savedWorkouts: SavedWorkout[] = [];

export const getSavedWorkouts = async (): Promise<SavedWorkout[]> => {
  // Simulate async fetch
  return [...savedWorkouts];
};

export const getSavedWorkoutById = async (id: string): Promise<SavedWorkout | undefined> => {
  return savedWorkouts.find(w => w.id === id);
};

export const createSavedWorkout = async (workout: Omit<SavedWorkout, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<SavedWorkout> => {
  const newWorkout: SavedWorkout = {
    ...workout,
    id: workout.id || Math.random().toString(36).substr(2, 9),
    createdAt: workout.createdAt || new Date().toISOString(),
  };
  savedWorkouts.push(newWorkout);
  return newWorkout;
};

export const updateSavedWorkout = async (id: string, updates: Partial<SavedWorkout>): Promise<SavedWorkout | undefined> => {
  const idx = savedWorkouts.findIndex(w => w.id === id);
  if (idx === -1) return undefined;
  savedWorkouts[idx] = { ...savedWorkouts[idx], ...updates };
  return savedWorkouts[idx];
};

export const deleteSavedWorkout = async (id: string): Promise<boolean> => {
  const prevLen = savedWorkouts.length;
  savedWorkouts = savedWorkouts.filter(w => w.id !== id);
  return savedWorkouts.length < prevLen;
};
