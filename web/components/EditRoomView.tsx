
import React from 'react';

interface EditRoomViewProps {
  roomId: string;
  onBack: () => void;
  onSave: () => void;
}

const EditRoomView: React.FC<EditRoomViewProps> = ({ roomId, onBack, onSave }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-32">
      <header className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={onBack} className="flex items-center justify-center p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold tracking-tight">Edit ClassRoom</h1>
          <button onClick={onSave} className="flex items-center justify-center p-2 rounded-full text-primary hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-2xl font-bold">check</span>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">Room Identification</h2>
          <div className="bg-white dark:bg-[#1c2331] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Room Name</label>
              <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-base" type="text" defaultValue="Advanced Physics Lab"/>
            </div>
            <div className="grid grid-cols-2">
              <div className="p-4 border-r border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Room Number</label>
                <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-base" type="text" defaultValue="B-402"/>
              </div>
              <div className="p-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Building</label>
                <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-base" type="text" defaultValue="Science Center"/>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="bg-white dark:bg-[#1c2331] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Unit / Department Name</label>
              <input className="w-full bg-transparent border-none p-0 focus:ring-0 text-base" type="text" defaultValue="Faculty of Physical Sciences"/>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Size (Capacity)</label>
                <span className="text-base font-medium">45 Students</span>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="px-4 font-bold text-lg">45</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">Equipment & Amenities</h2>
          <div className="bg-white dark:bg-[#1c2331] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex flex-wrap gap-2 mb-3">
              {['Projector 4K', 'Smart Board', 'Wi-Fi 6', 'Sound System'].map(tag => (
                <div key={tag} className="inline-flex items-center gap-1.5 bg-primary/20 text-primary px-3 py-1.5 rounded-full text-sm font-medium border border-primary/30">
                  {tag}
                  <span className="material-symbols-outlined text-sm cursor-pointer">close</span>
                </div>
              ))}
            </div>
            <div className="relative">
              <input className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Add equipment..." type="text"/>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">add_circle</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-[60]">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          <button onClick={onBack} className="h-14 rounded-xl font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button onClick={onSave} className="h-14 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all">
            Save Changes
          </button>
        </div>
      </footer>
    </div>
  );
};

export default EditRoomView;
