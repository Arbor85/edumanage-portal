
import React from 'react';

interface AddScheduleItemViewProps {
  onBack: () => void;
  onSave: () => void;
}

const AddScheduleItemView: React.FC<AddScheduleItemViewProps> = ({ onBack, onSave }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onBack}></div>
      <div className="relative z-10 w-full max-h-[92%] bg-[#111318] rounded-t-[2.5rem] shadow-2xl overflow-hidden border-t border-slate-800 animate-in slide-in-from-bottom duration-300">
        <div className="flex flex-col items-stretch bg-[#111318]">
          <button className="flex h-6 w-full items-center justify-center" onClick={onBack}>
            <div className="h-1.5 w-12 rounded-full bg-[#3b4354]"></div>
          </button>
          <div className="flex items-center px-6 py-2 justify-between">
            <button onClick={onBack} className="text-slate-400 flex size-10 items-center justify-center rounded-full hover:bg-slate-800 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Add Schedule Item</h2>
            <button onClick={onBack} className="text-[#9da6b9] text-sm font-semibold hover:text-white px-2">Cancel</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 pb-24 no-scrollbar">
          <div className="space-y-2">
            <label className="text-white text-sm font-semibold px-1">Subject</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
              <input className="w-full bg-[#1c1f27] border border-[#3b4354] rounded-xl py-4 pl-12 pr-4 text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Search subject (e.g., CS-101)" type="text"/>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-white text-sm font-semibold">Classroom</label>
              <span className="text-emerald-400 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Checking availability...
              </span>
            </div>
            <select className="w-full bg-[#1c1f27] border border-[#3b4354] rounded-xl py-4 px-4 text-white appearance-none outline-none">
              <option disabled selected value="">Select a room</option>
              <option value="301">Room 301 (2nd Floor)</option>
              <option value="302">Room 302 (2nd Floor)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-white text-sm font-semibold px-1">Day</label>
            <div className="flex justify-between items-center gap-2 overflow-x-auto no-scrollbar">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <button 
                  key={i} 
                  className={`flex-1 min-w-[3rem] aspect-square rounded-full border ${i === 1 ? 'border-primary bg-primary/20 text-primary ring-2 ring-primary/40' : 'border-slate-700 bg-slate-800/50 text-slate-400'} flex items-center justify-center font-bold text-xs transition-all`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-white text-sm font-semibold px-1">Start Time</label>
              <div className="flex items-center bg-[#1c1f27] border border-[#3b4354] rounded-xl px-4 py-3 text-white">
                <span className="material-symbols-outlined text-slate-500 mr-2 text-lg">schedule</span>
                <input className="bg-transparent border-none p-0 focus:ring-0 text-lg font-medium w-full" type="time" defaultValue="10:00"/>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-white text-sm font-semibold px-1">End Time</label>
              <div className="flex items-center bg-[#1c1f27] border border-[#3b4354] rounded-xl px-4 py-3 text-white">
                <span className="material-symbols-outlined text-slate-500 mr-2 text-lg">schedule</span>
                <input className="bg-transparent border-none p-0 focus:ring-0 text-lg font-medium w-full" type="time" defaultValue="11:30"/>
              </div>
            </div>
          </div>

          <div className="flex gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <span className="material-symbols-outlined text-red-500 shrink-0">warning</span>
            <div className="space-y-1">
              <p className="text-red-500 text-sm font-bold leading-tight">Conflict Detected</p>
              <p className="text-red-200/80 text-xs leading-relaxed">
                Room <span className="font-bold text-white">302</span> is already booked for <span className="font-bold text-white">CS-102</span> on Tuesdays at 10:00.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-[#111318] via-[#111318] to-transparent pointer-events-none">
          <button 
            disabled
            className="pointer-events-auto w-full py-4 bg-slate-700 text-slate-500 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed opacity-80 border border-slate-600 transition-all"
          >
            <span className="material-symbols-outlined text-xl">save</span>
            Save Schedule Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddScheduleItemView;
