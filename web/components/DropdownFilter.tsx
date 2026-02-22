import React from 'react';

type Props = {
    label: string;
    options: string[];
    selected: string | null;
    onSelect: (value: string | null) => void;
    className?: string;
};

const DropdownFilter: React.FC<Props> = ({ label, options, selected, onSelect, className }) => {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (value: string | null) => {
        onSelect(value);
        setOpen(false);
    };

    return (
        <div className={`${className || ''}`}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 whitespace-nowrap bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-full text-sm font-medium"
            >
                <span>{label}: {selected || 'All'}</span>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>

            {open && (
                <div className="absolute z-20">
                    <div className="relative top-full left-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[200px] pointer-events-auto">
                        <button
                            onClick={() => handleSelect(null)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${!selected ? 'bg-slate-100 dark:bg-slate-700 font-bold' : ''
                                }`}
                        >
                            All {label}s
                        </button>
                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => handleSelect(opt)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${selected === opt ? 'bg-slate-100 dark:bg-slate-700 font-bold' : ''
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropdownFilter;
