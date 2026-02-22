import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getTrainingPlan, getTrainingPlans, TrainingPlan } from '../../../services/trainingPlanService';
import { createWorkoutHistory, WorkoutSet as HistoryWorkoutSet } from '../../../services/workoutHistoryService';
import { useAuth } from '../../../contexts/AuthContext';
import WorkoutActionBar from './components/WorkoutActionBar';

type WorkoutSet = {
  id: string;
  prev: string;
  weight: number;
  reps: number;
  done: boolean;
};

type LocationState = {
  planId?: number;
  day?: string;
  planName?: string;
};

type WorkoutStateSnapshot = {
  mode: 'empty' | 'plan';
  timer: number;
  sets: WorkoutSet[];
  exerciseIndex: number;
  selectedPlan: TrainingPlan | null;
  selectedDay: string;
  doneByExercise: boolean[][];
  sessionStart: string; // ISO string
};

const STORAGE_KEYS = {
  mode: 'activeWorkout.mode',
  planId: 'activeWorkout.planId',
  planDay: 'activeWorkout.planDay',
  planName: 'activeWorkout.planName',
  state: 'activeWorkout.state'
} as const;

const ActiveWorkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [timer, setTimer] = useState(0);
  const [tip, setTip] = useState('Focus on controlled movement.');
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [mode, setMode] = useState<'empty' | 'plan' | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState('');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [doneByExercise, setDoneByExercise] = useState<boolean[][]>([]);
  const [planOptions, setPlanOptions] = useState<TrainingPlan[]>([]);
  const [planOptionsLoading, setPlanOptionsLoading] = useState(false);
  const [planOptionsError, setPlanOptionsError] = useState<string | null>(null);
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedPlanDay, setSelectedPlanDay] = useState('');
  const [lastMode, setLastMode] = useState<'empty' | 'plan' | null>(null);
  const [lastPlanName, setLastPlanName] = useState<string | null>(null);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasExistingWorkout, setHasExistingWorkout] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

  // Save workout state to localStorage
  const saveWorkoutState = () => {
    if (typeof window === 'undefined' || !isStarted || !sessionStart) return;

    const state: WorkoutStateSnapshot = {
      mode: mode as 'empty' | 'plan',
      timer,
      sets,
      exerciseIndex,
      selectedPlan,
      selectedDay,
      doneByExercise,
      sessionStart: sessionStart.toISOString()
    };

    window.localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(state));
  };

  // Load workout state from localStorage
  const loadWorkoutState = (): WorkoutStateSnapshot | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.state);
      if (!stored) return null;

      const state: WorkoutStateSnapshot = JSON.parse(stored);
      return state;
    } catch (error) {
      console.error('Failed to load workout state:', error);
      return null;
    }
  };

  // Clear saved workout state
  const clearWorkoutState = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEYS.state);
  };

  // Check for existing workout on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const existingState = loadWorkoutState();
    if (existingState) {
      setHasExistingWorkout(true);
    }
  }, []);

  // Auto-save workout state whenever key state changes
  useEffect(() => {
    saveWorkoutState();
  }, [isStarted, timer, sets, exerciseIndex, selectedDay, doneByExercise]);

  useEffect(() => {
    if (!isStarted) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isStarted]);

  useEffect(() => {
    if (!isStarted) return;
    const tips = [
      'Drive your feet into the floor for full-body stability.',
      'Keep your wrists stacked over your elbows on the press.',
      'Lower the bar with control to the mid-chest.',
      'Squeeze your shoulder blades to protect your shoulders.'
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setTip(randomTip);
  }, [isStarted]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedMode = window.localStorage.getItem(STORAGE_KEYS.mode) as 'empty' | 'plan' | null;
    const storedName = window.localStorage.getItem(STORAGE_KEYS.planName);
    setLastMode(storedMode ?? null);
    setLastPlanName(storedName);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const toggleSet = (setIndex: number) => {
    setSets(prev => prev.map((s, idx) => (idx === setIndex ? { ...s, done: !s.done } : s)));
    if (mode !== 'plan') return;
    setDoneByExercise(prev => {
      if (!prev[exerciseIndex]) return prev;
      const next = prev.map(list => [...list]);
      next[exerciseIndex][setIndex] = !next[exerciseIndex][setIndex];
      return next;
    });
  };

  const updateSetValue = (setIndex: number, field: 'weight' | 'reps', value: number) => {
    setSets(prev => prev.map((s, idx) => (idx === setIndex ? { ...s, [field]: value } : s)));
    if (mode !== 'plan' || !selectedPlan || !selectedDay) return;

    setSelectedPlan(prevPlan => {
      if (!prevPlan) return prevPlan;
      const exercisesByDay = { ...prevPlan.exercises_by_day };
      const dayExercises = [...(exercisesByDay[selectedDay] ?? [])];
      const exercise = dayExercises[exerciseIndex];
      if (!exercise) return prevPlan;
      const nextSets = [...exercise.sets];
      const targetSet = nextSets[setIndex];
      if (!targetSet) return prevPlan;
      nextSets[setIndex] = {
        ...targetSet,
        [field]: String(value)
      };
      dayExercises[exerciseIndex] = {
        ...exercise,
        sets: nextSets
      };
      exercisesByDay[selectedDay] = dayExercises;
      return { ...prevPlan, exercises_by_day: exercisesByDay };
    });
  };

  const getSetTypeLabel = (setIndex: number) => {
    if (mode !== 'plan' || !selectedPlan || !selectedDay) return 'custom';
    const dayExercises = selectedPlan.exercises_by_day?.[selectedDay] ?? [];
    const exercise = dayExercises[exerciseIndex];
    const setType = exercise?.sets?.[setIndex]?.type ?? 'normal';
    return setType.replace('_', ' ');
  };

  const getSetTypeStyles = (setIndex: number) => {
    if (mode !== 'plan' || !selectedPlan || !selectedDay) {
      return {
        badge: 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-white/70',
        label: 'text-slate-400 dark:text-white/30'
      };
    }

    const dayExercises = selectedPlan.exercises_by_day?.[selectedDay] ?? [];
    const exercise = dayExercises[exerciseIndex];
    const setType = exercise?.sets?.[setIndex]?.type ?? 'normal';

    switch (setType) {
      case 'warmup':
        return {
          badge: 'bg-amber-500 text-white',
          label: 'text-amber-500'
        };
      case 'failure':
        return {
          badge: 'bg-rose-500 text-white',
          label: 'text-rose-500'
        };
      case 'drop_set':
        return {
          badge: 'bg-violet-500 text-white',
          label: 'text-violet-500'
        };
      case 'normal':
      default:
        return {
          badge: 'bg-primary text-white',
          label: 'text-primary'
        };
    }
  };

  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];
    const nextWeight = lastSet?.weight ?? 0;
    const nextReps = lastSet?.reps ?? 0;
    const prev = nextWeight || nextReps ? `${nextWeight || '-'} x ${nextReps || '-'}` : '-';
    const nextSet: WorkoutSet = {
      id: String(sets.length + 1),
      prev,
      weight: nextWeight,
      reps: nextReps,
      done: false
    };

    setSets(prev => [...prev, nextSet]);

    if (mode !== 'plan' || !selectedPlan || !selectedDay) return;

    setSelectedPlan(prevPlan => {
      if (!prevPlan) return prevPlan;
      const exercisesByDay = { ...prevPlan.exercises_by_day };
      const dayExercises = [...(exercisesByDay[selectedDay] ?? [])];
      const exercise = dayExercises[exerciseIndex];
      if (!exercise) return prevPlan;
      const lastPlanSet = exercise.sets[exercise.sets.length - 1];
      const newPlanSet = {
        type: lastPlanSet?.type ?? 'normal',
        weight: String(nextWeight),
        reps: String(nextReps)
      };
      dayExercises[exerciseIndex] = {
        ...exercise,
        sets: [...exercise.sets, newPlanSet]
      };
      exercisesByDay[selectedDay] = dayExercises;
      return { ...prevPlan, exercises_by_day: exercisesByDay };
    });

    setDoneByExercise(prev => {
      if (!prev[exerciseIndex]) return prev;
      const next = prev.map(list => [...list]);
      next[exerciseIndex].push(false);
      return next;
    });
  };

  const resolveDefaultDay = (plan: TrainingPlan) => {
    const days = plan.days_of_week?.length ? plan.days_of_week : Object.keys(plan.exercises_by_day || {});
    const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
    return days.includes(today) ? today : days[0] ?? today;
  };

  const buildSets = (planSets: { weight: string; reps: string }[], doneFlags: boolean[] = []) =>
    planSets.map((set, idx) => {
      const weight = Number(set.weight) || 0;
      const reps = Number(set.reps) || 0;
      const prev = weight || reps ? `${weight || '-'} x ${reps || '-'}` : '-';
      return { id: String(idx + 1), prev, weight, reps, done: doneFlags[idx] ?? false };
    });

  const createEmptySets = () => [
    { id: '1', prev: '-', weight: 0, reps: 0, done: false }
  ];

  const applyPlanDay = (plan: TrainingPlan, day: string) => {
    const dayExercises = plan.exercises_by_day?.[day] ?? [];
    setSelectedPlan(plan);
    setSelectedDay(day);
    setExerciseIndex(0);
    const initialDone = dayExercises.map(exercise => exercise.sets.map(() => false));
    setDoneByExercise(initialDone);
    if (dayExercises.length === 0) {
      setSets(createEmptySets());
      return;
    }
    setSets(buildSets(dayExercises[0].sets, initialDone[0] ?? []));
  };

  const persistMode = (nextMode: 'empty' | 'plan', plan?: TrainingPlan, day?: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.mode, nextMode);
    if (nextMode === 'plan' && plan) {
      window.localStorage.setItem(STORAGE_KEYS.planId, String(plan.id));
      window.localStorage.setItem(STORAGE_KEYS.planDay, day ?? '');
      window.localStorage.setItem(STORAGE_KEYS.planName, plan.name ?? '');
      setLastPlanName(plan.name ?? null);
      setLastMode('plan');
      return;
    }
    window.localStorage.removeItem(STORAGE_KEYS.planId);
    window.localStorage.removeItem(STORAGE_KEYS.planDay);
    window.localStorage.removeItem(STORAGE_KEYS.planName);
    setLastMode('empty');
    setLastPlanName(null);
  };

  const resumeExistingWorkout = () => {
    const existingState = loadWorkoutState();
    if (!existingState) return;

    try {
      // Restore all state
      setMode(existingState.mode);
      setTimer(existingState.timer);
      setSets(existingState.sets);
      setExerciseIndex(existingState.exerciseIndex);
      setSelectedPlan(existingState.selectedPlan);
      setSelectedDay(existingState.selectedDay);
      setDoneByExercise(existingState.doneByExercise);
      setSessionStart(new Date(existingState.sessionStart));
      setIsStarted(true);
      setHasExistingWorkout(false);
    } catch (error) {
      console.error('Failed to resume workout:', error);
      setSaveError('Failed to resume workout');
      clearWorkoutState();
      setHasExistingWorkout(false);
    }
  };

  const startEmptyWorkout = () => {
    setIsStarted(true);
    setMode('empty');
    setSelectedPlan(null);
    setSelectedDay('');
    setExerciseIndex(0);
    setDoneByExercise([]);
    setSets(createEmptySets());
    setTimer(0);
    const now = new Date();
    setSessionStart(now);
    setSaveError(null);
    persistMode('empty');

    // Save initial state
    const initialState: WorkoutStateSnapshot = {
      mode: 'empty',
      timer: 0,
      sets: createEmptySets(),
      exerciseIndex: 0,
      selectedPlan: null,
      selectedDay: '',
      doneByExercise: [],
      sessionStart: now.toISOString()
    };
    saveWorkoutState();
  };

  const startPlanWorkout = async (planId: number, dayOverride?: string) => {
    const plan = await getTrainingPlan(planId);
    const day = dayOverride || resolveDefaultDay(plan);
    const now = new Date();

    setIsStarted(true);
    setMode('plan');
    applyPlanDay(plan, day);
    setTimer(0);
    setSessionStart(now);
    setSaveError(null);
    persistMode('plan', plan, day);

    // Save initial state after plan is loaded
    const dayExercises = plan.exercises_by_day?.[day] ?? [];
    const initialSets = dayExercises.length > 0
      ? buildSets(dayExercises[0].sets, [])
      : createEmptySets();
    const initialDone = dayExercises.map(exercise => exercise.sets.map(() => false));

    const initialState: WorkoutStateSnapshot = {
      mode: 'plan',
      timer: 0,
      sets: initialSets,
      exerciseIndex: 0,
      selectedPlan: plan,
      selectedDay: day,
      doneByExercise: initialDone,
      sessionStart: now.toISOString()
    };
    // Note: saveWorkoutState() will be called by useEffect auto-save
  };

  const openPlanDialog = () => {
    setIsSelectDialogOpen(true);
  };

  const closePlanDialog = () => {
    setIsSelectDialogOpen(false);
    setSelectedPlanId(null);
    setSelectedPlanDay('');
  };

  const confirmPlanDialog = async () => {
    if (!selectedPlanId || !selectedPlanDay) return;
    await startPlanWorkout(selectedPlanId, selectedPlanDay);
    closePlanDialog();
  };

  useEffect(() => {
    if (!isSelectDialogOpen) return;
    const controller = new AbortController();
    const loadPlans = async () => {
      setPlanOptionsLoading(true);
      setPlanOptionsError(null);
      try {
        const data = await getTrainingPlans(controller.signal, undefined, user?.sub || undefined);
        setPlanOptions(data);
      } catch {
        setPlanOptionsError('Unable to load plans.');
      } finally {
        setPlanOptionsLoading(false);
      }
    };
    void loadPlans();
    return () => controller.abort();
  }, [isSelectDialogOpen, user?.sub]);

  useEffect(() => {
    if (!isSelectDialogOpen || planOptions.length === 0) return;
    const storedPlanId = Number(window.localStorage.getItem(STORAGE_KEYS.planId)) || null;
    const storedDay = window.localStorage.getItem(STORAGE_KEYS.planDay) || '';
    const initialPlanId = storedPlanId && planOptions.some(plan => plan.id === storedPlanId)
      ? storedPlanId
      : planOptions[0].id;
    const plan = planOptions.find(item => item.id === initialPlanId) ?? planOptions[0];
    const day = storedDay && plan.days_of_week.includes(storedDay) ? storedDay : resolveDefaultDay(plan);
    setSelectedPlanId(initialPlanId);
    setSelectedPlanDay(day);
  }, [isSelectDialogOpen, planOptions]);

  useEffect(() => {
    const state = location.state as LocationState | undefined;
    if (state?.planId) {
      void startPlanWorkout(state.planId, state.day);
      return;
    }
    setIsStarted(false);
  }, [location.state]);

  const dayExercises = useMemo(() => {
    if (!selectedPlan || !selectedDay) return [];
    return selectedPlan.exercises_by_day?.[selectedDay] ?? [];
  }, [selectedPlan, selectedDay]);

  const currentExercise = useMemo(() => {
    return dayExercises[exerciseIndex] ?? null;
  }, [dayExercises, exerciseIndex]);

  const firstNotDoneIndex = useMemo(
    () => sets.findIndex(set => !set.done),
    [sets]
  );

  const totalExercises = dayExercises.length;
  const checkedSets = useMemo(() => sets.filter(set => set.done).length, [sets]);
  const totalSetsInDay = useMemo(() => (
    mode === 'plan'
      ? dayExercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)
      : sets.length
  ), [mode, dayExercises, sets.length]);
  const doneSetsInDay = useMemo(() => (
    mode === 'plan'
      ? doneByExercise.reduce((sum, list) => sum + list.filter(Boolean).length, 0)
      : checkedSets
  ), [mode, doneByExercise, checkedSets]);
  const progressPercent = totalSetsInDay > 0
    ? Math.round((doneSetsInDay / totalSetsInDay) * 100)
    : 0;

  useEffect(() => {
    if (mode !== 'plan' || !selectedPlan || !selectedDay) return;
    if (totalExercises === 0) {
      setSets(createEmptySets());
      return;
    }
    const exercise = dayExercises[Math.min(exerciseIndex, totalExercises - 1)];
    if (!exercise) return;
    const doneFlags = doneByExercise[exerciseIndex] ?? [];
    setSets(buildSets(exercise.sets, doneFlags));
  }, [mode, selectedPlan, selectedDay, exerciseIndex, totalExercises, dayExercises, doneByExercise]);

  const goToExercise = (nextIndex: number) => {
    if (totalExercises === 0) return;
    const bounded = Math.min(Math.max(nextIndex, 0), totalExercises - 1);
    setExerciseIndex(bounded);
  };

  const allSetsDone = useMemo(() => {
    if (mode === 'plan') {
      return doneByExercise.length > 0 && doneByExercise.every(list => list.every(Boolean));
    }
    return sets.length > 0 ? sets.every(set => set.done) : true;
  }, [mode, doneByExercise, sets]);

  const buildHistorySets = (): HistoryWorkoutSet[] => {
    if (mode === 'plan' && selectedPlan && selectedDay) {
      return (selectedPlan.exercises_by_day?.[selectedDay] ?? []).flatMap((exercise, exerciseIdx) =>
        exercise.sets
          .map((set, setIdx) => ({
            exercise_title: exercise.name,
            superset_id: null,
            exercise_notes: null,
            set_index: setIdx + 1,
            set_type: set.type,
            weight_kg: Number(set.weight) || null,
            reps: Number(set.reps) || null,
            isDone: doneByExercise[exerciseIdx]?.[setIdx] ?? false
          }))
          .filter(set => set.isDone)
          .map(({ isDone, ...set }, newIdx) => ({ ...set, set_index: newIdx + 1 }))
      );
    }

    return sets
      .filter(set => set.done)
      .map((set, setIdx) => ({
        exercise_title: currentExercise?.name || 'Custom Exercise',
        superset_id: null,
        exercise_notes: null,
        set_index: setIdx + 1,
        set_type: 'normal',
        weight_kg: set.weight || null,
        reps: set.reps || null
      }));
  };

  const handleFinishSession = async () => {
    if (!allSetsDone) {
      setShowFinishConfirm(true);
      return;
    }
    await saveAndFinishWorkout();
  };

  const saveAndFinishWorkout = async () => {
    try {
      setIsSavingSession(true);
      setSaveError(null);
      const startTime = sessionStart ?? new Date();
      const endTime = new Date();
      const historySets = buildHistorySets();
      const volume = historySets.reduce((sum, item) => {
        if (item.weight_kg && item.reps) {
          return sum + item.weight_kg * item.reps;
        }
        return sum;
      }, 0);

      await createWorkoutHistory({
        title: mode === 'plan' ? selectedPlan?.name || 'Workout' : 'Empty Workout',
        workout_date: startTime.toISOString().split('T')[0],
        duration_minutes: Math.max(0, Math.round(timer / 60)),
        volume_kg: volume,
        sets: historySets.length,
        workout_sets: historySets,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      });

      // Clear the saved workout state after successful save
      clearWorkoutState();
      navigate('/history');
    } catch (error) {
      setSaveError('Unable to save workout session.');
    } finally {
      setIsSavingSession(false);
      setShowFinishConfirm(false);
    }
  };

  const handleAbandonWorkout = () => {
    clearWorkoutState();
    setIsStarted(false);
    setMode(null);
    setTimer(0);
    setSets([]);
    setExerciseIndex(0);
    setSelectedPlan(null);
    setSelectedDay('');
    setDoneByExercise([]);
    setSessionStart(null);
    setSaveError(null);
    setShowAbandonConfirm(false);
  };

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-200 dark:border-border-dark p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-10 items-center justify-center rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-border-dark">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              {currentExercise?.name || (mode === 'empty' ? 'Empty Workout' : selectedPlan?.name || 'Active Workout')}
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-white/50 uppercase tracking-[0.2em] font-bold">
              {mode === 'plan' && selectedDay ? `${selectedPlan?.name ?? 'Plan'} • ${selectedDay}` : 'Custom session'}
            </p>
          </div>
        </div>
        {isStarted && (
          <button
            onClick={() => setShowAbandonConfirm(true)}
            className="size-10 rounded-full bg-red-500/10 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </header>

      {!isStarted && (
        <div className="flex-1 flex items-center justify-center px-4 pb-16">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-6 shadow-2xl space-y-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Start a session</p>
              <h2 className="text-2xl font-bold mt-2">Choose your workout</h2>
              <p className="text-xs text-slate-500 dark:text-white/60 mt-2">
                Start an empty workout or pick a saved split plan.
              </p>
            </div>
            <div className="space-y-3">
              {hasExistingWorkout && (
                <button
                  type="button"
                  onClick={resumeExistingWorkout}
                  disabled={isLoadingExisting}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-amber-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-transform disabled:opacity-60"
                >
                  <span className="material-symbols-outlined">resume</span>
                  {isLoadingExisting ? 'Resuming...' : 'Continue Workout'}
                </button>
              )}
              <button
                type="button"
                onClick={startEmptyWorkout}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">fitness_center</span>
                Start Empty Workout
              </button>
              <button
                type="button"
                onClick={openPlanDialog}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-slate-200 dark:border-border-dark text-slate-600 dark:text-white/70 font-black uppercase tracking-[0.2em] text-xs"
              >
                <span className="material-symbols-outlined">playlist_play</span>
                Select Existing Workout
              </button>
            </div>
            {lastMode && (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 px-4 py-3 text-[11px] font-semibold text-slate-500 dark:text-white/60">
                Last used: {lastMode === 'empty' ? 'Empty workout' : lastPlanName || 'Saved plan'}
              </div>
            )}
          </div>
        </div>
      )}

      {isStarted && (
        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-surface-dark p-4 rounded-3xl border border-slate-200 dark:border-border-dark flex flex-col items-center shadow-2xl">
            <span className="text-[10px] text-slate-500 dark:text-white/40 font-bold mb-1 uppercase tracking-widest">Workout Time</span>
            <p className="text-3xl font-black text-primary tabular-nums">{formatTime(timer)}</p>
          </div>
          <div className="bg-white dark:bg-surface-dark p-4 rounded-3xl border border-slate-200 dark:border-border-dark flex flex-col items-center shadow-2xl">
            <span className="text-[10px] text-slate-500 dark:text-white/40 font-bold mb-1 uppercase tracking-widest">Rest Timer</span>
            <p className="text-3xl font-black text-slate-300 dark:text-white/20 tabular-nums">00:00</p>
          </div>
        </div>
      )}

      {isStarted && (
        <div className="px-4 pb-8">
          <div className="flex justify-between items-end mb-3">
            <p className="text-xs font-bold text-slate-700 dark:text-white/80">
              {mode === 'plan' && selectedPlan
                ? `Exercise ${Math.min(exerciseIndex + 1, totalExercises)} of ${totalExercises}`
                : 'Exercise 1 of 1'}
            </p>
            <p className="text-xs font-black text-primary uppercase tracking-wider">
              {mode === 'plan' ? 'In Progress' : 'Custom'}
            </p>
          </div>
          <div className="h-3 w-full bg-slate-200 dark:bg-white/5 rounded-full p-[2px] overflow-hidden border border-slate-200 dark:border-border-dark">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full shadow-[0_0_15px_rgba(19,91,236,0.3)]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          {mode === 'plan' && (
            <div className="mt-4 rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Exercise</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentExercise?.name || 'Exercise'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToExercise(exerciseIndex - 1)}
                    disabled={exerciseIndex <= 0}
                    className="px-3 py-2 rounded-full border border-slate-200 dark:border-border-dark text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/70 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => goToExercise(exerciseIndex + 1)}
                    disabled={exerciseIndex >= totalExercises - 1}
                    className="px-3 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isStarted && (
        <div className="px-4 grid grid-cols-12 gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-white/30 mb-3 text-center">
          <div className="col-span-2">Set</div>
          <div className="col-span-3 text-left">Previous</div>
          <div className="col-span-3">Weight</div>
          <div className="col-span-2">Reps</div>
          <div className="col-span-2">Done</div>
        </div>
      )}

      {isStarted && (
        <div className="flex flex-col gap-3 px-4">
          {sets.map((set, idx) => (
            <div
              key={set.id}
              className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl border transition-all ${set.done
                ? 'bg-slate-900/5 dark:bg-white/[0.03] border-slate-200 dark:border-border-dark opacity-60'
                : idx === firstNotDoneIndex && firstNotDoneIndex !== -1
                  ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/40 shadow-xl'
                  : 'bg-slate-900/5 dark:bg-white/[0.02] border-transparent opacity-40'
                }`}
            >
              <div className="col-span-2 flex justify-center">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-black ${set.done ? 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/60' : getSetTypeStyles(idx).badge}`}>
                  {getSetTypeLabel(idx).slice(0, 1).toUpperCase()}
                </span>
              </div>
              <div className="col-span-3 text-[11px] text-slate-500 dark:text-white/40 font-medium">
                <div>{set.prev}</div>
                <div className={`mt-1 text-[9px] font-bold uppercase tracking-[0.2em] ${getSetTypeStyles(idx).label}`}>
                  {getSetTypeLabel(idx)}
                </div>
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  value={Number.isFinite(set.weight) ? set.weight : 0}
                  onChange={(event) => {
                    const nextValue = event.target.value === '' ? 0 : Number(event.target.value);
                    updateSetValue(idx, 'weight', Number.isFinite(nextValue) ? nextValue : 0);
                  }}
                  className="w-full h-11 bg-slate-900/10 dark:bg-black/40 border-none rounded-xl text-center font-black text-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={Number.isFinite(set.reps) ? set.reps : 0}
                  onChange={(event) => {
                    const nextValue = event.target.value === '' ? 0 : Number(event.target.value);
                    updateSetValue(idx, 'reps', Number.isFinite(nextValue) ? nextValue : 0);
                  }}
                  className="w-full h-11 bg-slate-900/10 dark:bg-black/40 border-none rounded-xl text-center font-black text-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="col-span-2 flex justify-center">
                <button
                  onClick={() => toggleSet(idx)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${set.done ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-white/30'}`}
                >
                  <span className="material-symbols-outlined font-black">check_circle</span>
                </button>
              </div>
            </div>
          ))}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleAddSet}
                className="flex-1 py-3 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Add Set
              </button>
              
              {checkedSets === sets.length && sets.length > 0 && mode === 'plan' && exerciseIndex < totalExercises - 1 && (
                <button
                  type="button"
                  onClick={() => goToExercise(exerciseIndex + 1)}
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_forward</span>
                  Next Exercise
                </button>
              )}
              
              {checkedSets === sets.length && sets.length > 0 && mode === 'plan' && exerciseIndex === totalExercises - 1 && (
                <button
                  type="button"
                  onClick={handleFinishSession}
                  disabled={isSavingSession}
                  className="flex-1 py-3 rounded-2xl bg-violet-500 hover:bg-violet-600 disabled:opacity-60 text-white font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">flag</span>
                  {isSavingSession ? 'Saving...' : 'Finish Session'}
                </button>
              )}
              
              {checkedSets === sets.length && sets.length > 0 && mode === 'empty' && (
                <button
                  type="button"
                  onClick={handleFinishSession}
                  disabled={isSavingSession}
                  className="flex-1 py-3 rounded-2xl bg-violet-500 hover:bg-violet-600 disabled:opacity-60 text-white font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">flag</span>
                  {isSavingSession ? 'Saving...' : 'Finish Session'}
                </button>
              )}
            </div>
        </div>
      )}

      {isStarted && (
        <div className="p-4 mt-8">
          <div className="bg-primary/5 rounded-3xl p-5 border border-primary/10 flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
            </div>
            <div>
              <strong className="text-primary uppercase tracking-wider block mb-1 text-[10px]">AI Pro Tip</strong>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-white/70 italic">"{tip}"</p>
            </div>
          </div>
        </div>
      )}

      {isStarted && (
        <WorkoutActionBar
          primaryAction={{
            label: isSavingSession ? 'Saving' : 'Finish Session',
            icon: 'sports_score',
            onClick: handleFinishSession,
            isLoading: isSavingSession,
            disabled: isSavingSession
          }}
          secondaryActions={[
            {
              label: 'Abandon',
              onClick: () => setShowAbandonConfirm(true)
            }
          ]}
        />
      )}

      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={() => setShowFinishConfirm(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Close dialog"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Finish session early?</h3>
                <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
                  Not all sets are marked as done. Do you want to finish anyway?
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-border-dark text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/70"
              >
                Keep Going
              </button>
              <button
                type="button"
                onClick={saveAndFinishWorkout}
                disabled={isSavingSession}
                className="px-4 py-2 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest disabled:opacity-60"
              >
                {isSavingSession ? 'Saving...' : 'Finish Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSelectDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={closePlanDialog}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Close dialog"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-6 shadow-2xl">
            <h3 className="text-lg font-bold">Select a workout</h3>
            <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
              Pick a saved plan and day to start your session.
            </p>
            <div className="mt-4 space-y-3">
              {planOptionsLoading && (
                <p className="text-xs font-semibold text-slate-400">Loading plans...</p>
              )}
              {!planOptionsLoading && planOptionsError && (
                <p className="text-xs font-semibold text-red-500">{planOptionsError}</p>
              )}
              {!planOptionsLoading && !planOptionsError && (
                <div className="grid gap-2">
                  {planOptions.map(plan => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        setSelectedPlanDay(resolveDefaultDay(plan));
                      }}
                      className={`w-full text-left rounded-xl border px-3 py-3 transition-colors ${selectedPlanId === plan.id
                        ? 'border-primary bg-primary/10'
                        : 'border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-white/5'
                        }`}
                    >
                      <p className="text-sm font-bold">{plan.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-white/60">{plan.template_name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedPlanId && (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Workout day</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(() => {
                    const plan = planOptions.find(item => item.id === selectedPlanId);
                    if (!plan) return null;
                    const days = plan.days_of_week?.length ? plan.days_of_week : Object.keys(plan.exercises_by_day || {});
                    return days.map(day => {
                      const isSelected = selectedPlanDay === day;
                      return (
                        <button
                          key={`${selectedPlanId}-${day}`}
                          type="button"
                          onClick={() => setSelectedPlanDay(day)}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${isSelected
                            ? 'bg-primary text-white border-primary'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/70 border-slate-200 dark:border-border-dark'
                            }`}
                        >
                          {day}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closePlanDialog}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-border-dark text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPlanDialog}
                disabled={!selectedPlanId || !selectedPlanDay}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${selectedPlanId && selectedPlanDay ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'
                  }`}
              >
                Start Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abandon Workout Confirmation Dialog */}
      {showAbandonConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-surface-dark rounded-3xl border border-slate-200 dark:border-border-dark shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Abandon Workout?</h3>
                <p className="text-xs text-slate-500 dark:text-white/60 mt-1">This will discard your current progress and cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowAbandonConfirm(false)}
                className="flex-1 px-4 py-3 rounded-full border border-slate-200 dark:border-border-dark text-slate-600 dark:text-white/70 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Keep Going
              </button>
              <button
                type="button"
                onClick={handleAbandonWorkout}
                className="flex-1 px-4 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
              >
                Abandon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveWorkout;
