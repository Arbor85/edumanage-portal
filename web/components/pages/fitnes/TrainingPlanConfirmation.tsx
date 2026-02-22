import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type PlanPayload = {
  id: number;
  name: string;
  description?: string;
  template_id: string;
  template_name: string;
  days_of_week: string[];
  day_labels?: Record<string, string>;
  exercises_by_day?: Record<string, { name: string; sets: { type: string; weight: string; reps: string }[] }[]>;
  created_at: string;
};

const TrainingPlanConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = (location.state as { plan?: PlanPayload } | undefined)?.plan;
  const formatDayLabel = (day: string) => plan?.day_labels?.[day]?.trim() || day;

  if (!plan) {
    return (
      <div className="px-4 pt-10 space-y-6 text-slate-900 dark:text-slate-100">
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-400">info</span>
          <h1 className="text-lg font-bold mt-3">No plan details found</h1>
          <p className="text-sm text-slate-500 dark:text-white/60 mt-2">
            Create a training plan first to see confirmation details.
          </p>
          <button
            onClick={() => navigate('/split-plans/create')}
            className="mt-5 px-6 py-2 rounded-full bg-primary text-white text-xs font-black uppercase tracking-widest"
          >
            Back to Planner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-8 pb-24 space-y-6 animate-in fade-in duration-500 text-slate-900 dark:text-slate-100">
      <style>
        {`@media print {
  body { background: #ffffff; }
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  .print-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
}`}
      </style>
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Plan Created</h1>
            <p className="text-xs text-slate-500 dark:text-white/60">Your training plan is ready to use.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500"
          >
            Print Summary
          </button>
          <button
            onClick={() => navigate('/split-plans')}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-l border-slate-200 dark:border-border-dark pl-3"
          >
            View All Plans
          </button>
          <button
            onClick={() => navigate('/split-plans/create')}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-l border-slate-200 dark:border-border-dark pl-3"
          >
            Create Another
          </button>
        </div>
      </header>

      <div className="no-print rounded-full px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest w-fit">
        Plan saved successfully
      </div>

      <section className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark p-5 space-y-4 print-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Plan Name</p>
            <p className="text-lg font-bold mt-1">{plan.name}</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            {plan.days_of_week.length} Days
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {plan.description && (
            <div className="rounded-xl border border-slate-200 dark:border-border-dark p-3 bg-slate-900/5 dark:bg-white/5 col-span-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</p>
              <p className="text-sm font-bold mt-1">{plan.description}</p>
            </div>
          )}
          <div className="rounded-xl border border-slate-200 dark:border-border-dark p-3 bg-slate-900/5 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Template</p>
            <p className="text-sm font-bold mt-1">{plan.template_name}</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-border-dark p-3 bg-slate-900/5 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Training Days</p>
            <p className="text-sm font-bold mt-1">{plan.days_of_week.map(formatDayLabel).join(', ')}</p>
          </div>
          {plan.exercises_by_day && Object.keys(plan.exercises_by_day).length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-border-dark p-3 bg-slate-900/5 dark:bg-white/5 col-span-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exercises</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-white/70">
                {Object.entries(plan.exercises_by_day).map(([day, exercises]) => (
                  <div key={day} className="flex items-center justify-between gap-2">
                    <span className="uppercase text-[10px] font-bold tracking-widest text-slate-400">{formatDayLabel(day)}</span>
                    <span className="font-black">
                      {exercises.map(item => `${item.name} (${item.sets.length} sets)`).join(', ') || 'None'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-xl border border-slate-200 dark:border-border-dark p-3 bg-slate-900/5 dark:bg-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Created</p>
            <p className="text-sm font-bold mt-1">{new Date(plan.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </section>

      <section className="hidden print-only">
        <div className="print-card rounded-xl p-6">
          <h2 className="text-xl font-bold">Training Plan Summary</h2>
          <p className="text-sm text-slate-500 mt-2">Generated on {new Date(plan.created_at).toLocaleString()}</p>
          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Plan</p>
              <p className="font-semibold">{plan.name}</p>
            </div>
            {plan.description && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Description</p>
                <p className="font-semibold">{plan.description}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Template</p>
              <p className="font-semibold">{plan.template_name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Training Days</p>
              <p className="font-semibold">{plan.days_of_week.map(formatDayLabel).join(', ')}</p>
            </div>
            {plan.exercises_by_day && Object.keys(plan.exercises_by_day).length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Exercises</p>
                <p className="font-semibold">
                  {Object.entries(plan.exercises_by_day)
                    .map(([day, exercises]) => `${formatDayLabel(day)}: ${exercises.map(item => `${item.name} (${item.sets.length} sets)`).join(', ') || 'None'}`)
                    .join(' | ')}
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Days / Week</p>
              <p className="font-semibold">{plan.days_of_week.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Created</p>
              <p className="font-semibold">{new Date(plan.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-6 text-xs text-slate-400">
            Keep this summary for your training notes. Adjust volume and recovery based on readiness.
          </div>
        </div>
      </section>

      <div className="fixed bottom-28 left-0 right-0 flex justify-center px-4 pointer-events-none z-40 no-print">
        <button
          onClick={() => navigate('/gym')}
          className="pointer-events-auto flex items-center gap-3 px-10 py-4 bg-primary text-white rounded-full shadow-2xl shadow-primary/20 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined font-black">rocket_launch</span>
          <span className="font-black tracking-widest uppercase text-xs">Go to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default TrainingPlanConfirmation;
