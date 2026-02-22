import React, { useState } from 'react';
import WeightInput from './WeightInput';
import RepsInput from './RepsInput';
import type { ExerciseEntry, ExerciseSetType } from '../workoutTypes';
import { formatRest } from '../workoutUtils';

type ExerciseSetDialogState = {
  setIndex: number;
  type: ExerciseSetType;
  weight: string;
  reps: string;
  restEnabled: boolean;
  minutes: string;
  seconds: string;
  tutDownSeconds: string;
  tutBottomSeconds: string;
  tutUpSeconds: string;
  tutTopSeconds: string;
};

type ExerciseSetDialogProps = {
  open: boolean;
  exercise: ExerciseEntry;
  state: ExerciseSetDialogState;
  dayId: string;
  exerciseIndex: number;
  setActiveSync: React.Dispatch<React.SetStateAction<{
    dayId: string;
    exerciseIndex: number;
    setIndex: number;
    field: 'weight' | 'reps';
  } | null>>;
  onChange: (next: ExerciseSetDialogState) => void;
  onClose: () => void;
  onDelete: (setIndex: number) => void;
  onSave: () => void;
};

const setTypeOptions: { value: ExerciseSetType; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'warmup', label: 'Warmup' },
  { value: 'failure', label: 'Failure' },
  { value: 'drop_set', label: 'Drop set' },
];

const setTypeTone = (type: ExerciseSetType) => {
  switch (type) {
    case 'warmup':
      return 'border-amber-300/60 text-amber-600 dark:text-amber-300';
    case 'failure':
      return 'border-rose-300/60 text-rose-600 dark:text-rose-300';
    case 'drop_set':
      return 'border-purple-300/60 text-purple-600 dark:text-purple-300';
    default:
      return 'border-emerald-300/60 text-emerald-600 dark:text-emerald-300';
  }
};

const ExerciseSetDialog: React.FC<ExerciseSetDialogProps> = ({
  open,
  exercise,
  state,
  dayId,
  exerciseIndex,
  setActiveSync,
  onChange,
  onClose,
  onDelete,
  onSave,
}) => {
  const [isTutDialogOpen, setIsTutDialogOpen] = useState(false);
  if (!open) return null;

  const tutSummary = () => {
    const values = [
      state.tutDownSeconds,
      state.tutBottomSeconds,
      state.tutUpSeconds,
      state.tutTopSeconds,
    ];
    const hasValue = values.some(value => String(value).trim().length > 0);
    if (!hasValue) return 'Not set';
    return `${state.tutDownSeconds || 0}-${state.tutBottomSeconds || 0}-${state.tutUpSeconds || 0}-${state.tutTopSeconds || 0}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close edit dialog"
      />
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark shadow-2xl">
        <div className="p-5 border-b border-slate-200 dark:border-border-dark flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Edit set</p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Set {state.setIndex + 1}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-10 rounded-full bg-slate-900/5 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-primary"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-[120px_1fr] items-center">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Set type</p>
            <div className="flex flex-wrap gap-2">
              {setTypeOptions.map(option => {
                const isActive = state.type === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange({ ...state, type: option.value })}
                    className={`px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                        : `bg-white dark:bg-slate-900/70 border-slate-300 dark:border-slate-700 ${setTypeTone(option.value)}`
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[120px_1fr] items-center">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Weight</p>
            <WeightInput
              value={state.weight}
              onChange={next => onChange({ ...state, weight: next })}
              onFocus={() =>
                setActiveSync({ dayId, exerciseIndex, setIndex: state.setIndex, field: 'weight' })
              }
              onBlur={() =>
                setActiveSync(prev =>
                  prev &&
                  prev.dayId === dayId &&
                  prev.exerciseIndex === exerciseIndex &&
                  prev.setIndex === state.setIndex &&
                  prev.field === 'weight'
                    ? null
                    : prev
                )
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[120px_1fr] items-center">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Reps</p>
            <RepsInput
              value={state.reps}
              onChange={next => onChange({ ...state, reps: next })}
              onFocus={() =>
                setActiveSync({ dayId, exerciseIndex, setIndex: state.setIndex, field: 'reps' })
              }
              onBlur={() =>
                setActiveSync(prev =>
                  prev &&
                  prev.dayId === dayId &&
                  prev.exerciseIndex === exerciseIndex &&
                  prev.setIndex === state.setIndex &&
                  prev.field === 'reps'
                    ? null
                    : prev
                )
              }
              step={2}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[120px_1fr] items-center">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Movement TUT</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{tutSummary()}</span>
              <button
                type="button"
                onClick={() => setIsTutDialogOpen(true)}
                className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-200 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-border-dark rounded-full px-3 py-2"
              >
                Edit
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-[120px_1fr] items-start">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Rest</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-600 dark:text-slate-400">Min</label>
                <input
                  type="number"
                  min="0"
                  value={state.minutes}
                  onChange={e => onChange({ ...state, minutes: e.target.value, restEnabled: true })}
                  className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-2 py-1 focus:outline-none"
                />
                <label className="text-[11px] text-slate-600 dark:text-slate-400">Sec</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={state.seconds}
                  onChange={e => onChange({ ...state, seconds: e.target.value, restEnabled: true })}
                  className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-2 py-1 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Exercise rest: {formatRest(exercise.restTimeSeconds)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-border-dark flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(state.setIndex)}
            className="text-[11px] font-semibold text-rose-600 dark:text-rose-300 px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-400/30"
          >
            Delete set
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="text-[11px] font-bold text-white px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-700"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export type { ExerciseSetDialogState };
export default ExerciseSetDialog;
