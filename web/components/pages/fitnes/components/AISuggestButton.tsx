import React, { useState } from 'react';
import { suggestExerciseSets, ExerciseSuggestionRequest } from '../../../../services/chatgptService';
import { ExerciseSet } from '../workoutTypes';

type AISuggestButtonProps = {
  exerciseName: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  goalType?: 'strength' | 'hypertrophy' | 'endurance';
  onSetsGenerated: (sets: ExerciseSet[], reasoning?: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const AISuggestButton: React.FC<AISuggestButtonProps> = ({
  exerciseName,
  userLevel = 'intermediate',
  goalType = 'hypertrophy',
  onSetsGenerated,
  className = '',
  size = 'md'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [lastReasoning, setLastReasoning] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl'
  };

  const handleSuggest = async () => {
    if (!exerciseName.trim()) {
      setError('Please enter an exercise name first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: ExerciseSuggestionRequest = {
        exerciseName,
        userLevel: userLevel as 'beginner' | 'intermediate' | 'advanced',
        goalType: goalType as 'strength' | 'hypertrophy' | 'endurance'
      };

      const suggestion = await suggestExerciseSets(request);

      if (suggestion.suggestedSets && suggestion.suggestedSets.length > 0) {
        onSetsGenerated(suggestion.suggestedSets, suggestion.reasoning);
        setLastReasoning(suggestion.reasoning || null);
        
        // Show reasoning tooltip briefly
        if (suggestion.reasoning) {
          setShowReasoning(true);
          setTimeout(() => setShowReasoning(false), 5000);
        }
      } else {
        setError('No suggestions returned');
      }
    } catch (err) {
      console.error('AI suggestion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleSuggest}
        disabled={isLoading || !exerciseName.trim()}
        className={`
          bg-gradient-to-r from-purple-600 to-blue-600 
          hover:from-purple-700 hover:to-blue-700
          disabled:from-gray-400 disabled:to-gray-500
          disabled:cursor-not-allowed
          text-white font-medium rounded-lg
          transition-all duration-200
          flex items-center gap-2
          shadow-md hover:shadow-lg
          ${sizeClasses[size]}
          ${className}
        `}
        title="Get AI-powered set and rep suggestions"
      >
        <span className={`material-symbols-outlined ${iconSizes[size]} ${isLoading ? 'animate-spin' : ''}`}>
          {isLoading ? 'progress_activity' : 'auto_awesome'}
        </span>
        <span>{isLoading ? 'Generating...' : 'AI Suggest'}</span>
      </button>

      {/* Error tooltip */}
      {error && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-red-600 text-white text-xs p-2 rounded shadow-lg z-10 animate-slide-in">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-sm flex-shrink-0">error</span>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto flex-shrink-0 hover:bg-red-700 rounded p-0.5"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Reasoning tooltip */}
      {showReasoning && lastReasoning && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-slate-800 text-white text-xs p-3 rounded shadow-xl z-10 animate-slide-in border border-purple-500/30">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-sm text-purple-400 flex-shrink-0">lightbulb</span>
            <div className="flex-1">
              <p className="font-semibold mb-1 text-purple-300">AI Reasoning:</p>
              <p className="text-slate-300 leading-relaxed">{lastReasoning}</p>
            </div>
            <button
              onClick={() => setShowReasoning(false)}
              className="flex-shrink-0 hover:bg-slate-700 rounded p-0.5"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestButton;
