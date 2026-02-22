import React from 'react';

type ActionButton = {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary';
};

type WorkoutActionBarProps = {
  primaryAction: ActionButton;
  secondaryActions?: ActionButton[];
};

const WorkoutActionBar: React.FC<WorkoutActionBarProps> = ({ primaryAction, secondaryActions = [] }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-gradient-to-t from-slate-900/80 to-slate-900/40 dark:from-slate-950/80 dark:to-slate-950/40 backdrop-blur-sm border-t border-slate-200 dark:border-border-dark flex items-center justify-end gap-2">
      {/* Secondary Actions (left side) */}
      {secondaryActions.map((action, idx) => (
        <button
          key={idx}
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          className="px-4 py-2 rounded-full border border-slate-200 dark:border-border-dark text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-60"
        >
          <span className="font-black tracking-widest uppercase text-xs">{action.label}</span>
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Primary Action (right side) */}
      <button
        type="button"
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled || primaryAction.isLoading}
        className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest disabled:opacity-60 transition-all active:scale-95 flex items-center gap-2 ${
          primaryAction.disabled || primaryAction.isLoading
            ? 'bg-slate-400 text-white cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {primaryAction.icon && <span className="material-symbols-outlined text-sm">{primaryAction.icon}</span>}
        {primaryAction.label}
      </button>
    </div>
  );
};

export default WorkoutActionBar;
