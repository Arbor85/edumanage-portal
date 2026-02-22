import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getTrainingPlans, deleteTrainingPlan, createTrainingPlan, TrainingPlan } from '../../../services/trainingPlanService';
import { getMentees } from '../../../services/menteesService';
import { useAuth } from '../../../contexts/AuthContext';
import { Mentee } from '../../../types';
import WorkoutActionBar from './components/WorkoutActionBar';

type PlanStats = {
  totalDays: number;
  totalExercises: number;
  totalSets: number;
};

const formatDate = (dateValue: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
};

const getPlanStats = (plan: TrainingPlan): PlanStats => {
  const entries = Object.values(plan.exercises_by_day || {});
  const totalExercises = entries.reduce((sum, list) => sum + list.length, 0);
  const totalSets = entries.reduce(
    (sum, list) => sum + list.reduce((inner, exercise) => inner + exercise.sets.length, 0),
    0
  );
  return {
    totalDays: plan.days_of_week.length,
    totalExercises,
    totalSets
  };
};

const SplitPlansList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const menteeIdParam = searchParams.get('mentee');
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startPlan, setStartPlan] = useState<TrainingPlan | null>(null);
  const [selectedStartDay, setSelectedStartDay] = useState('');
  const [planToDelete, setPlanToDelete] = useState<TrainingPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [planToClone, setPlanToClone] = useState<TrainingPlan | null>(null);
  const [cloneMenteeId, setCloneMenteeId] = useState<string>('');
  const [isCloning, setIsCloning] = useState(false);
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [filterMenteeName, setFilterMenteeName] = useState<string>('');
  const [clonedPlanName, setClonedPlanName] = useState<string>('');
  const [clonedPlanDescription, setClonedPlanDescription] = useState<string>('');

  const getMenteeName = (menteeId: string | undefined) => {
    if (!menteeId) return null;
    const mentee = mentees.find(m => m.id === menteeId);
    return mentee?.name || menteeId;
  };

  const fetchPlans = useCallback((signal?: AbortSignal) => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Pass only user ID - backend will filter plans where user is creator OR mentee
        const data = await getTrainingPlans(signal, undefined, user?.sub || undefined);
        setPlans(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError('Unable to load saved split plans.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [user?.sub]);

  useEffect(() => {
    const loadMentees = async () => {
      try {
        if (!user?.sub) {
          throw new Error('User not authenticated');
        }
        const data = await getMentees(user.sub);
        setMentees(data);
        if (menteeIdParam) {
          const mentee = data.find(m => m.id === menteeIdParam);
          if (mentee) {
            setFilterMenteeName(mentee.name);
          }
        }
      } catch (err) {
        console.error('Failed to load mentees:', err);
      }
    };
    loadMentees();
  }, [menteeIdParam, user?.sub]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPlans(controller.signal);
    return () => controller.abort();
  }, [fetchPlans]);

  const emptyState = !isLoading && !error && plans.length === 0;
  const planStats = useMemo(() => plans.map((plan) => getPlanStats(plan)), [plans]);

  const getPlanDays = (plan: TrainingPlan) => {
    if (plan.days_of_week?.length) return plan.days_of_week;
    return Object.keys(plan.exercises_by_day || {});
  };

  const resolveDefaultDay = (days: string[]) => {
    const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
    return days.includes(today) ? today : days[0] ?? today;
  };

  const openStartWorkout = (plan: TrainingPlan) => {
    const days = getPlanDays(plan);
    const defaultDay = resolveDefaultDay(days);
    if (days.length <= 1) {
      navigate('/active-workout', { state: { planId: plan.id, day: defaultDay, planName: plan.name } });
      return;
    }
    setStartPlan(plan);
    setSelectedStartDay(defaultDay);
  };

  const closeStartDialog = () => {
    setStartPlan(null);
    setSelectedStartDay('');
  };

  const confirmStartWorkout = () => {
    if (!startPlan || !selectedStartDay) return;
    navigate('/active-workout', {
      state: { planId: startPlan.id, day: selectedStartDay, planName: startPlan.name }
    });
    closeStartDialog();
  };

  const openDeleteDialog = (plan: TrainingPlan) => {
    setPlanToDelete(plan);
  };

  const closeDeleteDialog = () => {
    setPlanToDelete(null);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTrainingPlan(planToDelete.id);
      setPlans(plans.filter(p => p.id !== planToDelete.id));
      closeDeleteDialog();
    } catch (err) {
      setError('Failed to delete training plan.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openCloneDialog = (plan: TrainingPlan) => {
    setPlanToClone(plan);
    setCloneMenteeId('');
    setClonedPlanName(`${plan.name} (Copy)`);
    setClonedPlanDescription(plan.description || '');
  };

  const closeCloneDialog = () => {
    setPlanToClone(null);
    setCloneMenteeId('');
    setClonedPlanName('');
    setClonedPlanDescription('');
  };

  const confirmClonePlan = async () => {
    if (!planToClone) return;
    setIsCloning(true);
    try {
      const clonedPlan = await createTrainingPlan({
        name: clonedPlanName,
        description: clonedPlanDescription,
        template_id: planToClone.template_id,
        template_name: planToClone.template_name,
        days_of_week: planToClone.days_of_week,
        exercises_by_day: planToClone.exercises_by_day,
        creator_id: user?.sub || undefined,
        mentee_id: cloneMenteeId || null,
      });
      setPlans([clonedPlan, ...plans]);
      closeCloneDialog();
    } catch (err) {
      setError('Failed to clone training plan.');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="px-4 pt-6 pb-32 space-y-6 text-slate-900 dark:text-slate-100">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Split Plans</h1>
          <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
            Your saved training templates from the split planner.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchPlans()}
          disabled={isLoading}
          className="p-2 rounded-full bg-slate-900/5 dark:bg-white/5 disabled:opacity-60"
          aria-label="Refresh plans"
        >
          <span className="material-symbols-outlined text-primary">refresh</span>
        </button>
      </header>

      {menteeIdParam && filterMenteeName && (
        <div className="bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">filter_alt</span>
            <div>
              <p className="text-sm font-semibold text-primary">Filtered by Mentee</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Showing plans for {filterMenteeName}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/split-plans')}
            className="px-3 py-1 rounded bg-primary hover:bg-primary/90 text-white text-xs font-medium transition"
          >
            Clear Filter
          </button>
        </div>
      )}

      {isLoading && (
        <div className="text-xs font-semibold text-slate-400 px-1">Loading saved plans...</div>
      )}
      {!isLoading && error && (
        <div className="text-xs font-semibold text-red-500 px-1">{error}</div>
      )}
      {emptyState && (
        <div className="rounded-3xl border border-dashed border-slate-300/60 dark:border-white/10 p-8 text-center bg-white/40 dark:bg-white/5">
          <span className="material-symbols-outlined text-4xl text-slate-400">playlist_add</span>
          <h2 className="text-lg font-bold mt-3">No split plans yet</h2>
          <p className="text-sm text-slate-500 dark:text-white/60 mt-2">
            Build your first split plan in the planner and save it here.
          </p>
          
          <Link
          to={menteeIdParam ? `/split-plans/create?mentee=${menteeIdParam}` : '/split-plans/create'}
          className="inline-block mt-5 px-6 py-2 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest"
        >
          <span className="font-black tracking-widest uppercase text-xs">New Plan</span>
        </Link>
        </div>
      )}

      <div className="space-y-3">
        {plans.map((plan, index) => {
          const stats = planStats[index];
          const exercisesByDay = plan.exercises_by_day || {};

          return (
            <article
              key={plan.id}
              className="rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-4 shadow-md shadow-slate-900/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Template</p>
                  <h3 className="text-base font-bold mt-1">{plan.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-white/60 mt-0.5">{plan.template_name}</p>
                  {plan.mentee_id && (
                    <p className="text-[11px] text-primary font-semibold mt-1">Mentee: {getMenteeName(plan.mentee_id)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {stats.totalDays} days
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/split-plans/${plan.id}/edit`)}
                    className="p-2 rounded-full bg-slate-900/5 dark:bg-white/5 hover:bg-primary/10 transition-colors"
                    aria-label="Edit plan"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openCloneDialog(plan)}
                    className="p-2 rounded-full bg-slate-900/5 dark:bg-white/5 hover:bg-blue-500/10 transition-colors"
                    aria-label="Clone plan"
                  >
                    <span className="material-symbols-outlined text-sm text-blue-500">content_copy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteDialog(plan)}
                    className="p-2 rounded-full bg-slate-900/5 dark:bg-white/5 hover:bg-red-500/10 transition-colors"
                    aria-label="Delete plan"
                  >
                    <span className="material-symbols-outlined text-sm text-red-500">delete</span>
                  </button>
                </div>
              </div>

              {plan.description && (
                <p className="mt-3 text-xs text-slate-600 dark:text-white/70">{plan.description}</p>
              )}

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => openStartWorkout(plan)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  Start Workout
                </button>
              </div>

              <details className="group mt-3">
                <summary className="flex items-center justify-between cursor-pointer list-none pt-2 border-t border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-200">
                    <span>View Exercises</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {stats.totalExercises} exercises • {stats.totalSets} sets
                    </span>
                  </div>
                  <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-primary">expand_more</span>
                </summary>
                <div className="py-3 space-y-2">
                  {Object.keys(exercisesByDay).length === 0 && (
                    <p className="text-[11px] text-slate-500 dark:text-white/60">No exercises recorded.</p>
                  )}
                  {Object.entries(exercisesByDay).map(([day, exercises]: [string, any]) => (
                    <div key={`${plan.id}-${day}`} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-white/70">
                        <span className="uppercase tracking-widest">{day}</span>
                        <span>{exercises.length} exercises</span>
                      </div>
                      <div className="mt-2 space-y-1.5 text-[11px] text-slate-600 dark:text-white/70">
                        {exercises.map((exercise) => (
                          <div key={`${plan.id}-${day}-${exercise.name}`} className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 dark:text-white">{exercise.name}</span>
                            <span>{exercise.sets.length} sets</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>

            </article>
          );
        })}
      </div>

      {startPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={closeStartDialog}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Close dialog"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-6 shadow-2xl">
            <h3 className="text-lg font-bold">Select workout day</h3>
            <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
              Choose a day for {startPlan.name}.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {getPlanDays(startPlan).map(day => {
                const isSelected = selectedStartDay === day;
                return (
                  <button
                    key={`${startPlan.id}-${day}`}
                    type="button"
                    onClick={() => setSelectedStartDay(day)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                      isSelected
                        ? 'bg-primary text-white border-primary'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 border-slate-200 dark:border-border-dark'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeStartDialog}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-border-dark text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStartWorkout}
                disabled={!selectedStartDay}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                  selectedStartDay ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'
                }`}
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}

      {planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={closeDeleteDialog}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Close dialog"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-6 shadow-2xl">
            <h3 className="text-lg font-bold">Delete plan?</h3>
            <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
              Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-white">{planToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={isDeleting}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-border-dark text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/70 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePlan}
                disabled={isDeleting}
                className="px-4 py-2 rounded-full bg-red-500 text-white text-xs font-black uppercase tracking-widest disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {planToClone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={closeCloneDialog}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Close dialog"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-6 shadow-2xl">
            <h3 className="text-lg font-bold">Clone Plan</h3>
            <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
              Create a copy of <span className="font-semibold text-slate-700 dark:text-white">{planToClone.name}</span>.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Plan Name</label>
                <input
                  type="text"
                  value={clonedPlanName}
                  onChange={(e) => setClonedPlanName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-border-dark bg-transparent px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Plan name..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Description (Optional)</label>
                <textarea
                  value={clonedPlanDescription}
                  onChange={(e) => setClonedPlanDescription(e.target.value)}
                  placeholder="Add a description or notes."
                  rows={2}
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-border-dark bg-transparent px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Assign to Mentee (Optional)</label>
                <select
                  value={cloneMenteeId}
                  onChange={(e) => setCloneMenteeId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 dark:border-border-dark bg-transparent px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">None - Personal Plan</option>
                  {mentees.map((mentee) => (
                    <option key={mentee.id} value={mentee.id}>
                      {mentee.name} ({mentee.email_address})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeCloneDialog}
                disabled={isCloning}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-border-dark text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/70 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClonePlan}
                disabled={isCloning}
                className="px-4 py-2 rounded-full bg-blue-500 text-white text-xs font-black uppercase tracking-widest disabled:opacity-60"
              >
                {isCloning ? 'Cloning...' : 'Clone'}
              </button>
            </div>
          </div>
        </div>
      )}

      <WorkoutActionBar
        primaryAction={{
          label: 'New Plan',
          icon: 'add_circle',
          onClick: () => navigate(menteeIdParam ? `/split-plans/create?mentee=${menteeIdParam}` : '/split-plans/create')
        }}
      />
    </div>
  );
};

export default SplitPlansList;
