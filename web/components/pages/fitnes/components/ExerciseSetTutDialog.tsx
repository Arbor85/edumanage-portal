import React from 'react';

type ExerciseSetTutDialogState = {
  downSeconds: string;
  bottomSeconds: string;
  upSeconds: string;
  topSeconds: string;
};

type ExerciseSetTutDialogProps = {
  open: boolean;
  state: ExerciseSetTutDialogState;
  onChange: (next: ExerciseSetTutDialogState) => void;
  onClose: () => void;
};

const ExerciseSetTutDialog: React.FC<ExerciseSetTutDialogProps> = ({
  open,
  state,
  onChange,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close TUT dialog"
      />
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark shadow-2xl">
        <div className="p-5 border-b border-slate-200 dark:border-border-dark flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Movement TUT</p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Time under tension</h2>
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

        <div className="p-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[180px_1fr] items-center">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Moving down (sec)</p>
            <input
              type="number"
              min="0"
              value={state.downSeconds}
              onChange={event => onChange({ ...state, downSeconds: event.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-2 py-1 focus:outline-none"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-[180px_1fr] items-center">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pause at bottom (sec)</p>
            <input
              type="number"
              min="0"
              value={state.bottomSeconds}
              onChange={event => onChange({ ...state, bottomSeconds: event.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-2 py-1 focus:outline-none"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-[180px_1fr] items-center">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Moving up (sec)</p>
            <input
              type="number"
              min="0"
              value={state.upSeconds}
              onChange={event => onChange({ ...state, upSeconds: event.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-2 py-1 focus:outline-none"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-[180px_1fr] items-center">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pause at top (sec)</p>
            <input
              type="number"
              min="0"
              value={state.topSeconds}
              onChange={event => onChange({ ...state, topSeconds: event.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white px-2 py-1 focus:outline-none"
            />
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-border-dark flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-bold text-white px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export type { ExerciseSetTutDialogState };
export default ExerciseSetTutDialog;
