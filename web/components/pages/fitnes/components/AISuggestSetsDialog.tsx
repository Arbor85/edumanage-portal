import React, { useState } from 'react';
import { suggestExerciseSets } from '../../../../services/chatgptService';
import { ExerciseSet } from '../workoutTypes';

type AISuggestSetsDialogProps = {
  open: boolean;
  exerciseName: string;
  onClose: () => void;
  onSetsGenerated: (sets: ExerciseSet[]) => void;
};

const AISuggestSetsDialog: React.FC<AISuggestSetsDialogProps> = ({
  open,
  exerciseName,
  onClose,
  onSetsGenerated
}) => {
  const [maxWeight, setMaxWeight] = useState('');
  const [maxReps, setMaxReps] = useState('');
  const [progressionForm, setProgressionForm] = useState<'strength' | 'hypertrophy' | 'endurance'>('hypertrophy');
  const [progressionType, setProgressionType] = useState<'progressive' | 'static' | 'degrading'>('static');
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!maxWeight.trim() || !maxReps.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const previousWeights = `Max: ${maxWeight} for ${maxReps} reps. Progression type: ${progressionType}. Calculate warmup and working weights based on this.`;
      
      const suggestion = await suggestExerciseSets({
        exerciseName,
        userLevel,
        goalType: progressionForm,
        previousWeights,
        progressionType
      });

      if (suggestion.suggestedSets && suggestion.suggestedSets.length > 0) {
        onSetsGenerated(suggestion.suggestedSets);
        onClose();
      } else {
        setError('No suggestions returned from AI');
      }
    } catch (err) {
      console.error('AI suggestion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-border-dark overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              <h2 className="text-lg font-bold">AI Set Generator</h2>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="hover:bg-white/20 rounded-lg p-1 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="text-sm text-purple-100 mt-2">Generate optimal sets for {exerciseName}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Max Weight */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Max Weight (include units: kg or lbs) *
            </label>
            <div className="relative">
              <input
                type="text"
                value={maxWeight}
                onChange={(e) => setMaxWeight(e.target.value)}
                placeholder="e.g., 100kg or 225lbs"
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-border-dark bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-lg">
                fitness_center
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your best lift with units (e.g., "100kg" or "225lbs")
            </p>
          </div>

          {/* Max Reps */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Max Reps at that weight *
            </label>
            <input
              type="number"
              value={maxReps}
              onChange={(e) => setMaxReps(e.target.value)}
              placeholder="e.g., 1, 5, 10"
              min="1"
              max="50"
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-border-dark bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* User Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Your Training Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUserLevel(level)}
                  disabled={isLoading}
                  className={`
                    px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all
                    ${userLevel === level
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Progression Form */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Training Goal
            </label>
            <div className="space-y-2">
              {([
                { value: 'strength', label: 'Strength', desc: 'Low reps, heavy weight, long rest', icon: 'military_tech' },
                { value: 'hypertrophy', label: 'Hypertrophy', desc: 'Moderate reps & weight, muscle growth', icon: 'fitness_center' },
                { value: 'endurance', label: 'Endurance', desc: 'High reps, lighter weight, short rest', icon: 'timer' }
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setProgressionForm(option.value)}
                  disabled={isLoading}
                  className={`
                    w-full p-3 rounded-lg border-2 transition-all text-left
                    ${progressionForm === option.value
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-slate-200 dark:border-border-dark hover:border-purple-300 dark:hover:border-purple-700'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-2xl ${
                      progressionForm === option.value ? 'text-purple-600' : 'text-slate-400'
                    }`}>
                      {option.icon}
                    </span>
                    <div className="flex-1">
                      <div className={`text-sm font-bold ${
                        progressionForm === option.value ? 'text-purple-600' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {option.desc}
                      </div>
                    </div>
                    {progressionForm === option.value && (
                      <span className="material-symbols-outlined text-purple-600">check_circle</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Progression Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Set Progression Type
            </label>
            <div className="space-y-2">
              {([
                { value: 'progressive', label: 'Progressive', desc: 'Increase weight each set (pyramid up)', icon: 'trending_up' },
                { value: 'static', label: 'Static', desc: 'Same weight across all working sets', icon: 'drag_handle' },
                { value: 'degrading', label: 'Degrading', desc: 'Decrease weight each set (drop sets)', icon: 'trending_down' }
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setProgressionType(option.value)}
                  disabled={isLoading}
                  className={`
                    w-full p-3 rounded-lg border-2 transition-all text-left
                    ${progressionType === option.value
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-border-dark hover:border-blue-300 dark:hover:border-blue-700'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-2xl ${
                      progressionType === option.value ? 'text-blue-600' : 'text-slate-400'
                    }`}>
                      {option.icon}
                    </span>
                    <div className="flex-1">
                      <div className={`text-sm font-bold ${
                        progressionType === option.value ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {option.desc}
                      </div>
                    </div>
                    {progressionType === option.value && (
                      <span className="material-symbols-outlined text-blue-600">check_circle</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <span className="material-symbols-outlined text-red-600 text-lg flex-shrink-0">error</span>
              <p className="text-xs text-red-700 dark:text-red-400 font-semibold">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-border-dark text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  <span>Generate Sets</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AISuggestSetsDialog;
