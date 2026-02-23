import React, { useEffect, useState } from 'react';
import { SavedWorkout } from '../types';
import { getSavedWorkouts } from '../services/savedWorkoutsService';

const SavedWorkoutsList: React.FC = () => {
  const [workouts, setWorkouts] = useState<SavedWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedWorkouts().then(ws => {
      setWorkouts(ws);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Saved Workouts</h2>
      {workouts.length === 0 ? (
        <div>No saved workouts found.</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Workout Name</th>
              <th className="border px-2 py-1">Description</th>
              <th className="border px-2 py-1">Created By</th>
              <th className="border px-2 py-1">Created At</th>
              <th className="border px-2 py-1"># Exercises</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map(w => (
              <tr key={w.id}>
                <td className="border px-2 py-1">{w.workoutName}</td>
                <td className="border px-2 py-1">{w.description || '-'}</td>
                <td className="border px-2 py-1">{w.createdBy}</td>
                <td className="border px-2 py-1">{new Date(w.createdAt).toLocaleString()}</td>
                <td className="border px-2 py-1">{w.exerciseSets.length}</td>
                <td className="border px-2 py-1">
                  {/* TODO: Add Edit/Delete actions */}
                  <button className="text-blue-600 hover:underline mr-2">Edit</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SavedWorkoutsList;
