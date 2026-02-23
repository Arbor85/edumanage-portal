import React, { useState } from 'react';
import { SavedWorkout, ExerciseSet } from '../types';
import { createSavedWorkout } from '../services/savedWorkoutsService';

const initialExercise: ExerciseSet = {
  exerciseName: '',
  reps: 0,
  weight: 0,
  notes: '',
};

const SavedWorkoutCreate: React.FC<{ onCreated?: (workout: SavedWorkout) => void }> = ({ onCreated }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [description, setDescription] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [exerciseSets, setExerciseSets] = useState<ExerciseSet[]>([initialExercise]);
  const [saving, setSaving] = useState(false);

  const handleExerciseChange = (idx: number, field: keyof ExerciseSet, value: any) => {
    setExerciseSets(sets => sets.map((ex, i) => i === idx ? { ...ex, [field]: value } : ex));
  };

  const addExercise = () => {
    setExerciseSets([...exerciseSets, initialExercise]);
  };

  const removeExercise = (idx: number) => {
    setExerciseSets(sets => sets.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const workout = await createSavedWorkout({
      workoutName,
      description,
      createdBy,
      exerciseSets: exerciseSets.filter(ex => ex.exerciseName),
    });
    setSaving(false);
    if (onCreated) onCreated(workout);
    setWorkoutName('');
    setDescription('');
    setCreatedBy('');
    setExerciseSets([initialExercise]);
  };

  return (
    <form className="p-4 max-w-xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Create Saved Workout</h2>
      <div className="mb-2">
        <label className="block font-semibold">Workout Name</label>
        <input className="border px-2 py-1 w-full" value={workoutName} onChange={e => setWorkoutName(e.target.value)} required />
      </div>
      <div className="mb-2">
        <label className="block font-semibold">Description</label>
        <input className="border px-2 py-1 w-full" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block font-semibold">Created By</label>
        <input className="border px-2 py-1 w-full" value={createdBy} onChange={e => setCreatedBy(e.target.value)} required />
      </div>
      <div className="mb-2">
        <label className="block font-semibold">Exercises</label>
        {exerciseSets.map((ex, idx) => (
          <div key={idx} className="flex gap-2 mb-1 items-center">
            <input className="border px-1 py-0.5" placeholder="Exercise Name" value={ex.exerciseName} onChange={e => handleExerciseChange(idx, 'exerciseName', e.target.value)} required />
            <input className="border px-1 py-0.5 w-16" type="number" placeholder="Reps" value={ex.reps} onChange={e => handleExerciseChange(idx, 'reps', Number(e.target.value))} min={0} required />
            <input className="border px-1 py-0.5 w-20" type="number" placeholder="Weight" value={ex.weight} onChange={e => handleExerciseChange(idx, 'weight', Number(e.target.value))} min={0} required />
            <input className="border px-1 py-0.5" placeholder="Notes" value={ex.notes || ''} onChange={e => handleExerciseChange(idx, 'notes', e.target.value)} />
            {exerciseSets.length > 1 && (
              <button type="button" className="text-red-600" onClick={() => removeExercise(idx)}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" className="text-blue-600 mt-1" onClick={addExercise}>+ Add Exercise</button>
      </div>
      <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded" disabled={saving}>{saving ? 'Saving...' : 'Create Workout'}</button>
    </form>
  );
};

export default SavedWorkoutCreate;
