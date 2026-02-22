
import React from 'react';
import { mockSchedule } from '../services/mockData';

const ScheduleView: React.FC = () => {
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 to 21
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const getGridPosition = (time: string, duration: number) => {
    const [h, m] = time.split(':').map(Number);
    const startRow = (h - 7) * 2 + (m >= 30 ? 1 : 0) + 1;
    const span = duration * 2;
    return { startRow, span };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar shrink-0">
        <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark px-3 shadow-sm">
          <span className="text-xs font-medium">CS Department</span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
        <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark px-3 shadow-sm">
          <span className="text-xs font-medium">Room 402</span>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>
        <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary/10 border border-primary/20 px-3 shadow-sm">
          <span className="text-xs font-semibold text-primary">Reset</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-background-light dark:bg-background-dark relative">
        <div className="grid min-w-max" style={{ gridTemplateColumns: '60px repeat(7, 180px)', gridTemplateRows: '40px repeat(28, 40px)' }}>
          {/* Day Headers */}
          <div className="sticky top-0 left-0 z-30 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-border-dark"></div>
          {days.map((day, i) => (
            <div key={day} className="sticky top-0 z-20 bg-background-light dark:bg-background-dark flex items-center justify-center border-b border-gray-200 dark:border-border-dark px-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${i === 1 ? 'text-primary' : 'text-slate-500'}`}>{day} {12 + i}</span>
            </div>
          ))}

          {/* Time Labels */}
          {hours.map((hour, i) => (
            <div key={hour} className="sticky left-0 z-20 bg-background-light dark:bg-background-dark text-[10px] text-slate-400 flex items-start justify-end pr-2 pt-2 border-r border-gray-200 dark:border-border-dark" style={{ gridRow: `${i * 2 + 1} / span 2` }}>
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}

          {/* Grid Lines helper - Simple backdrop grid */}
          <div className="col-start-2 col-span-7 row-start-1 row-span-28 grid grid-cols-7 grid-rows-28 border-gray-100 dark:border-border-dark pointer-events-none">
             {Array.from({length: 14}).map((_, i) => (
               <div key={i} className="col-span-7 border-t border-gray-200 dark:border-border-dark/50 opacity-40" style={{ gridRowStart: (i+1)*2 }}></div>
             ))}
          </div>

          {/* Schedule Items */}
          {mockSchedule.map((item) => {
            const { startRow, span } = getGridPosition(item.startTime, item.durationHours);
            const dayIndex = days.indexOf(item.day);
            const colors = {
              'Lecture': 'bg-primary/20 border-primary text-primary',
              'Lab': 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400',
              'Seminar': 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400'
            };

            return (
              <div 
                key={item.id}
                className={`z-10 m-1 rounded-lg border-l-4 p-2 flex flex-col justify-between ${colors[item.type]}`}
                style={{ 
                  gridColumn: dayIndex + 2, 
                  gridRow: `${startRow} / span ${span}` 
                }}
              >
                <div>
                  <p className="text-[10px] font-bold uppercase leading-tight">{item.type}</p>
                  <p className="text-xs font-semibold leading-tight mt-0.5 text-slate-900 dark:text-white">{item.subjectName}</p>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.roomName}</p>
              </div>
            );
          })}

          {/* Time Marker Indicator */}
          <div className="z-40 absolute left-0 right-0 h-0.5 bg-red-500 pointer-events-none" style={{ top: '380px' }}>
            <div className="absolute -left-1 -top-1 size-2.5 rounded-full bg-red-500 shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
