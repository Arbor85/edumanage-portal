import React, { useEffect, useMemo, useState } from 'react';
import HumanMuscleMap from './components/HumanMuscleMap';

type Exercise = {
  name: string;
  category: string;
  description?: string;
  equipment?: string[];
  primary_muscles?: string[];
  secondary_muscles?: string[];
  instructions?: string[];
  video?: string;
};

type ExerciseData = {
  categories?: string[];
  exercises: Exercise[];
};

const Explore: React.FC = () => {
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeMuscle, setActiveMuscle] = useState('All');
  const [visibleCount, setVisibleCount] = useState(24);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const module = await import('./data/excercises.json');
        const payload = ((module as { default?: ExerciseData }).default ?? module) as ExerciseData;
        const exercises = payload.exercises ?? [];
        const categories = payload.categories ?? Array.from(new Set(exercises.map((item) => item.category))).sort();
        setExerciseData({ exercises, categories });
      } catch (error) {
        console.error('Failed to load exercises:', error);
        setExerciseData({ categories: [], exercises: [] });
      } finally {
        setIsLoading(false);
      }
    };

    loadExercises();
  }, []);

  useEffect(() => {
    setVisibleCount(24);
  }, [search, activeMuscle]);

  const muscles = useMemo(() => {
    if (!exerciseData?.exercises?.length) {
      return ['All'];
    }

    const muscleSet = new Set<string>();
    let hasUnspecified = false;

    exerciseData.exercises.forEach((exercise) => {
      if (!exercise.primary_muscles || exercise.primary_muscles.length === 0) {
        hasUnspecified = true;
        return;
      }

      exercise.primary_muscles.forEach((muscle) => {
        const normalized = muscle.trim().replace(/\s+/g, ' ');
        if (normalized) {
          muscleSet.add(normalized);
        }
      });
    });

    const list = ['All', ...Array.from(muscleSet).sort()];
    if (hasUnspecified) {
      list.push('Other');
    }

    return list;
  }, [exerciseData]);

  const filteredExercises = useMemo(() => {
    if (!exerciseData) return [];

    const normalizedSearch = search.trim().toLowerCase();
    return exerciseData.exercises.filter((exercise) => {
      const primaryMuscles = exercise.primary_muscles || [];
      const matchesMuscle =
        activeMuscle === 'All' ||
        (activeMuscle === 'Other'
          ? primaryMuscles.length === 0
          : primaryMuscles.some(
              (muscle) => muscle.toLowerCase() === activeMuscle.toLowerCase()
            ));
      const matchesSearch =
        !normalizedSearch ||
        exercise.name.toLowerCase().includes(normalizedSearch) ||
        exercise.category.toLowerCase().includes(normalizedSearch) ||
        primaryMuscles.some((muscle) =>
          muscle.toLowerCase().includes(normalizedSearch)
        );
      return matchesMuscle && matchesSearch;
    });
  }, [exerciseData, activeMuscle, search]);

  const visibleExercises = filteredExercises.slice(0, visibleCount);

  return (
    <div className="px-4 pt-6 pb-24 space-y-6 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-20 bg-background-light dark:bg-background-dark pt-4 pb-2 border-b border-slate-200 dark:border-border-dark">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
          <button className="size-10 rounded-full bg-slate-900/5 dark:bg-white/5 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full h-12 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl pl-12 pr-4 text-base focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {muscles.map((muscle) => (
            <button
              key={muscle}
              onClick={() => setActiveMuscle(muscle)}
              className={`h-9 px-6 rounded-full text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-colors ${
                activeMuscle === muscle
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-400'
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>
      </header>

      <div className={`grid gap-6 ${selectedExercise ? 'grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,4fr)]' : 'grid-cols-1'}`}>
        <section className="space-y-4 w-full">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Recommended for you</h2>
          {isLoading && (
            <div className="text-xs font-semibold text-slate-400 px-1">Loading exercises...</div>
          )}
          {!isLoading && visibleExercises.length === 0 && (
            <div className="text-xs font-semibold text-slate-400 px-1">No exercises match your filters.</div>
          )}
          {visibleExercises.map((exercise) => {
            const muscle = exercise.primary_muscles?.[0] ?? 'full body';
            const equipment = exercise.equipment?.[0] ?? 'bodyweight';
            const subtitle = `${equipment} • ${muscle}`;

            return (
              <button
                key={exercise.name}
                type="button"
                onClick={() => setSelectedExercise(exercise)}
                className={`w-full text-left flex items-center gap-4 p-3 rounded-2xl border group active:scale-[0.98] transition-transform ${
                  selectedExercise?.name === exercise.name
                    ? 'bg-primary/10 border-primary/40'
                    : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark'
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{exercise.name}</h3>
                  <p className="hidden lg:block text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
                </div>
              </button>
            );
          })}
          {!isLoading && visibleExercises.length < filteredExercises.length && (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 24)}
              className="w-full py-4 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-200 text-xs font-bold uppercase tracking-wider"
            >
              Load more
            </button>
          )}
        </section>

        {selectedExercise && (
          <aside className="lg:sticky lg:top-24 h-fit w-[90%] lg:w-full justify-self-center rounded-3xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-6 shadow-xl">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedExercise.name}</h2>
                  <p className="text-xs text-slate-500 mt-1 font-semibold uppercase tracking-wider">
                    {selectedExercise.category}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedExercise(null)}
                  className="size-9 rounded-full bg-slate-900/5 dark:bg-white/5 flex items-center justify-center text-slate-500"
                  aria-label="Clear exercise selection"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              {selectedExercise.description && (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedExercise.description}
                </p>
              )}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Muscles</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selectedExercise.primary_muscles || []).map((muscle) => (
                    <span key={muscle} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                      {muscle}
                    </span>
                  ))}
                  {(selectedExercise.secondary_muscles || []).map((muscle) => (
                    <span key={muscle} className="px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/5 text-slate-500 text-xs font-bold uppercase">
                      {muscle}
                    </span>
                  ))}
                  {(!selectedExercise.primary_muscles || selectedExercise.primary_muscles.length === 0) &&
                    (!selectedExercise.secondary_muscles || selectedExercise.secondary_muscles.length === 0) && (
                      <span className="text-xs text-slate-400">No muscles specified.</span>
                    )}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Muscle Map</h3>
                <div className="mt-3">
                  <HumanMuscleMap
                    primaryMuscles={selectedExercise.primary_muscles}
                    secondaryMuscles={selectedExercise.secondary_muscles}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Instructions</h3>
                <ol className="mt-3 space-y-2 list-decimal list-inside text-sm text-slate-600 dark:text-slate-300">
                  {(selectedExercise.instructions || []).map((step, index) => (
                    <li key={`${selectedExercise.name}-step-${index}`}>{step}</li>
                  ))}
                  {(!selectedExercise.instructions || selectedExercise.instructions.length === 0) && (
                    <li className="list-none text-xs text-slate-400">No instructions provided.</li>
                  )}
                </ol>
              </div>
              {selectedExercise.video && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Video</h3>
                  <div className="mt-3 aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-border-dark">
                    <iframe
                      src={selectedExercise.video}
                      title={`${selectedExercise.name} video`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Explore;
