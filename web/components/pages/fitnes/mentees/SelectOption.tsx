import React from 'react';

interface SelectOptionProps<T extends string> {
  value: T;
  values: Array<{
    value: T;
    label: string;
    icon?: string;
    className?: string;
  }>;
  onChange: (value: T) => void;
  disabled?: boolean;
}

function SelectOption<T extends string>({ value, values, onChange, disabled }: SelectOptionProps<T>) {
  return (
    <div className="flex gap-2">
      {values.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`flex-none rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
            value === opt.value
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/40'
              : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600'
          } ${opt.className || ''}`}
          onClick={() => onChange(opt.value)}
          disabled={disabled}
          aria-pressed={value === opt.value}
        >
          {opt.icon && <span className="material-symbols-outlined">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default SelectOption;
