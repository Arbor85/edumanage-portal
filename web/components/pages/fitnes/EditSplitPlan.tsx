import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTrainingPlan, TrainingPlan, TrainingPlanCreate, updateTrainingPlan } from '../../../services/trainingPlanService';
import { getMentees } from '../../../services/menteesService';
import { Mentee } from '../../../types';
import WorkoutDaysList, { ExerciseEntry, WorkoutDay } from './WorkoutDaysList';

type SaveState = 'idle' | 'saving' | 'success' | 'error';

type PlanDraft = {
  plan: TrainingPlan | null;
  trainingDays: string[];
  exercisesByDay: Record<string, ExerciseEntry[]>;
  exerciseDrafts: Record<string, string>;
  trainingDayLabels: Record<string, string>;
};

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const buildDayLabels = (days: string[]) =>
  days.reduce<Record<string, string>>((acc, day) => {
    acc[day] = day;
    return acc;
  }, {});

const sanitizeExercises = (days: string[], data: Record<string, ExerciseEntry[]>) => {
  const result: TrainingPlanCreate['exercises_by_day'] = {};
  days.forEach((day) => {
    const exercises = data[day] || [];
    result[day] = exercises.map((exercise) => ({
      name: exercise.name,
      sets: exercise.sets.map((set) => ({
        type: set.type,
        weight: set.weight,
        reps: set.reps
      }))
    }));
  });
  return result;
};

const EditSplitPlan: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const planId = Number(id);
  const [draft, setDraft] = useState<PlanDraft>({
    plan: null,
    trainingDays: [],
    exercisesByDay: {},
    exerciseDrafts: {},
    trainingDayLabels: {}
  });
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [mentees, setMentees] = useState<Mentee[]>([]);

  const getMenteeName = (menteeId: string | undefined) => {
    if (!menteeId) return null;
    const mentee = mentees.find(m => m.id === menteeId);
    return mentee?.name || menteeId;
  };

  const fetchPlan = useCallback((signal?: AbortSignal) => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTrainingPlan(planId, signal);
        setPlanName(data.name);
        setPlanDescription(data.description || '');
        setDraft({
          plan: data,
          trainingDays: data.days_of_week,
          exercisesByDay: data.exercises_by_day || {},
          exerciseDrafts: {},
          trainingDayLabels: buildDayLabels(data.days_of_week)
        });
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError('Unable to load the training plan.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [planId]);

  useEffect(() => {
    if (!Number.isFinite(planId)) {
      setError('Invalid training plan id.');
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    fetchPlan(controller.signal);
    return () => controller.abort();
  }, [fetchPlan, planId]);

  useEffect(() => {
    setDraft((prev) => {
      const nextExercises: Record<string, ExerciseEntry[]> = {};
      const nextDrafts: Record<string, string> = {};
      const nextLabels: Record<string, string> = {};

      prev.trainingDays.forEach((day) => {
        nextExercises[day] = prev.exercisesByDay[day] ?? [];
        nextDrafts[day] = prev.exerciseDrafts[day] ?? '';
        nextLabels[day] = prev.trainingDayLabels[day] ?? day;
      });

      return {
        ...prev,
        exercisesByDay: nextExercises,
        exerciseDrafts: nextDrafts,
        trainingDayLabels: nextLabels
      };
    });
  }, [draft.trainingDays]);

  const workoutDayList: WorkoutDay[] = useMemo(
    () =>
      draft.trainingDays.map((day) => ({
        id: day,
        label: draft.trainingDayLabels[day] ?? day,
        exercises: draft.exercisesByDay[day] ?? [],
        draft: draft.exerciseDrafts[day] ?? ''
      })),
    [draft.exerciseDrafts, draft.exercisesByDay, draft.trainingDayLabels, draft.trainingDays]
  );

  const handleWorkoutDayListChanged = (next: WorkoutDay[]) => {
    setDraft((prev) => {
      const nextLabels: Record<string, string> = {};
      const nextExercises: Record<string, ExerciseEntry[]> = {};
      const nextDrafts: Record<string, string> = {};

      next.forEach((item) => {
        nextLabels[item.id] = item.label;
        nextExercises[item.id] = item.exercises;
        nextDrafts[item.id] = item.draft;
      });

      return {
        ...prev,
        trainingDayLabels: nextLabels,
        exercisesByDay: nextExercises,
        exerciseDrafts: nextDrafts
      };
    });
  };

  const toggleTrainingDay = (day: string) => {
    setDraft((prev) => {
      const nextDays = prev.trainingDays.includes(day)
        ? prev.trainingDays.filter((item) => item !== day)
        : [...prev.trainingDays, day];

      return {
        ...prev,
        trainingDays: nextDays
      };
    });
  };

  const handleSave = async () => {
    if (!draft.plan) return;
    setSaveState('saving');
    setError(null);
    try {
      const payload: TrainingPlanCreate = {
        name: planName,
        description: planDescription,
        template_id: draft.plan.template_id,
        template_name: draft.plan.template_name,
        days_of_week: draft.trainingDays,
        exercises_by_day: sanitizeExercises(draft.trainingDays, draft.exercisesByDay),
        mentee_id: draft.plan.mentee_id || undefined
      };
      const updated = await updateTrainingPlan(draft.plan.id, payload);
      setDraft((prev) => ({
        ...prev,
        plan: updated
      }));
      setSaveState('success');
      setTimeout(() => setSaveState('idle'), 1200);
    } catch (err) {
      setSaveState('error');
      setError('Unable to save changes.');
    }
  };

  const saveLabel = saveState === 'saving'
    ? 'Saving...'
    : saveState === 'success'
    ? 'Saved'
    : 'Save Changes';

  return (
    <div className="px-4 pt-6 pb-32 space-y-6 text-slate-900 dark:text-slate-100">
      <button
        type="button"
        onClick={() => navigate('/split-plans')}
        className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        <span>Back to Plans</span>
      </button>
      <header className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Edit Plan</p>
          {draft.plan?.template_name && (
            <p className="text-xs text-slate-500 dark:text-white/60 mt-2">Template: {draft.plan.template_name}</p>
          )}
        </div>
        <div className="space-y-3 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark p-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Plan Name</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-border-dark bg-transparent px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Plan name..."
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Description</label>
            <textarea
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              placeholder="Add a description or notes for this plan."
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200 dark:border-border-dark bg-transparent px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          {draft.plan?.mentee_id && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Assigned to Mentee</label>
              <div className="mt-2 w-full rounded-xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm font-semibold">
                {getMenteeName(draft.plan.mentee_id)}
              </div>
            </div>
          )}
        </div>
      </header>

      {isLoading && (
        <div className="text-xs font-semibold text-slate-400">Loading plan...</div>
      )}
      {!isLoading && error && (
        <div className="text-xs font-semibold text-red-500">{error}</div>
      )}

      {!isLoading && !error && (
        <>
          <section className="rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Working Days</label>
              <span className="text-xs font-bold text-primary">{draft.trainingDays.length} selected</span>
            </div>
            <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto no-scrollbar">
              {daysOfWeek.map((day) => {
                const isSelected = draft.trainingDays.includes(day);
                const baseClass = 'flex-none rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest border transition-all';
                const selectedClass = 'bg-primary text-white border-primary';
                const idleClass = 'bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark text-slate-500 dark:text-white/70';
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleTrainingDay(day)}
                    className={`${baseClass} ${isSelected ? selectedClass : idleClass}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {draft.trainingDays.length === 0 && (
              <p className="mt-2 text-[10px] font-semibold text-red-500">Select at least one day.</p>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Exercises & Sets</h2>
              <span className="text-xs font-bold text-primary">{draft.trainingDays.length} days</span>
            </div>
            {draft.trainingDays.length > 0 ? (
              <WorkoutDaysList
                workoutDayList={workoutDayList}
                onWorkoutDayListChanged={handleWorkoutDayListChanged}
              />
            ) : (
              <div className="text-xs text-slate-500 dark:text-white/60">
                Select working days to add exercises.
              </div>
            )}
          </section>
        </>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between gap-3 z-40">
        <button
          type="button"
          onClick={() => navigate('/split-plans')}
          className="px-4 py-2 rounded-full border border-slate-200 dark:border-border-dark text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === 'saving' || draft.trainingDays.length === 0}
          className="px-6 py-2 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest disabled:opacity-60 transition-all active:scale-95"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
};

export default EditSplitPlan;
