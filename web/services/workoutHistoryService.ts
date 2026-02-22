export type WorkoutSet = {
  exercise_title: string;
  superset_id: number | null;
  exercise_notes: string | null;
  set_index: number;
  set_type: string;
  weight_kg: number | null;
  reps: number | null;
};

export type WorkoutHistoryItem = {
  id: number;
  title: string;
  workout_date: string;
  duration_minutes: number;
  volume_kg: number;
  sets: number;
  workout_sets: WorkoutSet[];
  start_time?: string | null;
  end_time?: string | null;
  created_at: string;
};

export type WorkoutHistoryPage = {
  items: WorkoutHistoryItem[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type WorkoutHistoryCreate = {
  title: string;
  workout_date: string;
  duration_minutes: number;
  volume_kg: number;
  sets: number;
  workout_sets: WorkoutSet[];
  start_time?: string | null;
  end_time?: string | null;
};

type GetHistoryOptions = {
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
};

export const getWorkoutHistory = async ({
  page = 1,
  pageSize = 10,
  signal
}: GetHistoryOptions = {}): Promise<WorkoutHistoryPage> => {
  const response = await fetch(`http://127.0.0.1:8000/api/history?page=${page}&page_size=${pageSize}`, {
    signal
  });

  if (!response.ok) {
    throw new Error('Failed to load workout history.');
  }

  return (await response.json()) as WorkoutHistoryPage;
};

export const createWorkoutHistory = async (payload: WorkoutHistoryCreate): Promise<WorkoutHistoryItem> => {
  const response = await fetch('http://127.0.0.1:8000/api/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Failed to save workout history.');
  }

  return (await response.json()) as WorkoutHistoryItem;
};
