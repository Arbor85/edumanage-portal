export type ExerciseSetType = 'normal' | 'warmup' | 'failure' | 'drop_set';

export type MovementTUT = {
  downSeconds: number;
  bottomSeconds: number;
  upSeconds: number;
  topSeconds: number;
};

export type ExerciseSet = {
  type: ExerciseSetType;
  weight: number;
  reps: number;
  restTimeSeconds?: number | null;
  movementTUT?: MovementTUT | null;
};

export type ExerciseEntry = {
  name: string;
  sets: ExerciseSet[];
  restTimeSeconds?: number;
};

export type WorkoutDay = {
  id: string;
  label: string;
  exercises: ExerciseEntry[];
  draft: string;
};
