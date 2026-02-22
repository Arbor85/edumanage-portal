import React from 'react';
import SetTypePicker from './SetTypePicker';
import WeightInput from './WeightInput';
import RepsInput from './RepsInput';
import type { ExerciseEntry } from './workoutTypes';
import { DEFAULT_REST_SECONDS, formatRest, getSetVolume, getVolumeChange } from './workoutUtils';

type RestEditorState = {
  dayId: string;
  exerciseIndex: number;
  setIndex?: number;
  minutes: string;
  seconds: string;
};

type ExerciseSetsListProps = {
  dayId: string;
  exercise: ExerciseEntry;
  exerciseIndex: number;
  isExpanded: boolean;
  restEditor: RestEditorState | null;
  onOpenRestEditor: (dayId: string, exerciseIndex: number, setIndex: number | undefined, seconds: number | null | undefined) => void;
  onRestEditorChange: (field: 'minutes' | 'seconds', value: string) => void;
  onCloseRestEditor: () => void;
  onSaveRestEditor: () => void;
  onUpdateSet: (
    dayId: string,
    exerciseIndex: number,
    setIndex: number,
    field: 'type' | 'weight' | 'reps' | 'restTimeSeconds',
    value: string | number | null
  ) => void;
  onRemoveSet: (dayId: string, exerciseIndex: number, setIndex: number) => void;
  onAddSet: (dayId: string, exerciseIndex: number) => void;
  setActiveSync: React.Dispatch<React.SetStateAction<{
    dayId: string;
    exerciseIndex: number;
    setIndex: number;
    field: 'weight' | 'reps';
  } | null>>;
};

const ExerciseSetsList: React.FC<ExerciseSetsListProps> = ({
  dayId,
  exercise,
  exerciseIndex,
  isExpanded,
  restEditor,
  onOpenRestEditor,
  onRestEditorChange,
  onCloseRestEditor,
  onSaveRestEditor,
  onUpdateSet,
  onRemoveSet,
  onAddSet,
  setActiveSync,
}) => {
  if (!isExpanded) return null;

  return (
    <>
      <div className="space-y-2">
        {exercise.sets.map((set, setIndex) => (
          <div
            key={`${dayId}-${exercise.name}-set-${setIndex}`}
            className="flex w-full flex-nowrap items-center gap-2 relative"
          >
            {(() => {
              const exerciseRest = exercise.restTimeSeconds ?? DEFAULT_REST_SECONDS;
              const effectiveRest = set.restTimeSeconds ?? exerciseRest;
              const isEditingThis = restEditor && restEditor.dayId === dayId && restEditor.exerciseIndex === exerciseIndex && restEditor.setIndex === setIndex;
              return (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenRestEditor(dayId, exerciseIndex, setIndex, effectiveRest)}
                    className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-border-dark rounded-full px-3 py-1"
                  >
                    Rest: {formatRest(effectiveRest)}
                  </button>
                  {isEditingThis && (
                    <div className="absolute left-0 top-full mt-2 z-10 rounded-xl border border-slate-300 dark:border-border-dark bg-white dark:bg-surface-dark px-3 py-3 shadow-lg shadow-slate-900/40 w-[220px] space-y-2">
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Set rest time (override)</p>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-slate-600 dark:text-slate-400">Min</label>
                        <input
                          type="number"
                          min="0"
                          value={restEditor?.minutes ?? ''}
                          onChange={e => onRestEditorChange('minutes', e.target.value)}
                          className="w-16 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-2 py-1 focus:outline-none"
                        />
                        <label className="text-[11px] text-slate-600 dark:text-slate-400">Sec</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={restEditor?.seconds ?? ''}
                          onChange={e => onRestEditorChange('seconds', e.target.value)}
                          className="w-16 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-2 py-1 focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={onCloseRestEditor}
                          className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={onSaveRestEditor}
                          className="text-[11px] font-bold text-white px-3 py-1 rounded-lg bg-blue-600 dark:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
            <label className="sr-only">Set type</label>
            <SetTypePicker
              value={set.type}
              onChange={next => onUpdateSet(dayId, exerciseIndex, setIndex, 'type', next)}
            />
            <label className="sr-only">Weight</label>
            <WeightInput
              value={set.weight}
              onChange={next =>
                onUpdateSet(dayId, exerciseIndex, setIndex, 'weight', next)
              }
              onFocus={() =>
                setActiveSync({ dayId, exerciseIndex, setIndex, field: 'weight' })
              }
              onBlur={() =>
                setActiveSync(prev =>
                  prev &&
                  prev.dayId === dayId &&
                  prev.exerciseIndex === exerciseIndex &&
                  prev.setIndex === setIndex &&
                  prev.field === 'weight'
                    ? null
                    : prev
                )
              }
            />
             <label className="sr-only">Reps</label>
            <RepsInput
              value={set.reps}
              onChange={next =>
                onUpdateSet(dayId, exerciseIndex, setIndex, 'reps', next)
              }
              onFocus={() =>
                setActiveSync({ dayId, exerciseIndex, setIndex, field: 'reps' })
              }
              onBlur={() =>
                setActiveSync(prev =>
                  prev &&
                  prev.dayId === dayId &&
                  prev.exerciseIndex === exerciseIndex &&
                  prev.setIndex === setIndex &&
                  prev.field === 'reps'
                    ? null
                    : prev
                )
              }
              step={2}
            />
            <button
              type="button"
              onClick={() => onRemoveSet(dayId, exerciseIndex, setIndex)}
              className="text-slate-400 hover:text-rose-500"
              aria-label={`Remove set ${setIndex + 1}`}
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
            <div className="ml-auto flex items-center gap-2">
              {(() => {
                const previousVolume = setIndex > 0 ? getSetVolume(exercise.sets[setIndex - 1]) : null;
                const currentVolume = getSetVolume(set);
                const change = getVolumeChange(previousVolume, currentVolume);
                if (!change) return null;
                if (change.direction === 'flat') {
                  return (
                    <span className="text-[11px] font-semibold text-slate-400">= (0%)</span>
                  );
                }
                const isUp = change.direction === 'up';
                const colorClass = isUp ? 'text-emerald-400' : 'text-amber-400';
                const arrow = isUp ? 'arrow_upward' : 'arrow_downward';
                const sign = isUp ? '+' : '-';
                return (
                  <span className={`flex items-center gap-1 text-[11px] font-bold ${colorClass}`}>
                    <span className="material-symbols-outlined text-sm leading-none">{arrow}</span>
                    <span>({sign}{change.percent}%)</span>
                  </span>
                );
              })()}
              <span className="min-w-[96px] text-center text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-border-dark rounded-xl px-2 py-2">
                Vol {getSetVolume(set)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onAddSet(dayId, exerciseIndex)}
        className="px-4 py-2 rounded-xl border border-slate-300 dark:border-border-dark text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300"
      >
        Add Set
      </button>
    </>
  );
};

export default ExerciseSetsList;
