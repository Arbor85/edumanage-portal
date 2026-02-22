
import React from 'react';
import { Room, AppView } from '../types';
import { mockRooms } from '../services/mockData';

interface RoomsViewProps {
  onEditRoom: (roomId: string) => void;
}

const RoomsView: React.FC<RoomsViewProps> = ({ onEditRoom }) => {
  return (
    <div className="p-4 space-y-6">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
        </div>
        <input 
          className="block w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-[#282e39] border-none rounded-xl text-sm focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#111318] transition-all placeholder:text-slate-500 dark:placeholder:text-[#9da6b9]" 
          placeholder="Search rooms, buildings..." 
          type="text"
        />
      </div>

      <section className="flex gap-2 overflow-x-auto no-scrollbar items-center">
        <button className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold bg-primary text-white border border-primary/20">All Rooms</button>
        <button className="shrink-0 px-4 py-2 rounded-full text-xs font-medium bg-white dark:bg-[#282e39] border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">Lecture Halls</button>
        <button className="shrink-0 px-4 py-2 rounded-full text-xs font-medium bg-white dark:bg-[#282e39] border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">Computer Labs</button>
        <button className="shrink-0 px-4 py-2 rounded-full text-xs font-medium bg-white dark:bg-[#282e39] border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">Capacity: 50+</button>
      </section>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Room Listing ({mockRooms.length})</h3>
        <span className="material-symbols-outlined text-slate-400 text-lg">swap_vert</span>
      </div>

      <div className="space-y-3">
        {mockRooms.map((room) => (
          <div 
            key={room.id}
            onClick={() => onEditRoom(room.id)}
            className="p-4 bg-white dark:bg-[#1a1f2b] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-lg">{room.name}</h4>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-sm leading-none">location_on</span>
                  <span>{room.location}</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                room.status === 'Analyzed' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                room.status === 'Active' ? 'bg-primary/10 text-primary border-primary/20' :
                'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}>
                {room.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-lg">group</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase">Size</span>
                  <span className="text-sm font-semibold leading-tight">{room.size}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-lg">psychology</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase">Purpose</span>
                  <span className="text-sm font-semibold leading-tight">{room.purpose}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="relative overflow-hidden rounded-xl h-48 border border-slate-200 dark:border-slate-800 mt-6 group cursor-pointer">
          <img className="w-full h-full object-cover grayscale opacity-50 dark:opacity-30 group-hover:scale-105 transition-transform duration-700" src="https://picsum.photos/800/400?grayscale" alt="Map View"/>
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent flex flex-col justify-end p-6">
            <h4 className="text-white font-bold text-lg leading-none">Campus Map View</h4>
            <p className="text-slate-300 text-sm mt-1">Locate and manage rooms spatially</p>
            <button className="mt-4 w-max bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors">
              Explore Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsView;
