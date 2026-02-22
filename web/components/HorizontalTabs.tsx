import React from 'react';

type TabOption = {
  id: string;
  label: string;
};

type HorizontalTabsProps = {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
};

const HorizontalTabs: React.FC<HorizontalTabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-border-dark">
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-t-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition ${
              isActive
                ? 'bg-primary text-white'
                : 'text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default HorizontalTabs;
