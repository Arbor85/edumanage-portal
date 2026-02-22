# ChatGPT Service - Usage Examples

The ChatGPT service provides AI-powered workout suggestions and exercise guidance.

## Setup

1. Add your OpenAI API key to `.env`:
```env
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

2. Import the service:
```typescript
import { 
  suggestExerciseSets, 
  suggestWorkoutDay,
  getExerciseInfo 
} from '../services/chatgptService';
```

## Example 1: Suggest Sets for a Single Exercise

```typescript
import { suggestExerciseSets } from '../services/chatgptService';

const handleSuggestSets = async () => {
  try {
    const suggestion = await suggestExerciseSets({
      exerciseName: 'Bench Press',
      userLevel: 'intermediate',
      targetMuscle: 'chest',
      previousWeights: '185 lbs',
      goalType: 'hypertrophy'
    });

    console.log('Suggested sets:', suggestion.suggestedSets);
    console.log('Reasoning:', suggestion.reasoning);
    
    // Use the suggested sets to populate your exercise
    const newExercise: ExerciseEntry = {
      name: suggestion.exerciseName,
      sets: suggestion.suggestedSets,
      restTimeSeconds: suggestion.restTimeSeconds
    };
    
  } catch (error) {
    console.error('Failed to get suggestions:', error);
  }
};
```

## Example 2: Auto-Populate Sets When Adding Exercise

```typescript
// In your exercise selection component:
const handleExerciseSelect = async (exerciseName: string) => {
  setIsLoading(true);
  
  try {
    // Get AI-suggested sets
    const suggestion = await suggestExerciseSets({
      exerciseName,
      userLevel: userProfile.level, // 'beginner' | 'intermediate' | 'advanced'
      goalType: currentGoal, // 'strength' | 'hypertrophy' | 'endurance'
    });

    // Add exercise with suggested sets to workout
    const newExercise: ExerciseEntry = {
      name: exerciseName,
      sets: suggestion.suggestedSets,
      restTimeSeconds: suggestion.restTimeSeconds
    };
    
    onAddExercise(newExercise);
    
    // Optional: Show reasoning to user
    if (suggestion.reasoning) {
      toast.info(suggestion.reasoning);
    }
  } catch (error) {
    // Fallback to manual entry if API fails
    const newExercise: ExerciseEntry = {
      name: exerciseName,
      sets: [],
      restTimeSeconds: 90
    };
    onAddExercise(newExercise);
  } finally {
    setIsLoading(false);
  }
};
```

## Example 3: Generate Complete Workout Day

```typescript
import { suggestWorkoutDay } from '../services/chatgptService';

const handleGenerateWorkout = async () => {
  setIsGenerating(true);
  
  try {
    const exercises = await suggestWorkoutDay(
      ['chest', 'triceps'], // Target muscles
      'intermediate',       // User level
      'hypertrophy'        // Goal
    );

    // Update workout day with suggested exercises
    const updatedDay: WorkoutDay = {
      ...currentDay,
      exercises: exercises,
    };
    
    onUpdateDay(updatedDay);
  } catch (error) {
    console.error('Failed to generate workout:', error);
  } finally {
    setIsGenerating(false);
  }
};
```

## Example 4: Get Exercise Tips and Information

```typescript
import { getExerciseInfo } from '../services/chatgptService';

const handleShowExerciseInfo = async (exerciseName: string) => {
  try {
    const info = await getExerciseInfo(exerciseName);
    
    setExerciseDetails({
      description: info.description,
      tips: info.tips,
      commonMistakes: info.commonMistakes
    });
    
    setShowInfoModal(true);
  } catch (error) {
    console.error('Failed to get exercise info:', error);
  }
};
```

## Example 5: Add AI Suggestion Button to ExerciseSetsList

```tsx
// Add this button to ExerciseSetsList component:
import { suggestExerciseSets } from '../../../../services/chatgptService';

const ExerciseSetsList: React.FC<ExerciseSetsListProps> = ({
  // ... existing props
}) => {
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  const handleAISuggest = async () => {
    setIsLoadingSuggestion(true);
    
    try {
      const suggestion = await suggestExerciseSets({
        exerciseName: exercise.name,
        userLevel: 'intermediate', // Get from user profile
        goalType: 'hypertrophy',
      });

      // Replace all sets with AI suggestions
      suggestion.suggestedSets.forEach((suggestedSet, index) => {
        if (index < exercise.sets.length) {
          // Update existing set
          onUpdateSet(dayId, exerciseIndex, index, 'type', suggestedSet.type);
          onUpdateSet(dayId, exerciseIndex, index, 'weight', suggestedSet.weight);
          onUpdateSet(dayId, exerciseIndex, index, 'reps', suggestedSet.reps);
          onUpdateSet(dayId, exerciseIndex, index, 'restTimeSeconds', suggestedSet.restTimeSeconds || null);
        } else {
          // Add new set
          onAddSet(dayId, exerciseIndex);
          // Then update it with values (you'll need to handle this properly)
        }
      });
    } catch (error) {
      console.error('AI suggestion failed:', error);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  return (
    <div>
      {/* Existing sets UI */}
      
      {/* Add AI Suggest Button */}
      <button
        onClick={handleAISuggest}
        disabled={isLoadingSuggestion}
        className="mt-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm rounded-lg transition-all flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-lg">
          {isLoadingSuggestion ? 'progress_activity' : 'auto_awesome'}
        </span>
        {isLoadingSuggestion ? 'Generating...' : 'AI Suggest Sets'}
      </button>
    </div>
  );
};
```

## Response Types

### ExerciseSuggestionResponse
```typescript
{
  exerciseName: string;
  suggestedSets: ExerciseSet[];  // Array of sets with type, weight, reps, rest
  reasoning?: string;             // Why these sets were suggested
  restTimeSeconds?: number;       // Default rest between sets
}
```

### ExerciseSet
```typescript
{
  type: 'normal' | 'warmup' | 'failure' | 'drop_set';
  weight: string;              // e.g., "185 lbs", "moderate", "70% 1RM"
  reps: string;                // e.g., "8", "10-12"
  restTimeSeconds?: number;    // Rest after this set
  movementTUT?: MovementTUT;   // Time under tension (optional)
}
```

## Error Handling

The service includes fallback suggestions when the API is unavailable:

```typescript
// If OpenAI API fails, you'll get reasonable defaults based on goal type:
- Strength: 3-5 reps, heavy weight, 180s rest
- Hypertrophy: 8-12 reps, moderate weight, 90s rest  
- Endurance: 15-20 reps, light weight, 60s rest
```

## Best Practices

1. **Cache results**: Don't call the API repeatedly for the same exercise
2. **Show loading states**: AI suggestions take 1-3 seconds
3. **Allow manual override**: Users should be able to edit AI suggestions
4. **Handle errors gracefully**: Always provide a fallback UI
5. **Consider rate limits**: OpenAI has API rate limits
6. **Store user preferences**: Pass user level and goals from profile

## Cost Considerations

- Model used: `gpt-4o-mini` (cost-effective)
- Approximate cost: ~$0.01-0.02 per suggestion
- Use caching to minimize repeated calls
- Consider implementing request throttling
