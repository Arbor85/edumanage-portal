import React, { useEffect, useMemo, useRef, useState } from 'react';
import ExerciseSelectDialog from './components/ExerciseSelectDialog';
import ExerciseSetsList from './components/ExerciseSetsList';
import { DEFAULT_REST_SECONDS, formatRest, getSetVolume } from './workoutUtils';
import type { ExerciseEntry, ExerciseSet, MovementTUT, WorkoutDay } from './workoutTypes';
export type { ExerciseEntry, ExerciseSet, ExerciseSetType, WorkoutDay } from './workoutTypes';

type RestEditorState = {
  dayId: string;
  exerciseIndex: number;
  setIndex?: number;
  minutes: string;
  seconds: string;
};


const parseRestParts = (minutes: string, seconds: string) => {
  const mins = Math.max(0, Number(minutes) || 0);
  const secs = Math.min(59, Math.max(0, Number(seconds) || 0));
  return mins * 60 + secs;
};

type WorkoutDaysListProps = {
  workoutDayList: WorkoutDay[];
  onWorkoutDayListChanged: (next: WorkoutDay[]) => void;
};

const WorkoutDaysList: React.FC<WorkoutDaysListProps> = ({ workoutDayList, onWorkoutDayListChanged }) => {
  const [animatedDays, setAnimatedDays] = useState<string[]>([]);
  const prevIdsRef = useRef<string[]>([]);
  const [dialogDayId, setDialogDayId] = useState<string | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
  const [draggedExercise, setDraggedExercise] = useState<{ dayId: string; index: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{ dayId: string; index: number } | null>(null);
  const [activeSync, setActiveSync] = useState<{
    dayId: string;
    exerciseIndex: number;
    setIndex: number;
    field: 'weight' | 'reps';
  } | null>(null);
  const [restEditor, setRestEditor] = useState<RestEditorState | null>(null);

  useEffect(() => {
    const prev = prevIdsRef.current;
    const nextIds = workoutDayList.map(day => day.id);
    const added = nextIds.filter(id => !prev.includes(id));
    if (added.length) {
      setAnimatedDays(current => Array.from(new Set([...current, ...added])));
    }
    prevIdsRef.current = nextIds;
  }, [workoutDayList]);

  const updateDay = (dayId: string, mapper: (day: WorkoutDay) => WorkoutDay) => {
    onWorkoutDayListChanged(
      workoutDayList.map(day => (day.id === dayId ? mapper(day) : day))
    );
  };

  const handleSelectExercise = (exerciseName: string) => {
    if (!dialogDayId) return;
    updateDay(dialogDayId, day => ({
      ...day,
      exercises: [
        ...day.exercises,
        {
          name: exerciseName,
          restTimeSeconds: DEFAULT_REST_SECONDS,
          sets: [],
        },
      ],
      draft: '',
    }));
    setDialogDayId(null);
  };

  const handleDragStart = (dayId: string, index: number) => {
    setDraggedExercise({ dayId, index });
  };

  const handleDragOver = (e: React.DragEvent, dayId: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedExercise && draggedExercise.dayId === dayId) {
      setDragOverIndex({ dayId, index });
    }
  };

  const handleDrop = (e: React.DragEvent, dayId: string, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedExercise || draggedExercise.dayId !== dayId) return;
    if (draggedExercise.index === dropIndex) {
      setDraggedExercise(null);
      setDragOverIndex(null);
      return;
    }

    updateDay(dayId, day => {
      const list = [...day.exercises];
      const [item] = list.splice(draggedExercise.index, 1);
      list.splice(dropIndex, 0, item);
      return { ...day, exercises: list };
    });

    setDraggedExercise(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedExercise(null);
    setDragOverIndex(null);
  };

  const handleRemoveExercise = (dayId: string, index: number) => {
    updateDay(dayId, day => ({
      ...day,
      exercises: day.exercises.filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateSet = (
    dayId: string,
    exerciseIndex: number,
    setIndex: number,
    field: 'type' | 'weight' | 'reps' | 'restTimeSeconds' | 'movementTUT',
    value: string | number | MovementTUT | null
  ) => {
    updateDay(dayId, day => {
      const exercises = [...day.exercises];
      const exercise = exercises[exerciseIndex];
      if (!exercise) return day;
      const sets = [...exercise.sets];
      const set = sets[setIndex];
      if (!set) return day;
      sets[setIndex] = { ...set, [field]: value } as ExerciseSet;

      const isSyncingActive =
        activeSync &&
        activeSync.dayId === dayId &&
        activeSync.exerciseIndex === exerciseIndex &&
        activeSync.setIndex === setIndex &&
        (field === 'weight' || field === 'reps') &&
        activeSync.field === field;

      if (field === 'weight' || field === 'reps') {
        if (isSyncingActive) {
          for (let i = setIndex + 1; i < sets.length; i += 1) {
            sets[i] = { ...sets[i], [field]: value } as ExerciseSet;
          }
        } else {
          const hasValue = value !== '';
          if (hasValue) {
            for (let i = setIndex + 1; i < sets.length; i += 1) {
              const nextSet = sets[i];
              if (nextSet[field] !== '') break;
              sets[i] = { ...nextSet, [field]: value } as ExerciseSet;
            }
          }
        }
      }

      exercises[exerciseIndex] = { ...exercise, sets };
      return { ...day, exercises };
    });
  };

  const handleRemoveSet = (dayId: string, exerciseIndex: number, setIndex: number) => {
    updateDay(dayId, day => {
      const exercises = [...day.exercises];
      const exercise = exercises[exerciseIndex];
      if (!exercise) return day;
      const sets = exercise.sets.filter((_, idx) => idx !== setIndex);
      exercises[exerciseIndex] = { ...exercise, sets };
      return { ...day, exercises };
    });
  };

  const handleAddSet = (dayId: string, exerciseIndex: number) => {
    updateDay(dayId, day => {
      const exercises = [...day.exercises];
      const exercise = exercises[exerciseIndex];
      if (!exercise) return day;
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const nextSet: ExerciseSet = {
        type: 'normal',
        weight: lastSet?.weight ?? '20',
        reps: lastSet?.reps ?? '5',
        restTimeSeconds: null,
      };
      const sets = [...exercise.sets, nextSet];
      exercises[exerciseIndex] = { ...exercise, sets };
      return { ...day, exercises };
    });
  };

  const handleMoveSet = (
    dayId: string,
    exerciseIndex: number,
    fromIndex: number,
    toIndex: number
  ) => {
    if (fromIndex === toIndex) return;
    updateDay(dayId, day => {
      const exercises = [...day.exercises];
      const exercise = exercises[exerciseIndex];
      if (!exercise) return day;
      const sets = [...exercise.sets];
      const [moved] = sets.splice(fromIndex, 1);
      if (!moved) return day;
      sets.splice(toIndex, 0, moved);
      exercises[exerciseIndex] = { ...exercise, sets };
      return { ...day, exercises };
    });
  };

  const handleReplaceSets = (
    dayId: string,
    exerciseIndex: number,
    newSets: ExerciseSet[]
  ) => {
    updateDay(dayId, day => {
      const exercises = [...day.exercises];
      const exercise = exercises[exerciseIndex];
      if (!exercise) return day;
      exercises[exerciseIndex] = { ...exercise, sets: newSets };
      return { ...day, exercises };
    });
  };

  const resolvedList = useMemo(() => workoutDayList, [workoutDayList]);

  const openRestEditor = (
    dayId: string,
    exerciseIndex: number,
    setIndex: number | undefined,
    seconds: number | null | undefined
  ) => {
    const total = typeof seconds === 'number' && seconds >= 0 ? seconds : DEFAULT_REST_SECONDS;
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    setRestEditor({
      dayId,
      exerciseIndex,
      setIndex,
      minutes: String(mins),
      seconds: String(secs).padStart(2, '0'),
    });
  };

  const closeRestEditor = () => setRestEditor(null);

  const handleRestEditorChange = (field: 'minutes' | 'seconds', value: string) => {
    setRestEditor(current => current ? { ...current, [field]: value } : current);
  };

  const saveRestEditor = () => {
    if (!restEditor) return;
    const nextSeconds = parseRestParts(restEditor.minutes, restEditor.seconds);
    if (restEditor.setIndex !== undefined) {
      handleUpdateSet(restEditor.dayId, restEditor.exerciseIndex, restEditor.setIndex, 'restTimeSeconds', nextSeconds);
    } else {
      updateDay(restEditor.dayId, day => {
        const exercises = [...day.exercises];
        const exercise = exercises[restEditor.exerciseIndex];
        if (!exercise) return day;
        exercises[restEditor.exerciseIndex] = { ...exercise, restTimeSeconds: nextSeconds };
        return { ...day, exercises };
      });
    }
    closeRestEditor();
  };

  return (
    <>
      <div className="grid gap-4">
        {resolvedList.map(day => (
          <div
            key={day.id}
            onAnimationEnd={() => setAnimatedDays(prev => prev.filter(item => item !== day.id))}
            className={`rounded-3xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark shadow-xl shadow-slate-900/30 p-5 space-y-5 ${animatedDays.includes(day.id) ? 'day-slide-in' : ''}`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                  <span className="material-symbols-outlined">fitness_center</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{(day.label ?? day.id).trim() || day.id}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{day.id}</p>
                </div>
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/15 px-3 py-1 rounded-full">
                {(day.exercises ?? []).length} exercises
              </span>
            </div>

            {(day.exercises ?? []).length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-white/60">No exercises yet.</p>
            ) : (
              <div className="space-y-4">
                {(day.exercises ?? []).map((exercise, index) => {
                  const exerciseKey = `${day.id}-${index}`;
                  const isExpanded = expandedExercises.has(exerciseKey);
                  return (
                  <div
                    key={`${day.id}-${exercise.name}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(day.id, index)}
                    onDragOver={(e) => handleDragOver(e, day.id, index)}
                    onDrop={(e) => handleDrop(e, day.id, index)}
                    onDragEnd={handleDragEnd}
                    className={`rounded-2xl border-2 bg-slate-50 dark:bg-white/5 p-4 space-y-3 shadow-inner transition-all ${
                      draggedExercise?.dayId === day.id && draggedExercise?.index === index
                        ? 'opacity-50 border-dashed border-slate-400 dark:border-slate-600'
                        : dragOverIndex?.dayId === day.id && dragOverIndex?.index === index
                        ? 'border-primary border-solid bg-primary/5 dark:bg-primary/10'
                        : 'border-slate-200 dark:border-border-dark'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 relative">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-1.5 rounded-full bg-blue-500/80" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{exercise.name}</p>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {exercise.sets.length} sets
                          </p>
                          {(() => {
                            if (!isExpanded) return null;
                            return (
                              <div className="flex items-center gap-2">
                                <p className="text-[11px] font-bold text-blue-600 dark:text-blue-300">
                                  Exercise volume: {exercise.sets.reduce((total, set) => total + getSetVolume(set), 0)}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => openRestEditor(day.id, index, undefined, exercise.restTimeSeconds)}
                                  className="text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-border-dark rounded-full px-3 py-1"
                                >
                                  Rest: {formatRest(exercise.restTimeSeconds)}
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedExercises(current => {
                              const next = new Set(current);
                              if (next.has(exerciseKey)) {
                                next.delete(exerciseKey);
                              } else {
                                next.add(exerciseKey);
                              }
                              return next;
                            });
                          }}
                          className="text-slate-400 hover:text-primary transition-colors"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <span className="material-symbols-outlined text-sm transition-transform" style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}>expand_more</span>
                        </button>
                        <button
                          type="button"
                          draggable={false}
                          className="text-slate-400 hover:text-primary cursor-grab active:cursor-grabbing transition-colors"
                          aria-label="Drag to reorder"
                          title="Drag to reorder exercise"
                        >
                          <span className="material-symbols-outlined text-lg">drag_indicator</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(day.id, index)}
                          className="text-slate-400 hover:text-rose-500"
                          aria-label={`Remove ${exercise.name}`}
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                      {restEditor && restEditor.dayId === day.id && restEditor.exerciseIndex === index && restEditor.setIndex === undefined && (
                        <div className="absolute right-0 top-full mt-2 z-10 rounded-xl border border-slate-300 dark:border-border-dark bg-white dark:bg-surface-dark px-3 py-3 shadow-lg shadow-slate-900/40 w-[220px] space-y-2">
                          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Set rest time</p>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] text-slate-600 dark:text-slate-400">Min</label>
                            <input
                              type="number"
                              min="0"
                              value={restEditor.minutes}
                              onChange={e => setRestEditor(current => current ? { ...current, minutes: e.target.value } : current)}
                              className="w-16 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-2 py-1 focus:outline-none"
                            />
                            <label className="text-[11px] text-slate-600 dark:text-slate-400">Sec</label>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              value={restEditor.seconds}
                              onChange={e => setRestEditor(current => current ? { ...current, seconds: e.target.value } : current)}
                              className="w-16 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-2 py-1 focus:outline-none"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={closeRestEditor}
                              className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={saveRestEditor}
                              className="text-[11px] font-bold text-white px-3 py-1 rounded-lg bg-blue-600 dark:bg-blue-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <ExerciseSetsList
                      dayId={day.id}
                      exercise={exercise}
                      exerciseIndex={index}
                      isExpanded={isExpanded}
                      onMoveSet={handleMoveSet}
                      onUpdateSet={handleUpdateSet}
                      onRemoveSet={handleRemoveSet}
                      onAddSet={handleAddSet}
                      onReplaceSets={handleReplaceSets}
                      setActiveSync={setActiveSync}
                    />
                  </div>
                );
              })}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <button
                type="button"
                onClick={() => setDialogDayId(day.id)}
                className="px-5 py-3 rounded-2xl bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/25"
              >
                Add exercise
              </button>
            </div>
          </div>
        ))}
      </div>

      <ExerciseSelectDialog
        open={Boolean(dialogDayId)}
        onClose={() => setDialogDayId(null)}
        onSelect={handleSelectExercise}
      />
    </>
  );
};

export default WorkoutDaysList;
