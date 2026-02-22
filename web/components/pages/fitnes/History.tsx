import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getWorkoutHistory,
  WorkoutHistoryItem,
  WorkoutHistoryPage,
  WorkoutSet
} from '../../../services/workoutHistoryService';
import { getTrainingPlans, TrainingPlan } from '../../../services/trainingPlanService';
import { useAuth } from '../../../contexts/AuthContext';
import WorkoutDetailsDialog from './components/WorkoutDetailsDialog';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<WorkoutHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutHistoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [hasActiveWorkout, setHasActiveWorkout] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const canLoadMore = totalPages === 0 || page < totalPages;

  const fetchFirstPage = useCallback((signal?: AbortSignal) => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = (await getWorkoutHistory({ page: 1, pageSize: 10, signal })) as WorkoutHistoryPage;
        setItems(data.items);
        setPage(data.page);
        setTotalPages(data.total_pages);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError('Unable to load workout history.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    if (!user?.sub) return;
    
    const loadPlans = async () => {
      try {
        const plans = await getTrainingPlans(undefined, undefined, user.sub);
        setTrainingPlans(plans);
      } catch (err) {
        console.error('Failed to load training plans', err);
      }
    };
    
    void loadPlans();
  }, [user?.sub]);

  useEffect(() => {
    const controller = new AbortController();
    fetchFirstPage(controller.signal);
    return () => controller.abort();
  }, [fetchFirstPage]);

  useEffect(() => {
    // Check if there's an active workout in progress
    if (typeof window !== 'undefined') {
      const savedState = window.localStorage.getItem('activeWorkout.state');
      setHasActiveWorkout(!!savedState);
    }
  }, []);

  const handleLoadMore = async () => {
    if (isLoadingMore || !canLoadMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const data = (await getWorkoutHistory({ page: nextPage, pageSize: 10 })) as WorkoutHistoryPage;
      setItems((prev) => [...prev, ...data.items]);
      setPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError('Unable to load more history.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const groupedByMonth = useMemo(() => {
    const workoutsByDate = new Map<string, WorkoutHistoryItem[]>();
    
    items.forEach((item) => {
      // Parse date as local time without timezone conversion
      const dateKey = item.workout_date.split('T')[0];
      
      if (!workoutsByDate.has(dateKey)) {
        workoutsByDate.set(dateKey, []);
      }
      workoutsByDate.get(dateKey)?.push(item);
    });
    
    return workoutsByDate;
  }, [items]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convert to Monday-first (0=Monday, 6=Sunday)
    return day === 0 ? 6 : day - 1;
  };

  const monthDays = useMemo(() => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getPlansForDate = (day: number | null): TrainingPlan[] => {
    if (!day) return [];
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const weekdayNumber = date.getDay();
    
    // Array of day abbreviations in JavaScript order (0=Sunday, 1=Monday, etc)
    // Must match the format used when creating plans ('Mon', 'Tue', 'Wed', etc)
    const dayAbbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayAbbr = dayAbbreviations[weekdayNumber];
    
    // Filter plans that include this day of the week
    return trainingPlans.filter(plan => 
      plan.days_of_week && plan.days_of_week.includes(dayAbbr)
    );
  };

  const toggleExpandDay = (dateStr: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateStr)) {
      newExpanded.delete(dateStr);
    } else {
      newExpanded.add(dateStr);
    }
    setExpandedDays(newExpanded);
  };

  const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="px-4 pt-6 space-y-8 pb-24 text-slate-900 dark:text-slate-100">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          <h1 className="text-xl font-bold tracking-tight">Workout History</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isLoading}
            className="p-2 rounded-full bg-slate-900/5 dark:bg-white/5 disabled:opacity-60"
            aria-label="Previous month"
          >
            <span className="material-symbols-outlined text-primary">chevron_left</span>
          </button>
          <div className="flex items-center px-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[140px] text-center">
              {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={isLoading}
            className="p-2 rounded-full bg-slate-900/5 dark:bg-white/5 disabled:opacity-60"
            aria-label="Next month"
          >
            <span className="material-symbols-outlined text-primary">chevron_right</span>
          </button>
          <button
            type="button"
            onClick={() => fetchFirstPage()}
            disabled={isLoading}
            className="p-2 rounded-full bg-slate-900/5 dark:bg-white/5 disabled:opacity-60"
            aria-label="Refresh history"
          >
            <span className="material-symbols-outlined text-primary">refresh</span>
          </button>
        </div>
      </header>

      {hasActiveWorkout && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">schedule</span>
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Active Workout in Progress</p>
              <p className="text-xs text-amber-800 dark:text-amber-200">You have an unfinished workout session</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/active-workout')}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm whitespace-nowrap transition-colors"
          >
            Resume
          </button>
        </div>
      )}

      {isLoading && (
        <div className="text-xs font-semibold text-slate-400 px-1">Loading history...</div>
      )}
      {!isLoading && error && (
        <div className="text-xs font-semibold text-red-500 px-1">{error}</div>
      )}
      {!isLoading && !error && groupedByMonth.size === 0 && (
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 p-8 text-center space-y-4">
          <div className="flex justify-center">
            <span className="material-symbols-outlined text-5xl text-primary">fitness_center</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ready to start your fitness journey?</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">You haven't recorded any workouts yet. Begin your first workout to track your progress and build your fitness history.</p>
          </div>
          <Link
            to="/active-workout"
            className="inline-block mt-4 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-colors"
          >
            Start Your First Workout
          </Link>
        </div>
      )}
      
      {!isLoading && !error && groupedByMonth.size > 0 && (
        <div className="space-y-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-bold text-slate-600 dark:text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day, index) => {
              // Format date as YYYY-MM-DD without timezone conversion
              const dateStr = day ? 
                `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` 
                : null;
              const workouts = dateStr ? (groupedByMonth.get(dateStr) || []) : [];
              
              // Check if date is in the past
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              const isPastOrToday = dateStr ? dateStr <= todayStr : false;
              
              // Get plans for this date (today and future only)
              const plansForDate = isPastOrToday && dateStr === todayStr ? getPlansForDate(day) : (dateStr && !isPastOrToday ? getPlansForDate(day) : []);
              
              const hasContent = workouts.length > 0 || plansForDate.length > 0;
              
              return (
                <div
                  key={`${index}-${day}`}
                  className={`rounded-lg border min-h-[120px] flex flex-col p-3 ${
                    day === null
                      ? 'border-transparent bg-slate-50 dark:bg-slate-900/20'
                      : hasContent
                      ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30'
                  }`}
                >
                  {day !== null && (
                    <>
                      <div className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                        {day}
                      </div>
                      
                      {hasContent ? (
                        <div className="space-y-2 flex-1">
                          {/* Display completed workouts (limited to 2 unless expanded) */}
                          {workouts
                            .slice(0, expandedDays.has(dateStr!) ? undefined : 2)
                            .map((workout) => (
                            <div
                              key={`workout-${workout.id}`}
                              onClick={() => {
                                setSelectedWorkout(workout);
                                setIsDialogOpen(true);
                              }}
                              className="bg-white dark:bg-slate-800 rounded-lg border border-primary/20 p-2 text-xs cursor-pointer hover:border-primary/40 transition-colors"
                            >
                              <div className="font-semibold text-slate-900 dark:text-white truncate">
                                {workout.title}
                              </div>
                              <div className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">timer</span>
                                {formatDuration(workout.duration_minutes)}
                              </div>
                              <div className="text-slate-600 dark:text-slate-300 text-[11px] flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">weight</span>
                                {formatVolume(workout.volume_kg)}
                              </div>
                            </div>
                          ))}
                          
                          {/* Show expand button if more than 2 workouts */}
                          {workouts.length > 2 && !expandedDays.has(dateStr!) && (
                            <button
                              onClick={() => toggleExpandDay(dateStr!)}
                              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                              +{workouts.length - 2} more
                            </button>
                          )}
                          
                          {/* Show collapse button if expanded and more than 2 */}
                          {workouts.length > 2 && expandedDays.has(dateStr!) && (
                            <button
                              onClick={() => toggleExpandDay(dateStr!)}
                              className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                              Show less
                            </button>
                          )}
                          
                          {/* Display scheduled plans */}
                          {plansForDate.map((plan) => (
                            <button
                              key={`plan-${plan.id}`}
                              onClick={() => navigate('/active-workout', { state: { planId: plan.id, planName: plan.name } })}
                              className="w-full bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 rounded-lg p-2 text-xs hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors text-left"
                            >
                              <div className="font-semibold text-blue-900 dark:text-blue-100 truncate">
                                {plan.name}
                              </div>
                              <div className="text-blue-700 dark:text-blue-300 text-[11px] mt-1">
                                📋 Start Workout
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : isPastOrToday ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-1">
                          <div className="text-lg">😔</div>
                          <span className="text-xs text-slate-400 dark:text-slate-500">No workout</span>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!isLoading && !error && canLoadMore && groupedByMonth.size > 0 && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="w-full py-4 rounded-2xl bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-border-dark text-slate-600 dark:text-slate-200 text-xs font-bold uppercase tracking-wider disabled:opacity-60"
        >
          {isLoadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}

      {/* Workout Details Dialog */}
      <WorkoutDetailsDialog 
        isOpen={isDialogOpen} 
        workout={selectedWorkout} 
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
};

const formatDuration = (minutes: number) => {
  if (!Number.isFinite(minutes)) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
};

const formatDate = (dateValue: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  const day = date.toLocaleString('en-US', { day: '2-digit' });
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const weekday = date.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
  return `${month} ${day} • ${weekday}`;
};

const formatVolume = (value: number) => {
  if (!Number.isFinite(value)) return '0 KG';
  return `${value.toLocaleString('en-US')} KG`;
};

const WorkoutLogCard: React.FC<{ title: string; date: string; time: number; volume: number; sets: number; workoutSets: WorkoutHistoryItem['workout_sets'] }> = ({ title, date, time, volume, sets, workoutSets }) => {
  const formattedDate = formatDate(date);
  const formattedDuration = formatDuration(time);
  const formattedVolume = formatVolume(volume);

  return (
  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/5 overflow-hidden shadow-2xl text-white">
    <div className="p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{formattedDate}</span>
          <h3 className="text-lg font-bold text-white mt-1">{title}</h3>
        </div>
        <div className="flex items-center gap-1 text-primary text-sm font-bold bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
          <span className="material-symbols-outlined text-[16px]">timer</span>
          {formattedDuration}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-black/30 rounded-2xl p-3 border border-white/5">
          <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Total Volume</p>
          <p className="text-xl font-black text-primary tracking-tight">{formattedVolume}</p>
        </div>
        <div className="bg-black/30 rounded-2xl p-3 border border-white/5">
          <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Duration</p>
          <p className="text-xl font-black text-primary tracking-tight">
            {formattedDuration}
          </p>
        </div>
      </div>
      <details className="group">
        <summary className="flex items-center justify-between cursor-pointer list-none pt-3 border-t border-white/5">
          <span className="text-sm font-semibold text-slate-300">View Exercises</span>
          <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-primary">expand_more</span>
        </summary>
        <div className="py-4 space-y-4">
          <div className="flex justify-between text-sm opacity-70"><span>Total Sets</span><span>{sets}</span></div>
          <div className="space-y-3">
            {Object.entries(
              workoutSets.reduce(
                (grouped, workoutSet) => {
                  const key = workoutSet.exercise_title || 'Exercise';
                  if (!grouped[key]) {
                    grouped[key] = [];
                  }
                  grouped[key].push(workoutSet);
                  return grouped;
                },
                {} as Record<string, WorkoutSet[]>
              )
            ).map(([exerciseTitle, exerciseSets]: [string, WorkoutSet[]]) => (
              <div key={exerciseTitle} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs">
                <div className="flex items-center justify-between text-sm font-semibold text-white">
                  <span>{exerciseTitle}</span>
                  <span className="text-[10px] uppercase tracking-widest text-primary">{exerciseSets.length} sets</span>
                </div>
                <div className="mt-3 space-y-2 text-[11px] text-slate-300">
                  {exerciseSets.map((workoutSet, index) => {
                    const note = workoutSet.exercise_notes?.trim();
                    const weight = workoutSet.weight_kg !== null ? `${workoutSet.weight_kg} kg` : 'Bodyweight';
                    const weightAndReps = workoutSet.reps !== null ? `${weight} x ${workoutSet.reps} reps` : weight;
                    return (
                      <div key={`${exerciseTitle}-${workoutSet.set_index}-${index}`} className="rounded-xl border border-white/5 bg-black/20 px-3 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-primary">
                            {workoutSet.set_type || 'normal'}
                          </span>
                          <span>{weightAndReps}</span>
                          {workoutSet.superset_id !== null && (
                            <span>Superset {workoutSet.superset_id}</span>
                          )}
                        </div>
                        {note && <div className="mt-2 text-[11px] text-slate-400">{note}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  </div>
  );
};

export default History;
