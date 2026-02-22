export type TrainingPlanCreate = {
  name: string;
  description?: string;
  template_id: string;
  template_name: string;
  days_of_week: string[];
  exercises_by_day: Record<
    string,
    {
      name: string;
      sets: {
        type: 'normal' | 'warmup' | 'failure' | 'drop_set';
        weight: string;
        reps: string;
      }[];
    }[]
  >;
  creator_id?: string;
  mentee_id?: string | null;
};

export type TrainingPlan = TrainingPlanCreate & {
  id: number;
  creator_id?: string;
  mentee_id?: string | null;
  created_at: string;
};

export const createTrainingPlan = async (payload: TrainingPlanCreate): Promise<TrainingPlan> => {
  const response = await fetch('http://127.0.0.1:8000/api/training-plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Failed to create training plan.');
  }

  return (await response.json()) as TrainingPlan;
};

export const getTrainingPlans = async (signal?: AbortSignal, menteeId?: string | null, userId?: string | null): Promise<TrainingPlan[]> => {
  const url = new URL('http://127.0.0.1:8000/api/training-plans');
  if (userId) {
    url.searchParams.append('user_id', userId);
  } else if (menteeId) {
    url.searchParams.append('user_id', menteeId);
  }
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    signal
  });

  if (!response.ok) {
    throw new Error('Failed to load training plans.');
  }

  return (await response.json()) as TrainingPlan[];
};

export const getTrainingPlan = async (planId: number, signal?: AbortSignal): Promise<TrainingPlan> => {
  const response = await fetch(`http://127.0.0.1:8000/api/training-plans/${planId}`, {
    method: 'GET',
    signal
  });

  if (!response.ok) {
    throw new Error('Failed to load training plan.');
  }

  return (await response.json()) as TrainingPlan;
};

export const updateTrainingPlan = async (planId: number, payload: TrainingPlanCreate): Promise<TrainingPlan> => {
  const response = await fetch(`http://127.0.0.1:8000/api/training-plans/${planId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Failed to update training plan.');
  }

  return (await response.json()) as TrainingPlan;
};

export const deleteTrainingPlan = async (planId: number): Promise<void> => {
  const response = await fetch(`http://127.0.0.1:8000/api/training-plans/${planId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete training plan.');
  }
};
