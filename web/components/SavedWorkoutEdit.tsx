import React, { useEffect, useState } from 'react';
import { SavedWorkout, ExerciseSet } from '../types';
import { getSavedWorkoutById, updateSavedWorkout } from '../services/savedWorkoutsService';

const initialExercise: ExerciseSet = {
  exerciseName: '',
  reps: 0,
  weight: 0,
  notes: '',
};

interface Props {
  workoutId: string;
  onUpdated?: (workout: SavedWorkout) => void;
}

const SavedWorkoutEdit: React.FC<Props> = ({ workoutId, onUpdated }) => {
  const [workout, setWorkout] = useState<SavedWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSavedWorkoutById(workoutId).then(w => {
      setWorkout(w || null);
      setLoading(false);
    });
  }, [workoutId]);

  const handleExerciseChange = (idx: number, field: keyof ExerciseSet, value: any) => {
    if (!workout) return;
    setWorkout({
      ...workout,
      exerciseSets: workout.exerciseSets.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex),
    });
  };

  const addExercise = () => {
    if (!workout) return;
    setWorkout({ ...workout, exerciseSets: [...workout.exerciseSets, initialExercise] });
  };

  const removeExercise = (idx: number) => {
    if (!workout) return;
    setWorkout({ ...workout, exerciseSets: workout.exerciseSets.filter((_, i) => i !== idx) });
  };

  const handleChange = (field: keyof SavedWorkout, value: any) => {
    if (!workout) return;
    setWorkout({ ...workout, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workout) return;
    setSaving(true);
    const updated = await updateSavedWorkout(workout.id, workout);
    setSaving(false);
    if (updated && onUpdated) onUpdated(updated);
  };

  if (loading) return <div>Loading...</div>;
  if (!workout) return <div>Workout not found.</div>;

  return (
    <form className="p-4 max-w-xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Edit Saved Workout</h2>
      <div className="mb-2">
        <label className="block font-semibold">Workout Name</label>
        <input className="border px-2 py-1 w-full" value={workout.workoutName} onChange={e => handleChange('workoutName', e.target.value)} required />
      </div>
      <div className="mb-2">
        <label className="block font-semibold">Description</label>
        <input className="border px-2 py-1 w-full" value={workout.description || ''} onChange={e => handleChange('description', e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block font-semibold">Created By</label>
        <input className="border px-2 py-1 w-full" value={workout.createdBy} onChange={e => handleChange('createdBy', e.target.value)} required />
      </div>
      <div className="mb-2">
        <label className="block font-semibold">Exercises</label>
        {workout.exerciseSets.map((ex, idx) => (
          <div key={idx} className="flex gap-2 mb-1 items-center">
            <input className="border px-1 py-0.5" placeholder="Exercise Name" value={ex.exerciseName} onChange={e => handleExerciseChange(idx, 'exerciseName', e.target.value)} required />
            <input className="border px-1 py-0.5 w-16" type="number" placeholder="Reps" value={ex.reps} onChange={e => handleExerciseChange(idx, 'reps', Number(e.target.value))} min={0} required />
            <input className="border px-1 py-0.5 w-20" type="number" placeholder="Weight" value={ex.weight} onChange={e => handleExerciseChange(idx, 'weight', Number(e.target.value))} min={0} required />
            <input className="border px-1 py-0.5" placeholder="Notes" value={ex.notes || ''} onChange={e => handleExerciseChange(idx, 'notes', e.target.value)} />
            {workout.exerciseSets.length > 1 && (
              <button type="button" className="text-red-600" onClick={() => removeExercise(idx)}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" className="text-blue-600 mt-1" onClick={addExercise}>+ Add Exercise</button>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
    </form>
  );
};

export default SavedWorkoutEdit;
