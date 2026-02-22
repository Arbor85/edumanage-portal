import React from 'react';
import { WorkoutHistoryItem, WorkoutSet } from '../../../../services/workoutHistoryService';

interface WorkoutDetailsDialogProps {
  isOpen: boolean;
  workout: WorkoutHistoryItem | null;
  onClose: () => void;
}

const formatDuration = (minutes: number) => {
  if (!Number.isFinite(minutes)) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
};

const formatVolume = (value: number) => {
  if (!Number.isFinite(value)) return '0 KG';
  return `${value.toLocaleString('en-US')} KG`;
};

const WorkoutDetailsDialog: React.FC<WorkoutDetailsDialogProps> = ({ isOpen, workout, onClose }) => {
  if (!isOpen || !workout) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 w-full mx-4 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto md:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{workout.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Workout Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-3 text-center">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Duration</p>
              <p className="text-sm font-bold text-primary">{formatDuration(workout.duration_minutes)}</p>
            </div>
            <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-3 text-center">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Volume</p>
              <p className="text-sm font-bold text-primary">{formatVolume(workout.volume_kg)}</p>
            </div>
            <div className="rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-3 text-center">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Sets</p>
              <p className="text-sm font-bold text-primary">{workout.sets}</p>
            </div>
          </div>

          {/* Date & Time Info */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Date</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {new Date(workout.workout_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            {workout.start_time && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Start Time</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {new Date(workout.start_time).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Exercises */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">Exercises</h3>
            {workout.workout_sets.length > 0 ? (
              Object.entries(
                workout.workout_sets.reduce(
                  (grouped, set) => {
                    const key = set.exercise_title || 'Exercise';
                    if (!grouped[key]) {
                      grouped[key] = [];
                    }
                    grouped[key].push(set);
                    return grouped;
                  },
                  {} as Record<string, WorkoutSet[]>
                )
              ).map(([exerciseTitle, sets]: [string, WorkoutSet[]]) => (
                <div key={exerciseTitle} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                  <div className="font-semibold text-slate-900 dark:text-white">{exerciseTitle}</div>
                  <div className="space-y-2">
                    {sets.map((set, idx) => (
                      <div
                        key={`${exerciseTitle}-${set.set_index}-${idx}`}
                        className="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-800 p-2 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                            Set {set.set_index + 1}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">
                            {set.weight_kg !== null ? `${set.weight_kg} kg` : 'Bodyweight'}
                            {set.reps !== null ? ` x ${set.reps}` : ''}
                          </span>
                        </div>
                        <span className="text-xs uppercase text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                          {set.set_type || 'normal'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">No exercises recorded</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailsDialog;
