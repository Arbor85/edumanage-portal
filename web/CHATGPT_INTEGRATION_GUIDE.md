# Integrating AI Suggest Button into Workout Components

This guide shows how to integrate the AI Suggest functionality into your existing workout components.

## Quick Integration into ExerciseSetsList Component

### Step 1: Import the AISuggestButton

Add this import to your `ExerciseSetsList.tsx`:

```typescript
import AISuggestButton from './AISuggestButton';
import { ExerciseSet } from '../workoutTypes';
```

### Step 2: Add Handler Function

Add this function inside your `ExerciseSetsList` component:

```typescript
const handleAISetsGenerated = (suggestedSets: ExerciseSet[], reasoning?: string) => {
  // Clear existing sets first (optional)
  // Or just add the suggested sets to existing ones
  
  suggestedSets.forEach((suggestedSet, index) => {
    if (index < exercise.sets.length) {
      // Update existing set
      onUpdateSet(dayId, exerciseIndex, index, 'type', suggestedSet.type);
      onUpdateSet(dayId, exerciseIndex, index, 'weight', suggestedSet.weight);
      onUpdateSet(dayId, exerciseIndex, index, 'reps', suggestedSet.reps);
      if (suggestedSet.restTimeSeconds !== undefined) {
        onUpdateSet(dayId, exerciseIndex, index, 'restTimeSeconds', suggestedSet.restTimeSeconds);
      }
    } else {
      // Add new set, then update it
      onAddSet(dayId, exerciseIndex);
      // Note: You'll need to update the newly added set in the next render
      // Consider using a useEffect or callback to handle this
    }
  });

  // Optionally show reasoning to user
  if (reasoning) {
    console.log('AI Reasoning:', reasoning);
    // Or show in a toast/notification
  }
};
```

### Step 3: Add Button to UI

Place the button where you want it to appear. Good locations:

**Option A: At the top of the sets list (header area)**
```tsx
<div className="flex items-center justify-between mb-3">
  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
    Sets ({exercise.sets.length})
  </h4>
  <AISuggestButton
    exerciseName={exercise.name}
    userLevel="intermediate"  // Get from user profile/context
    goalType="hypertrophy"   // Get from workout plan or user preferences
    onSetsGenerated={handleAISetsGenerated}
    size="sm"
  />
</div>
```

**Option B: At the bottom with "Add Set" button**
```tsx
<div className="flex gap-2 mt-3">
  <button
    onClick={() => onAddSet(dayId, exerciseIndex)}
    className="flex-1 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
  >
    <span className="material-symbols-outlined text-lg">add_circle</span>
    Add Set
  </button>
  
  <AISuggestButton
    exerciseName={exercise.name}
    onSetsGenerated={handleAISetsGenerated}
    size="sm"
    className="flex-1"
  />
</div>
```

## Example: Integration in Split Planner

### File: `components/pages/fitnes/SplitPlanner.tsx`

```tsx
import AISuggestButton from './components/AISuggestButton';
import { suggestWorkoutDay } from '../../../services/chatgptService';

// Inside your component:
const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);

const handleGenerateAIWorkout = async (dayId: string, targetMuscles: string[]) => {
  setIsGeneratingWorkout(true);
  
  try {
    const exercises = await suggestWorkoutDay(
      targetMuscles,
      'intermediate',
      'hypertrophy'
    );

    // Update the day with AI-generated exercises
    const updatedDay = workoutDays.find(d => d.id === dayId);
    if (updatedDay) {
      exercises.forEach(exercise => {
        addExercise(dayId, exercise);
      });
    }
  } catch (error) {
    console.error('Failed to generate workout:', error);
  } finally {
    setIsGeneratingWorkout(false);
  }
};

// In your JSX:
<div className="flex justify-between items-center mb-4">
  <h2 className="text-lg font-bold">Exercises for {currentDay.label}</h2>
  
  <button
    onClick={() => handleGenerateAIWorkout(currentDay.id, ['chest', 'triceps'])}
    disabled={isGeneratingWorkout}
    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg flex items-center gap-2"
  >
    <span className="material-symbols-outlined">auto_awesome</span>
    {isGeneratingWorkout ? 'Generating...' : 'Generate AI Workout'}
  </button>
</div>
```

## Example: Add to Exercise Selection Dialog

### File: `components/pages/fitnes/components/ExerciseSelectDialog.tsx`

```tsx
import { useState } from 'react';
import { getExerciseInfo } from '../../../../services/chatgptService';

// Inside your component:
const [exerciseInfo, setExerciseInfo] = useState<{
  description: string;
  tips: string[];
  commonMistakes: string[];
} | null>(null);

const handleShowExerciseDetails = async (exerciseName: string) => {
  try {
    const info = await getExerciseInfo(exerciseName);
    setExerciseInfo(info);
  } catch (error) {
    console.error('Failed to get exercise info:', error);
  }
};

// In your exercise list:
<div className="exercise-item">
  <span>{exercise.name}</span>
  <button
    onClick={() => handleShowExerciseDetails(exercise.name)}
    className="text-purple-600 hover:text-purple-700"
  >
    <span className="material-symbols-outlined">info</span>
  </button>
</div>

// Show the info in a modal/tooltip:
{exerciseInfo && (
  <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
    <h3 className="font-bold mb-2">{exerciseName}</h3>
    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
      {exerciseInfo.description}
    </p>
    
    <h4 className="font-semibold text-sm mb-1">Tips:</h4>
    <ul className="list-disc pl-5 mb-3 text-sm space-y-1">
      {exerciseInfo.tips.map((tip, i) => (
        <li key={i}>{tip}</li>
      ))}
    </ul>
    
    <h4 className="font-semibold text-sm mb-1 text-amber-600">Common Mistakes:</h4>
    <ul className="list-disc pl-5 text-sm space-y-1">
      {exerciseInfo.commonMistakes.map((mistake, i) => (
        <li key={i} className="text-amber-700 dark:text-amber-500">{mistake}</li>
      ))}
    </ul>
  </div>
)}
```

## Handling User Preferences

Create a context or hook for user workout preferences:

### File: `hooks/useWorkoutPreferences.ts`

```typescript
import { useState, useEffect } from 'react';

export type WorkoutPreferences = {
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  goalType: 'strength' | 'hypertrophy' | 'endurance';
  preferredRestTime: number;
};

export const useWorkoutPreferences = () => {
  const [preferences, setPreferences] = useState<WorkoutPreferences>({
    userLevel: 'intermediate',
    goalType: 'hypertrophy',
    preferredRestTime: 90
  });

  useEffect(() => {
    // Load from localStorage or user profile
    const saved = localStorage.getItem('workoutPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const updatePreferences = (updates: Partial<WorkoutPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    localStorage.setItem('workoutPreferences', JSON.stringify(newPreferences));
  };

  return { preferences, updatePreferences };
};
```

Then use it in your components:

```tsx
import { useWorkoutPreferences } from '../../../hooks/useWorkoutPreferences';

const MyWorkoutComponent = () => {
  const { preferences } = useWorkoutPreferences();

  return (
    <AISuggestButton
      exerciseName={exercise.name}
      userLevel={preferences.userLevel}
      goalType={preferences.goalType}
      onSetsGenerated={handleAISetsGenerated}
    />
  );
};
```

## Advanced Features

### 1. Batch Generate Sets for All Exercises

```typescript
const handleGenerateAllSets = async () => {
  setIsGenerating(true);
  
  try {
    for (const [index, exercise] of workoutDay.exercises.entries()) {
      const suggestion = await suggestExerciseSets({
        exerciseName: exercise.name,
        userLevel: preferences.userLevel,
        goalType: preferences.goalType
      });
      
      // Update the exercise with suggested sets
      updateExerciseSets(workoutDay.id, index, suggestion.suggestedSets);
      
      // Add delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('Batch generation failed:', error);
  } finally {
    setIsGenerating(false);
  }
};
```

### 2. Smart Suggestions Based on Previous Workouts

```typescript
import { getWorkoutHistory } from '../../../services/workoutHistoryService';

const getSuggestionsWithHistory = async (exerciseName: string) => {
  // Get user's previous performance for this exercise
  const history = await getWorkoutHistory(userId, exerciseName);
  
  const lastWeight = history.length > 0 
    ? history[0].sets[0]?.weight 
    : undefined;

  const suggestion = await suggestExerciseSets({
    exerciseName,
    userLevel: preferences.userLevel,
    goalType: preferences.goalType,
    previousWeights: lastWeight // AI will use this for progressive overload
  });

  return suggestion;
};
```

### 3. A/B Test AI vs Manual

Track whether users prefer AI suggestions or manual entry:

```typescript
const trackSuggestionUsage = (exerciseName: string, used: boolean) => {
  // Send analytics
  analytics.track('AI_Suggestion', {
    exercise: exerciseName,
    used: used,
    userLevel: preferences.userLevel,
    timestamp: new Date().toISOString()
  });
};
```

## Styling Tips

The AISuggestButton uses a purple-to-blue gradient. You can customize it:

```tsx
<AISuggestButton
  // ... props
  className="my-custom-class !bg-gradient-to-r !from-emerald-600 !to-teal-600"
/>
```

Or create a variant prop in the component for different themes.

## Testing the Integration

1. **Test without API key**: Verify fallback suggestions work
2. **Test with invalid exercise names**: Ensure graceful error handling
3. **Test rapid clicks**: Prevent multiple simultaneous API calls
4. **Test with slow network**: Show appropriate loading states
5. **Test error scenarios**: API errors, network errors, rate limits

## Performance Optimization

1. **Cache results** - Don't re-fetch for the same exercise
2. **Debounce** - Wait for user to stop typing before suggesting
3. **Lazy load** - Only import the service when needed
4. **Request batching** - Combine multiple requests when possible
