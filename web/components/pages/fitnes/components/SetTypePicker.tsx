import React, { useEffect, useRef, useState } from 'react';
import type { ExerciseSetType } from '../workoutTypes';

const typeTone = (type: ExerciseSetType) => {
  switch (type) {
    case 'warmup':
      return 'text-amber-300';
    case 'failure':
      return 'text-rose-300';
    case 'drop_set':
      return 'text-purple-300';
    default:
      return 'text-emerald-300';
  }
};

const typeLabel = (type: ExerciseSetType) => {
  switch (type) {
    case 'warmup':
      return 'W';
    case 'failure':
      return 'F';
    case 'drop_set':
      return 'D';
    default:
      return 'N';
  }
};

const options: { value: ExerciseSetType; label: string; tone: string }[] = [
  { value: 'normal', label: 'Normal', tone: 'text-emerald-300' },
  { value: 'warmup', label: 'Warmup', tone: 'text-amber-300' },
  { value: 'failure', label: 'Fail', tone: 'text-rose-300' },
  { value: 'drop_set', label: 'Drop', tone: 'text-purple-300' },
];

const SetTypePicker: React.FC<{
  value: ExerciseSetType;
  onChange: (value: ExerciseSetType) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`h-8 w-8 rounded-full border border-slate-300 dark:border-slate-800/60 bg-white dark:bg-slate-950/90 text-[11px] font-black uppercase tracking-[0.16em] flex items-center justify-center ${typeTone(value)}`}
        aria-label="Change set type"
      >
        {typeLabel(value)}
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-32 rounded-xl border border-slate-300 dark:border-slate-800/60 bg-white dark:bg-slate-900/95 shadow-lg shadow-slate-900/50 p-1 space-y-1 z-10">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full rounded-lg px-2 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-left hover:bg-slate-200 dark:hover:bg-slate-800 ${option.tone}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SetTypePicker;
