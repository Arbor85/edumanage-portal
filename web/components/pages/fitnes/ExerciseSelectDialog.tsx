import React, { useMemo, useState } from 'react';
import exerciseData from './data/excercises.json';

export type ExerciseSelectDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (exerciseName: string) => void;
};

const ExerciseSelectDialog: React.FC<ExerciseSelectDialogProps> = ({ open, onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const [activeMuscle, setActiveMuscle] = useState('All');
  const [visibleCount, setVisibleCount] = useState(30);

  const muscles = useMemo(() => {
    const muscleSet = new Set<string>();
    let hasOther = false;

    exerciseData.exercises.forEach((exercise) => {
      const list = exercise.primary_muscles ?? [];
      if (!list.length) {
        hasOther = true;
        return;
      }
      list.forEach((muscle) => {
        const normalized = muscle.trim().replace(/\s+/g, ' ');
        if (normalized) {
          muscleSet.add(normalized);
        }
      });
    });

    const base = ['All', ...Array.from(muscleSet).sort()];
    if (hasOther) base.push('Other');
    return base;
  }, []);

  const filteredExercises = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return exerciseData.exercises.filter((exercise) => {
      const primaryMuscles = exercise.primary_muscles || [];
      const matchesMuscle =
        activeMuscle === 'All' ||
        (activeMuscle === 'Other'
          ? primaryMuscles.length === 0
          : primaryMuscles.some((muscle) => muscle.toLowerCase() === activeMuscle.toLowerCase()));
      const matchesSearch =
        !normalizedSearch ||
        exercise.name.toLowerCase().includes(normalizedSearch) ||
        exercise.category.toLowerCase().includes(normalizedSearch) ||
        primaryMuscles.some((muscle) => muscle.toLowerCase().includes(normalizedSearch));
      return matchesMuscle && matchesSearch;
    });
  }, [activeMuscle, search]);

  const visibleExercises = filteredExercises.slice(0, visibleCount);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close exercise selector"
      />
      <div className="relative w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-3xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark shadow-2xl">
        <div className="p-5 border-b border-slate-200 dark:border-border-dark flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Add exercise</p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Browse library</h2>
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

        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search exercises..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setVisibleCount(30);
              }}
              className="w-full h-11 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {muscles.map((muscle) => (
              <button
                key={muscle}
                type="button"
                onClick={() => {
                  setActiveMuscle(muscle);
                  setVisibleCount(30);
                }}
                className={`h-9 px-5 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors ${
                  activeMuscle === muscle
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-500'
                }`}
              >
                {muscle}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {visibleExercises.map((exercise) => {
              const subtitleParts = [exercise.category];
              const equipment = exercise.equipment?.[0];
              if (equipment) subtitleParts.push(equipment);
              const muscle = exercise.primary_muscles?.[0];
              if (muscle) subtitleParts.push(muscle);

              return (
                <button
                  key={exercise.name}
                  type="button"
                  onClick={() => onSelect(exercise.name)}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-2xl border bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 active:scale-[0.99]"
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white leading-tight">{exercise.name}</p>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-white/60 mt-1">
                      {subtitleParts.join(' • ') || 'General'}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
                </button>
              );
            })}
          </div>

          {visibleExercises.length < filteredExercises.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 30)}
              className="w-full py-3 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-200 text-xs font-bold uppercase tracking-wider"
            >
              Load more
            </button>
          )}

          {filteredExercises.length === 0 && (
            <p className="text-xs font-semibold text-slate-400">No exercises match your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseSelectDialog;
