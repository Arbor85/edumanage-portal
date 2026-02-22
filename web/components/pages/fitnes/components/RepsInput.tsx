import React from 'react';

type RepsInputProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  step?: number;
};

type RepsMode = 'classic' | 'rpe' | 'rir' | 'range';

const parseNumber = (value: string) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
};

const isRangeValue = (value: string) => value.trim().includes('-');

const getModeFromValue = (value: string): RepsMode => {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith('rpe:')) return 'rpe';
  if (trimmed.startsWith('rir:')) return 'rir';
  if (isRangeValue(value)) return 'range';
  return 'classic';
};

const getValuePart = (value: string, mode: RepsMode) => {
  if (mode === 'rpe' && value.toLowerCase().startsWith('rpe:')) {
    return value.slice(4);
  }
  if (mode === 'rir' && value.toLowerCase().startsWith('rir:')) {
    return value.slice(4);
  }
  return value;
};

const buildValue = (mode: RepsMode, next: string) => {
  if (mode === 'classic') return next;
  return `${mode}:${next}`;
};

const buildRangeValue = (minValue: string, maxValue: string) => `${minValue}-${maxValue}`;

const getRangeParts = (value: string) => {
  const trimmed = value.replace(/\s+/g, '');
  const [minValue = '', maxValue = ''] = trimmed.split('-', 2);
  return { minValue, maxValue };
};

const RepsInput: React.FC<RepsInputProps> = ({ value, onChange, onFocus, onBlur, step = 2 }) => {
  const mode = getModeFromValue(value);
  const valuePart = getValuePart(value, mode);
  const stepValue = mode === 'classic' ? step : 1;
  const rangeParts = getRangeParts(value);

  const handleModeChange = (nextMode: RepsMode) => {
    if (nextMode === mode) return;
    if (nextMode === 'range') {
      onChange(buildRangeValue(valuePart, ''));
      return;
    }
    if (mode === 'range') {
      onChange(buildValue(nextMode, rangeParts.minValue));
      return;
    }
    onChange(buildValue(nextMode, valuePart));
  };

  const handleValueChange = (next: string) => {
    onChange(buildValue(mode, next));
  };

  const handleRangeChange = (nextMin: string, nextMax: string) => {
    const minNum = parseNumber(nextMin);
    const maxNum = parseNumber(nextMax);
    if (Number.isFinite(minNum) && Number.isFinite(maxNum) && maxNum < minNum) {
      onChange(buildRangeValue(nextMin, String(minNum)));
      return;
    }
    onChange(buildRangeValue(nextMin, nextMax));
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
    onFocus?.();
  };

  const minValue = mode === 'rir' ? 0 : 1;
  const maxValue = mode === 'rpe' ? 10 : undefined;
  const placeholder = mode === 'classic' ? 'reps' : mode.toUpperCase();

  const isInvalid = (() => {
    if (mode === 'range') {
      const minNum = parseNumber(rangeParts.minValue);
      const maxNum = parseNumber(rangeParts.maxValue);
      return !rangeParts.minValue || !rangeParts.maxValue || Number.isNaN(minNum) || Number.isNaN(maxNum) || minNum <= 0 || maxNum <= 0;
    }
    const repsValue = parseNumber(valuePart);
    return !valuePart || Number.isNaN(repsValue) || repsValue <= 0;
  })();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {mode === 'range' ? (
          <div className={`flex flex-1 items-center gap-2 rounded-xl border px-2 py-2 ${isInvalid ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10' : 'border-slate-200 dark:border-border-dark bg-slate-100 dark:bg-white/5'}`}>
            <input
              type="number"
              min={1}
              value={rangeParts.minValue}
              onChange={event => handleRangeChange(event.target.value, rangeParts.maxValue)}
              onFocus={handleFocus}
              onBlur={onBlur}
              step={stepValue}
              className="w-full min-w-[56px] bg-transparent text-sm font-semibold text-slate-900 dark:text-white text-center focus:outline-none"
              placeholder="min"
            />
            <span className="text-xs font-semibold text-slate-400">-</span>
            <input
              type="number"
              min={1}
              value={rangeParts.maxValue}
              onChange={event => handleRangeChange(rangeParts.minValue, event.target.value)}
              onFocus={handleFocus}
              onBlur={onBlur}
              step={stepValue}
              className="w-full min-w-[56px] bg-transparent text-sm font-semibold text-slate-900 dark:text-white text-center focus:outline-none"
              placeholder="max"
            />
          </div>
        ) : (
          <div className={`flex flex-1 items-center gap-1 rounded-xl border px-2 py-2 ${isInvalid ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10' : 'border-slate-200 dark:border-border-dark bg-slate-100 dark:bg-white/5'}`}>
            <input
              type="number"
              min={minValue}
              max={maxValue}
              value={valuePart}
              onChange={event => handleValueChange(event.target.value)}
              onFocus={handleFocus}
              onBlur={onBlur}
              step={stepValue}
              className="w-full min-w-[64px] bg-transparent text-sm font-semibold text-slate-900 dark:text-white text-center focus:outline-none"
              placeholder={placeholder}
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          {(['classic', 'rpe', 'rir', 'range'] as RepsMode[]).map(option => {
            const isActive = mode === option;
            const label = option === 'classic' ? 'Classic' : option.toUpperCase();
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleModeChange(option)}
                className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                    : 'bg-white dark:bg-slate-900/70 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        {mode === 'classic' && <p>Classic: number of repetitions</p>}
        {mode === 'rpe' && <p>RPE: rate difficulty</p>}
        {mode === 'rir' && <p>RIR: how many more you could do</p>}
        {mode === 'range' && <p>Range: set minimum and maximum reps</p>}
      </div>
    </div>
  );
};

export default RepsInput;
