import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import trainingPlanData from './data/trainingPlans.json';
import exerciseData from './data/excercises.json';
import { createTrainingPlan } from '../../../services/trainingPlanService';
import { getMentees } from '../../../services/menteesService';
import { useAuth } from '../../../contexts/AuthContext';
import { Mentee } from '../../../types';
import WorkoutDaysList, { WorkoutDay } from './WorkoutDaysList';
import WorkoutActionBar from './components/WorkoutActionBar';

type TrainingPlan = (typeof trainingPlanData.trainingPlans)[number];
type ExerciseSetType = 'normal' | 'warmup' | 'failure' | 'drop_set';
type ExerciseSet = {
  type: ExerciseSetType;
  weight: string;
  reps: string;
};
type ExerciseEntry = {
  name: string;
  sets: ExerciseSet[];
};
type FormErrors = {
  planName?: string;
  exercises?: string;
  trainingDays?: string;
  template?: string;
};

const buildDayLabels = (days: string[]) =>
  days.reduce<Record<string, string>>((acc, day) => {
    acc[day] = day;
    return acc;
  }, {});

const SplitPlanner: React.FC = () => {
  const plans = trainingPlanData.trainingPlans;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const menteeIdParam = searchParams.get('mentee');
  const initialPlanId = plans[0]?.id ?? '';
  const initialTrainingDays = ['Mon', 'Wed', 'Fri'];
  const initialTrainingDayLabels = buildDayLabels(initialTrainingDays);
  const initialExercisesByDay: Record<string, ExerciseEntry[]> = {
    Mon: [],
    Wed: [],
    Fri: [],
  };
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [trainingDays, setTrainingDays] = useState<string[]>(initialTrainingDays);
  const [trainingDayLabels, setTrainingDayLabels] = useState<Record<string, string>>(initialTrainingDayLabels);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [exerciseDrafts, setExerciseDrafts] = useState<Record<string, string>>({});
  const [exercisesByDay, setExercisesByDay] = useState<Record<string, ExerciseEntry[]>>(initialExercisesByDay);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [animatedDays, setAnimatedDays] = useState<string[]>([]);
  const planNameRef = useRef<HTMLInputElement | null>(null);
  const firstDayRef = useRef<HTMLButtonElement | null>(null);
  const firstTemplateRef = useRef<HTMLButtonElement | null>(null);
  const prevTrainingDaysRef = useRef<string[]>(trainingDays);

  const selectedPlan = useMemo(
    () => plans.find(plan => plan.id === selectedPlanId) || plans[0],
    [plans, selectedPlanId]
  );

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const orderedTrainingDays = useMemo(
    () => daysOfWeek.filter(day => trainingDays.includes(day)),
    [daysOfWeek, trainingDays]
  );

  const structureEntries = selectedPlan?.defaultStructure
    ? Object.entries(selectedPlan.defaultStructure)
    : [];

  const defaultTemplateIds = new Set(['fbw', 'ppl', 'upper_lower']);
  const defaultTemplates = plans.filter(plan => defaultTemplateIds.has(plan.id));
  const extraTemplates = plans.filter(plan => !defaultTemplateIds.has(plan.id));
  const templatesToShow = showAllTemplates
    ? [...defaultTemplates, ...extraTemplates]
    : defaultTemplates;
  const templateNameSet = useMemo(() => new Set(plans.map(plan => plan.name.trim())), [plans]);
  const recommendedDays = selectedPlan?.recommendedFrequencyPerWeek ?? 0;
  const hasRecommendedDayMismatch = Boolean(recommendedDays && trainingDays.length !== recommendedDays);

  const hasChanges =
    planName.trim().length > 0 ||
    planDescription.trim().length > 0 ||
    selectedPlanId !== initialPlanId ||
    trainingDays.join(',') !== initialTrainingDays.join(',') ||
    Object.entries(trainingDayLabels).some(([day, label]: [string, string]) => label.trim() !== day) ||
    Object.values(exercisesByDay).some((list) => (list as ExerciseEntry[]).length > 0);

  useEffect(() => {
    setExercisesByDay(prev => {
      const next: Record<string, ExerciseEntry[]> = {};
      trainingDays.forEach(day => {
        next[day] = prev[day] ?? [];
      });
      return next;
    });
    setExerciseDrafts(prev => {
      const next: Record<string, string> = {};
      trainingDays.forEach(day => {
        next[day] = prev[day] ?? '';
      });
      return next;
    });
    setTrainingDayLabels(prev => {
      const next: Record<string, string> = {};
      trainingDays.forEach(day => {
        next[day] = prev[day] ?? day;
      });
      return next;
    });
  }, [trainingDays]);

  useEffect(() => {
    const prevTrainingDays = prevTrainingDaysRef.current;
    const addedDays = trainingDays.filter(day => !prevTrainingDays.includes(day));
    if (addedDays.length) {
      setAnimatedDays(current => Array.from(new Set([...current, ...addedDays])));
    }
    prevTrainingDaysRef.current = trainingDays;
  }, [trainingDays]);

  useEffect(() => {
    if (!menteeIdParam) return;
    const loadMentee = async () => {
      try {
        if (!user?.sub) {
          throw new Error('User not authenticated');
        }
        const data = await getMentees(user.sub);
        const mentee = data.find(m => m.id === menteeIdParam);
        if (mentee) {
          setSelectedMentee(mentee);
        }
      } catch (err) {
        console.error('Failed to load mentee:', err);
      }
    };
    loadMentee();
  }, [menteeIdParam, user?.sub]);

  useEffect(() => {
    if (!Object.keys(errors).length) {
      return;
    }

    if (errors.planName && planNameRef.current) {
      planNameRef.current.focus();
      return;
    }

    if (errors.trainingDays && firstDayRef.current) {
      firstDayRef.current.focus();
      return;
    }

    if (errors.template && firstTemplateRef.current) {
      firstTemplateRef.current.focus();
    }
  }, [errors]);

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const trimmedName = planName.trim();

    if (trimmedName.length < 3) {
      nextErrors.planName = 'Add a plan name (min 3 characters).';
    }

    if (!trainingDays.length) {
      nextErrors.trainingDays = 'Select at least one training day.';
    }

    if (!selectedPlanId || !selectedPlan) {
      nextErrors.template = 'Choose a training template.';
    }

    return nextErrors;
  };

  const validateExercises = () => {
    const nextErrors: FormErrors = {};
    const missingExercise = trainingDays.some(day => (exercisesByDay[day] ?? []).length === 0);
    if (missingExercise) {
      nextErrors.exercises = 'Add at least one exercise for each selected day.';
    }
    const missingSets = trainingDays.some(day =>
      (exercisesByDay[day] ?? []).some(exercise => exercise.sets.length === 0)
    );
    if (missingSets) {
      nextErrors.exercises = 'Each exercise needs at least one set.';
    }
    return nextErrors;
  };

  const handleCreatePlan = async () => {
    if (!trainingDays.length) {
      setErrors(prev => ({ ...prev, trainingDays: 'Select at least one training day.' }));
      return;
    }
    const nextErrors = validateExercises();
    setErrors(prev => ({ ...prev, ...nextErrors }));

    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setIsSaving(true);
    setToast(null);

    try {
      const createdPlan = await createTrainingPlan({
        name: planName.trim(),
        description: planDescription.trim() || undefined,
        template_id: selectedPlan?.id ?? '',
        template_name: selectedPlan?.name ?? '',
        days_of_week: trainingDays,
        exercises_by_day: exercisesByDay,
        creator_id: user?.sub || undefined,
        mentee_id: menteeIdParam || null,
      });

      setToast({ message: 'Plan saved successfully.', tone: 'success' });
      setTimeout(() => {
        navigate('/split-plans');
      }, 700);
    } catch (error) {
      setToast({ message: 'Unable to save plan. Please try again.', tone: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlanNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlanName(event.target.value);
    if (errors.planName) {
      setErrors(prev => ({ ...prev, planName: undefined }));
    }
  };

  const handlePlanDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPlanDescription(event.target.value);
  };

  const handleTrainingDayLabelChange = (day: string, value: string) => {
    setTrainingDayLabels(prev => ({ ...prev, [day]: value }));
  };

  const toggleTrainingDay = (day: string) => {
    setTrainingDays(prev => {
      const next = prev.includes(day)
        ? prev.filter(item => item !== day)
        : [...prev, day];
      if (next.length && errors.trainingDays) {
        setErrors(current => ({ ...current, trainingDays: undefined }));
      }
      return next;
    });
  };

  const handleExerciseDraftChange = (day: string, value: string) => {
    setExerciseDrafts(prev => ({ ...prev, [day]: value }));
  };

  const applyTemplateExercises = () => {
    const next: Record<string, ExerciseEntry[]> = {};
    trainingDays.forEach(day => {
      next[day] = [];
    });

    const example = selectedPlan?.example ?? {};
    if (Array.isArray((example as { session?: string[] }).session)) {
      const session = (example as { session: string[] }).session;
      trainingDays.forEach(day => {
        next[day] = session.map(item => ({
          name: item,
          sets: [{ type: 'normal', weight: '', reps: '' }],
        }));
      });
    } else if (
      (example as { pushDay?: string[] }).pushDay &&
      (example as { pullDay?: string[] }).pullDay &&
      (example as { legsDay?: string[] }).legsDay
    ) {
      const plan = example as { pushDay: string[]; pullDay: string[]; legsDay: string[] };
      if (trainingDays[0]) {
        next[trainingDays[0]] = plan.pushDay.map(item => ({
          name: item,
          sets: [{ type: 'normal', weight: '', reps: '' }],
        }));
      }
      if (trainingDays[1]) {
        next[trainingDays[1]] = plan.pullDay.map(item => ({
          name: item,
          sets: [{ type: 'normal', weight: '', reps: '' }],
        }));
      }
      if (trainingDays[2]) {
        next[trainingDays[2]] = plan.legsDay.map(item => ({
          name: item,
          sets: [{ type: 'normal', weight: '', reps: '' }],
        }));
      }
    } else if (Array.isArray((example as { week?: { day: string; mainLift: string }[] }).week)) {
      const week = (example as { week: { day: string; mainLift: string }[] }).week;
      week.forEach(item => {
        const dayKey = item.day.slice(0, 3);
        if (next[dayKey]) {
          next[dayKey] = [{
            name: item.mainLift,
            sets: [{ type: 'normal', weight: '', reps: '' }],
          }];
        }
      });
    } else if (Array.isArray((example as { week?: string[] }).week)) {
      const week = (example as { week: string[] }).week;
      week.forEach((item, index) => {
        const dayKey = trainingDays[index];
        if (dayKey) {
          next[dayKey] = [{
            name: item,
            sets: [{ type: 'normal', weight: '', reps: '' }],
          }];
        }
      });
    }

    setExercisesByDay(next);
    if (errors.exercises) {
      setErrors(prev => ({ ...prev, exercises: undefined }));
    }
  };

  const handleNextStep = () => {
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setCurrentStep(2);
  };

  const handleCancelChanges = () => {
    setShowCancelModal(true);
  };

  const confirmCancelChanges = () => {
    setPlanName('');
    setPlanDescription('');
    setSelectedPlanId(initialPlanId);
    setTrainingDays(initialTrainingDays);
    setTrainingDayLabels(initialTrainingDayLabels);
    setExercisesByDay(initialExercisesByDay);
    setExerciseDrafts({});
    setCurrentStep(1);
    setErrors({});
    setToast(null);
    setShowCancelModal(false);
  };

  const dismissCancelModal = () => {
    setShowCancelModal(false);
  };

  const workoutDayList: WorkoutDay[] = useMemo(
    () =>
      orderedTrainingDays.map(day => ({
        id: day,
        label: trainingDayLabels[day] ?? '',
        exercises: exercisesByDay[day] ?? [],
        draft: exerciseDrafts[day] ?? '',
      })),
    [orderedTrainingDays, trainingDayLabels, exercisesByDay, exerciseDrafts]
  );

  const handleWorkoutDayListChanged = (next: WorkoutDay[]) => {
    const nextLabels: Record<string, string> = {};
    const nextExercises: Record<string, ExerciseEntry[]> = {};
    const nextDrafts: Record<string, string> = {};

    next.forEach(item => {
      nextLabels[item.id] = item.label;
      nextExercises[item.id] = item.exercises;
      nextDrafts[item.id] = item.draft;
    });

    setTrainingDayLabels(nextLabels);
    setExercisesByDay(nextExercises);
    setExerciseDrafts(nextDrafts);

    if (errors.exercises) {
      setErrors(prev => ({ ...prev, exercises: undefined }));
    }
  };

  return (
    <div className="px-4 pt-6 pb-24 space-y-8 animate-in slide-in-from-bottom duration-500 text-slate-900 dark:text-slate-100">
      <button
        type="button"
        onClick={() => navigate('/split-plans')}
        className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        <span>Back to Plans</span>
      </button>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10">
            <span className="material-symbols-outlined text-primary text-2xl">edit_calendar</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Create Training Plan</h1>
            <p className="text-xs text-slate-500 dark:text-white/60">Pick a template and personalize it.</p>
            {selectedMentee && (
              <p className="text-xs text-slate-500 dark:text-white/60">Assigned to: <Link to={`/mentees/${selectedMentee.id}`}>{selectedMentee.name} ({selectedMentee.email_address})</Link></p>
            )}
          </div>
        </div>
        <button className="size-10 rounded-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">tune</span>
        </button>
      </header>

      {currentStep === 1 ? (
        <>
          <section className="space-y-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Plan Details</h2>
            <div className="grid gap-4">
              <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark p-4 space-y-3">
                {selectedMentee && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary">person</span>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Assigned to Mentee</label>
                      <div className="mt-2 w-full rounded-xl border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-sm font-semibold">
                        {selectedMentee.name} ({selectedMentee.email_address})
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">badge</span>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Plan Name</label>
                    <input
                      ref={planNameRef}
                      value={planName}
                      onChange={handlePlanNameChange}
                      placeholder={selectedPlan ? `${selectedPlan.name} Plan` : 'My Training Plan'}
                      className={`mt-2 w-full rounded-xl border bg-transparent px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 ${errors.planName ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 dark:border-border-dark focus:ring-primary/40'}`}
                    />
                    {errors.planName && (
                      <p className="mt-1 text-[10px] font-semibold text-red-500">{errors.planName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">notes</span>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Description</label>
                    <textarea
                      value={planDescription}
                      onChange={handlePlanDescriptionChange}
                      placeholder="Add a short description or notes for this plan."
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-slate-200 dark:border-border-dark bg-transparent px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>                
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Training Days</label>
                    <span className="text-xs font-bold text-primary">{trainingDays.length} selected</span>
                  </div>
                  <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto no-scrollbar">
                    {daysOfWeek.map((day, index) => {
                      const isSelected = trainingDays.includes(day);
                      const isWeekend = day === 'Sat' || day === 'Sun';
                      const baseClass = 'flex-none rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest border transition-all';
                      const selectedClass = 'bg-primary text-white border-primary';
                      const weekendClass = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/40';
                      const weekdayClass = 'bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark text-slate-500 dark:text-white/70';
                      return (
                        <button
                          key={day}
                          ref={index === 0 ? firstDayRef : undefined}
                          type="button"
                          onClick={() => toggleTrainingDay(day)}
                          className={`${baseClass} ${isSelected ? selectedClass : isWeekend ? weekendClass : weekdayClass}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  {errors.trainingDays && (
                    <p className="mt-2 text-[10px] font-semibold text-red-500">{errors.trainingDays}</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="lg:w-[30%] space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Choose Template</h2>
                  <span className="text-xs font-bold text-primary">{plans.length} options</span>
                </div>
                <div className="space-y-3">
                  {templatesToShow.map((plan: TrainingPlan, index) => (
                    <button
                      ref={index === 0 ? firstTemplateRef : undefined}
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        const trimmedPlanName = planName.trim();
                        if (!trimmedPlanName || templateNameSet.has(trimmedPlanName)) {
                          setPlanName(plan.name);
                          if (errors.planName) {
                            setErrors(prev => ({ ...prev, planName: undefined }));
                          }
                        }
                        if (errors.template) {
                          setErrors(prev => ({ ...prev, template: undefined }));
                        }
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedPlanId === plan.id ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-border-dark'} ${errors.template ? 'border-red-400' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold">{plan.name}</p>
                          <p className="text-xs text-slate-500 dark:text-white/60 mt-1">{plan.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-1 rounded-lg bg-slate-900/5 dark:bg-white/5 font-black uppercase tracking-widest">
                            {plan.defaultDurationMinutes} min
                          </span>
                          <span className={`size-2 rounded-full ${selectedPlanId === plan.id ? 'bg-primary' : 'bg-slate-300'}`}></span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-white/60 mt-3">{plan.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {plan.goalCompatibility.map(goalKey => (
                          <span key={goalKey} className="text-[9px] px-2.5 py-1 rounded-full bg-primary text-white font-black uppercase tracking-tight">
                            {goalKey.replace('_', ' ')}
                          </span>
                        ))}
                        {plan.experienceLevel.map(level => (
                          <span key={level} className="text-[9px] px-2.5 py-1 rounded-full bg-slate-900/10 dark:bg-white/10 text-slate-700 dark:text-white font-black uppercase tracking-tight">
                            {level}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
                {extraTemplates.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllTemplates(prev => !prev)}
                    className="w-full mt-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-border-dark text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/70"
                  >
                    {showAllTemplates ? 'Show Less' : 'Show More'}
                  </button>
                )}
                {errors.template && (
                  <p className="text-[10px] font-semibold text-red-500">{errors.template}</p>
                )}
              </section>
            </div>

            <aside className="lg:w-[70%]">
              {selectedPlan && (
                <section className="space-y-4 lg:sticky lg:top-6">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Template Preview</h2>
                  <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark p-6 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold">{selectedPlan.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-white/60 mt-1">{selectedPlan.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase text-primary">Recommended</span>
                        <p className="text-lg font-black">{selectedPlan.recommendedFrequencyPerWeek}x</p>
                        <p className="text-[10px] text-slate-500 dark:text-white/60">per week</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border border-slate-200 dark:border-border-dark p-3 bg-slate-900/5 dark:bg-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pros</p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-white/70">
                          {selectedPlan.pros.map(item => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-border-dark p-3 bg-slate-900/5 dark:bg-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cons</p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-white/70">
                          {selectedPlan.cons.map(item => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-border-dark p-3 bg-slate-900/5 dark:bg-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default Structure</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-white/70">
                        {structureEntries.map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between gap-2">
                            <span className="uppercase text-[10px] font-bold tracking-widest text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="font-black">{Array.isArray(value) ? value.join(', ') : value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </aside>
          </div>
        </>
      ) : (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Add Exercises</h2>
              <p className="text-xs text-slate-500 dark:text-white/60">Build a list for each training day.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={applyTemplateExercises}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-border-dark text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/70"
              >
                Copy From Template
              </button>
              <div className="text-xs font-bold text-primary uppercase tracking-widest">Step 2 of 2</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Training Days</label>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{trainingDays.length} selected</span>
            </div>
            {hasRecommendedDayMismatch && (
              <p className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                Recommended {recommendedDays} days per week for this template.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {daysOfWeek.map(day => {
                const isSelected = trainingDays.includes(day);
                const isWeekend = day === 'Sat' || day === 'Sun';
                const baseClass = 'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all';
                const selectedClass = 'bg-primary text-white shadow-lg shadow-primary/30';
                const weekendClass = 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70';
                const weekdayClass = 'bg-slate-900/5 dark:bg-white/5 text-slate-700 dark:text-white/70';

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleTrainingDay(day)}
                    className={`${baseClass} ${isSelected ? selectedClass : isWeekend ? weekendClass : weekdayClass}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            {errors.trainingDays && (
              <p className="mt-2 text-[10px] font-semibold text-red-500">{errors.trainingDays}</p>
            )}
          </div>

          <WorkoutDaysList
            workoutDayList={workoutDayList}
            onWorkoutDayListChanged={handleWorkoutDayListChanged}
          />
          {errors.exercises && (
            <p className="text-xs font-semibold text-rose-500">{errors.exercises}</p>
          )}
        </section>
      )}

      {toast && (
        <div className="fixed top-20 left-0 right-0 flex justify-center px-4 z-50">
          <div className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest shadow-lg ${toast.tone === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
            {toast.message}
          </div>
        </div>
      )}

      <WorkoutActionBar
        primaryAction={
          currentStep === 1
            ? {
                label: 'Next',
                icon: 'arrow_forward',
                onClick: handleNextStep,
              }
            : {
                label: isSaving ? 'Saving' : 'Create Plan',
                icon: isSaving ? 'hourglass_top' : 'add_circle',
                onClick: handleCreatePlan,
                isLoading: isSaving,
                disabled: isSaving,
              }
        }
        secondaryActions={[
          ...(hasChanges
            ? [
                {
                  label: 'Cancel',
                  onClick: handleCancelChanges,
                },
              ]
            : []),
          ...(currentStep === 2
            ? [
                {
                  label: 'Back',
                  onClick: () => setCurrentStep(1),
                  disabled: isSaving,
                },
              ]
            : []),
        ]}
      />

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            onClick={dismissCancelModal}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Close dialog"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Discard changes?</h3>
                <p className="text-xs text-slate-500 dark:text-white/60 mt-1">
                  Your edits will be lost and the form will reset.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={dismissCancelModal}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-border-dark text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/70"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={confirmCancelChanges}
                className="px-4 py-2 rounded-full bg-rose-500 text-white text-xs font-black uppercase tracking-widest"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitPlanner;
