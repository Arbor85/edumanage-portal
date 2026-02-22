import { ExerciseSet, ExerciseEntry } from '../components/pages/fitnes/workoutTypes';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export type ExerciseSuggestionRequest = {
  exerciseName: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  targetMuscle?: string;
  equipmentAvailable?: string[];
  previousWeights?: string;
  goalType?: 'strength' | 'hypertrophy' | 'endurance';
  progressionType?: 'progressive' | 'static' | 'degrading';
};

export type ExerciseSuggestionResponse = {
  exerciseName: string;
  suggestedSets: ExerciseSet[];
  reasoning?: string;
  restTimeSeconds?: number;
};

/**
 * Suggests exercise sets using ChatGPT API
 * @param request Exercise suggestion parameters
 * @returns Suggested sets with weights, reps, and rest times
 */
export const suggestExerciseSets = async (
  request: ExerciseSuggestionRequest
): Promise<ExerciseSuggestionResponse> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file');
  }

  const { 
    exerciseName, 
    userLevel = 'intermediate', 
    targetMuscle = '', 
    previousWeights = '',
    goalType = 'hypertrophy',
    progressionType = 'static'
  } = request;

  const prompt = buildExercisePrompt(exerciseName, userLevel, targetMuscle, previousWeights, goalType, progressionType);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert strength and conditioning coach. Provide specific, practical workout recommendations based on scientific principles of exercise physiology. Always respond with valid JSON only, no additional text. CRITICAL: Return weight and reps as numbers (not strings), e.g., "weight": 85, "reps": 8.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from ChatGPT');
    }

    // Parse the JSON response
    const parsedResponse = parseGPTResponse(content);
    
    return {
      exerciseName,
      suggestedSets: parsedResponse.sets,
      reasoning: parsedResponse.reasoning,
      restTimeSeconds: parsedResponse.restTimeSeconds
    };
  } catch (error) {
    console.error('Error calling ChatGPT API:', error);
    // Return fallback suggestions
    return getFallbackSuggestion(exerciseName, goalType, progressionType);
  }
};

/**
 * Suggests a complete workout day with multiple exercises
 */
export const suggestWorkoutDay = async (
  targetMuscles: string[],
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  goalType: 'strength' | 'hypertrophy' | 'endurance' = 'hypertrophy'
): Promise<ExerciseEntry[]> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = `Create a complete workout targeting ${targetMuscles.join(', ')} for a ${userLevel} lifter focused on ${goalType}.

Include 4-6 exercises with:
- Exercise name
- Number of sets
- Reps per set
- Weight recommendations (use "moderate", "heavy", or specific percentages)
- Rest time between sets
- Set types (warmup, normal, failure, drop_set)

Return ONLY valid JSON in this exact format:
{
  "exercises": [
    {
      "name": "Exercise Name",
      "sets": [
        {
          "type": "warmup",
          "weight": "light",
          "reps": "12",
          "restTimeSeconds": 60
        }
      ],
      "restTimeSeconds": 90
    }
  ]
}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert workout coach. Provide workout plans in valid JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content from ChatGPT');
    }

    const parsed = JSON.parse(content.trim());
    return parsed.exercises || [];
  } catch (error) {
    console.error('Error generating workout day:', error);
    return [];
  }
};

/**
 * Build a detailed prompt for exercise set suggestions
 */
function buildExercisePrompt(
  exerciseName: string,
  userLevel: string,
  targetMuscle: string,
  previousWeights: string,
  goalType: string,
  progressionType: string
): string {
  // Determine set count based on progression type
  const setGuidelines = {
    progressive: '4-6 working sets with increasing weight',
    static: '3-5 working sets with the same weight',
    degrading: '4-6 working sets with decreasing weight (drop sets)'
  };

  const progressionInstructions = {
    progressive: `
PROGRESSIVE: Increase weight across working sets (pyramid up)
- Start at 70-75% of max
- Increase by 5-10% each set
- Example: 70kg → 75kg → 80kg → 85kg`,
    
    static: `
STATIC: Keep the same weight for all working sets
- Use 75-85% of max for all working sets
- Maintain consistent reps
- Example: 80kg → 80kg → 80kg → 80kg`,
    
    degrading: `
DEGRADING: Decrease weight across working sets (drop sets/reverse pyramid)
- Start at 85-90% of max
- Decrease by 10-15% each set
- Increase reps as weight decreases
- Example: 90kg x 6 → 80kg x 8 → 70kg x 10 → 60kg x 12`
  };

  const sets = progressionType === 'static' ? '5-7' : '6-9';

  return `Suggest an optimal set and rep scheme for the exercise: "${exerciseName}"

Context:
- User level: ${userLevel}
- Target muscle: ${targetMuscle || 'not specified'}
- ${previousWeights}
- Training goal: ${goalType}
- Progression type: ${progressionType}

CRITICAL REQUIREMENTS:
1. Include EXACTLY 2 warmup sets before working sets
2. Include ${setGuidelines[progressionType as keyof typeof setGuidelines] || '3-5 working sets'}
3. Use SPECIFIC NUMERIC WEIGHTS with units from the user's max weight
4. Calculate weights based on the progression type selected
5. Keep the same unit format as the user's input (kg or lbs)
6. Include restTimeSeconds for each set
7. Total of ${sets} sets (2 warmups + working sets)

${progressionInstructions[progressionType as keyof typeof progressionInstructions] || ''}

WARMUP PROGRESSION:
- First warmup: 40-50% of max
- Second warmup: 60-70% of max

Example: If user's max is "100kg" with PROGRESSIVE:
- Warmup 1: "40kg" x 10 (60s rest)
- Warmup 2: "60kg" x 8 (90s rest)
- Working 1: "70kg" x 8 (120s rest)
- Working 2: "75kg" x 8 (120s rest)
- Working 3: "80kg" x 7 (120s rest)
- Working 4: "85kg" x 6 (120s rest)

For each set provide:
- type: "warmup" for first 2 sets, "normal" for working sets, or "drop_set" for degrading final sets
- weight: NUMERIC value with unit (e.g., "50kg", "135lbs") - NEVER use "light", "moderate", "heavy"
- reps: numeric string (e.g., "10", "8")
- restTimeSeconds: number (60-180 seconds based on goal)

Return ONLY valid JSON in this exact format (no additional text):
{
  "sets": [
    {
      "type": "warmup",
      "weight": "50kg",
      "reps": "10",
      "restTimeSeconds": 60
    },
    {
      "type": "warmup",
      "weight": "70kg",
      "reps": "8",
      "restTimeSeconds": 90
    },
    {
      "type": "normal",
      "weight": "85kg",
      "reps": "8",
      "restTimeSeconds": 120
    }
  ],
  "restTimeSeconds": 120,
  "reasoning": "Brief explanation of the programming rationale"
}`;
}

/**
 * Parse GPT response and ensure it matches our types
 */
function parseGPTResponse(content: string): {
  sets: ExerciseSet[];
  reasoning?: string;
  restTimeSeconds?: number;
} {
  try {
    // Remove markdown code blocks if present
    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(cleaned);
    // Sanitize sets: ensure weight and reps are numbers
    const sets = (parsed.sets || []).map((set: any) => {
      let weight = set.weight;
      if (typeof weight === 'string') {
        // Remove non-numeric characters (e.g., 'kg') and parse
        const num = weight.match(/\d+(\.\d+)?/);
        weight = num ? parseFloat(num[0]) : 0;
      }
      let reps = set.reps;
      if (typeof reps === 'string') {
        const num = reps.match(/\d+/);
        reps = num ? parseInt(num[0], 10) : 0;
      }
      return {
        ...set,
        weight,
        reps
      };
    });
    return {
      sets,
      reasoning: parsed.reasoning,
      restTimeSeconds: parsed.restTimeSeconds
    };
  } catch (error) {
    console.error('Error parsing GPT response:', error);
    throw new Error('Invalid JSON response from ChatGPT');
  }
}

/**
 * Fallback suggestion when API fails
 */
function getFallbackSuggestion(
  exerciseName: string,
  goalType: string,
  progressionType: string = 'static'
): ExerciseSuggestionResponse {
  const fallbackSets: Record<string, Record<string, ExerciseSet[]>> = {
    strength: {
      progressive: [
        { type: 'warmup', weight: "40", reps: "8", restTimeSeconds: 60 },
        { type: 'warmup', weight: "60", reps: "5", restTimeSeconds: 90 },
        { type: 'normal', weight: "70", reps: "6", restTimeSeconds: 180 },
        { type: 'normal', weight: "75", reps: "5", restTimeSeconds: 180 },
        { type: 'normal', weight: "80", reps: "5", restTimeSeconds: 180 },
        { type: 'normal', weight: "85", reps: "4", restTimeSeconds: 180 }
      ],
      static: [
        { type: 'warmup', weight: "40", reps: "8", restTimeSeconds: 60 },
        { type: 'warmup', weight: "60", reps: "5", restTimeSeconds: 90 },
        { type: 'normal', weight: "80", reps: "5", restTimeSeconds: 180 },
        { type: 'normal', weight: "80", reps: "5", restTimeSeconds: 180 },
        { type: 'normal', weight: "80", reps: "5", restTimeSeconds: 180 },
        { type: 'normal', weight: "80", reps: "5", restTimeSeconds: 180 }
      ],
      degrading: [
        { type: 'warmup', weight: "40", reps: "8", restTimeSeconds: 60 },
        { type: 'warmup', weight: "60", reps: "5", restTimeSeconds: 90 },
        { type: 'normal', weight: "85", reps: "5", restTimeSeconds: 180 },
        { type: 'drop_set', weight: "75", reps: "6", restTimeSeconds: 150 },
        { type: 'drop_set', weight: "65", reps: "7", restTimeSeconds: 120 },
        { type: 'drop_set', weight: "55", reps: "8", restTimeSeconds: 120 }
      ]
    },
    hypertrophy: {
      progressive: [
        { type: 'warmup', weight: "40", reps: "12", restTimeSeconds: 60 },
        { type: 'warmup', weight: "60", reps: "10", restTimeSeconds: 75 },
        { type: 'normal', weight: "65", reps: "10", restTimeSeconds: 90 },
        { type: 'normal', weight: "70", reps: "9", restTimeSeconds: 90 },
        { type: 'normal', weight: "75", reps: "8", restTimeSeconds: 90 },
        { type: 'normal', weight: "80", reps: "7", restTimeSeconds: 90 }
      ],
      static: [
        { type: 'warmup', weight: "40", reps: "12", restTimeSeconds: 60 },
        { type: 'warmup', weight: "60", reps: "10", restTimeSeconds: 75 },
        { type: 'normal', weight: "75", reps: "10", restTimeSeconds: 90 },
        { type: 'normal', weight: "75", reps: "10", restTimeSeconds: 90 },
        { type: 'normal', weight: "75", reps: "10", restTimeSeconds: 90 },
        { type: 'normal', weight: "75", reps: "8", restTimeSeconds: 90 }
      ],
      degrading: [
        { type: 'warmup', weight: "40", reps: "12", restTimeSeconds: 60 },
        { type: 'warmup', weight: "60", reps: "10", restTimeSeconds: 75 },
        { type: 'normal', weight: "80", reps: "8", restTimeSeconds: 90 },
        { type: 'drop_set', weight: "70", reps: "10", restTimeSeconds: 75 },
        { type: 'drop_set', weight: "60", reps: "12", restTimeSeconds: 60 },
        { type: 'drop_set', weight: "50", reps: "15", restTimeSeconds: 60 }
      ]
    },
    endurance: {
      progressive: [
        { type: 'warmup', weight: "30", reps: "15", restTimeSeconds: 45 },
        { type: 'warmup', weight: "45", reps: "12", restTimeSeconds: 60 },
        { type: 'normal', weight: "50", reps: "15", restTimeSeconds: 60 },
        { type: 'normal', weight: "55", reps: "14", restTimeSeconds: 60 },
        { type: 'normal', weight: "60", reps: "13", restTimeSeconds: 60 },
        { type: 'normal', weight: "65", reps: "12", restTimeSeconds: 60 }
      ],
      static: [
        { type: 'warmup', weight: "30", reps: "15", restTimeSeconds: 45 },
        { type: 'warmup', weight: "45", reps: "12", restTimeSeconds: 60 },
        { type: 'normal', weight: "55", reps: "15", restTimeSeconds: 60 },
        { type: 'normal', weight: "55", reps: "15", restTimeSeconds: 60 },
        { type: 'normal', weight: "55", reps: "15", restTimeSeconds: 60 },
        { type: 'normal', weight: "55", reps: "20", restTimeSeconds: 60 }
      ],
      degrading: [
        { type: 'warmup', weight: "30", reps: "15", restTimeSeconds: 45 },
        { type: 'warmup', weight: "45", reps: "12", restTimeSeconds: 60 },
        { type: 'normal', weight: "65", reps: "12", restTimeSeconds: 60 },
        { type: 'drop_set', weight: "55", reps: "15", restTimeSeconds: 60 },
        { type: 'drop_set', weight: "45", reps: "18", restTimeSeconds: 60 },
        { type: 'drop_set', weight: "35", reps: "22", restTimeSeconds: 60 }
      ]
    }
  };

  const goalSets = fallbackSets[goalType] || fallbackSets.hypertrophy;
  const sets = goalSets[progressionType as keyof typeof goalSets] || goalSets.static;

  return {
    exerciseName,
    suggestedSets: sets,
    reasoning: `Using fallback ${progressionType} recommendations (API unavailable). Adjust weights based on your actual max.`,
    restTimeSeconds: goalType === 'strength' ? 180 : goalType === 'endurance' ? 60 : 90
  };
}

/**
 * Get exercise information and tips from ChatGPT
 */
export const getExerciseInfo = async (exerciseName: string): Promise<{
  description: string;
  tips: string[];
  commonMistakes: string[];
}> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = `Provide detailed information about the exercise: "${exerciseName}"

Include:
1. A brief description of the exercise
2. 3-5 key execution tips
3. 3 common mistakes to avoid

Return ONLY valid JSON in this format:
{
  "description": "Brief description",
  "tips": ["Tip 1", "Tip 2"],
  "commonMistakes": ["Mistake 1", "Mistake 2"]
}`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a certified fitness trainer providing exercise guidance.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content from ChatGPT');
    }

    let cleaned = content.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Error getting exercise info:', error);
    return {
      description: `${exerciseName} is a compound/isolation exercise.`,
      tips: ['Maintain proper form', 'Control the movement', 'Breathe properly'],
      commonMistakes: ['Using too much weight', 'Poor form', 'Inadequate warm-up']
    };
  }
};
