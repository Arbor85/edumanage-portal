import React from 'react';

type WeightInputProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  step?: number;
};

const parseNumber = (value: string) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatValue = (value: number) => {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
};

const WeightInput: React.FC<WeightInputProps> = ({ value, onChange, onFocus, onBlur, step = 2.5 }) => {
  const increment = (delta: number) => {
    const current = parseNumber(value);
    const next = Math.max(0, current + delta);
    onChange(formatValue(next));
  };

  const weightValue = Number(value);
  const isInvalid = value === '' || Number.isNaN(weightValue) || weightValue < 0;

  return (
    <div className={`flex items-center gap-1 rounded-xl border px-2 py-2 ${isInvalid ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10' : 'border-slate-200 dark:border-border-dark bg-slate-100 dark:bg-white/5'}`}>
      <button
        type="button"
        onClick={() => increment(-step)}
        className="px-2 h-8 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white flex items-center justify-center hover:bg-slate-300 dark:hover:bg-white/20 text-[11px] font-bold uppercase tracking-widest"
        aria-label="Decrease weight"
      >
        -{formatValue(step)}kg
      </button>
      <input
        type="number"
        min="0"
        value={value}
        onChange={event => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full min-w-[64px] bg-transparent text-sm font-semibold text-slate-900 dark:text-white text-center focus:outline-none"
        placeholder="kg"
      />
      <button
        type="button"
        onClick={() => increment(step)}
        className="px-2 h-8 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white flex items-center justify-center hover:bg-slate-300 dark:hover:bg-white/20 text-[11px] font-bold uppercase tracking-widest"
        aria-label="Increase weight"
      >
        +{formatValue(step)}kg
      </button>
    </div>
  );
};

export default WeightInput;
