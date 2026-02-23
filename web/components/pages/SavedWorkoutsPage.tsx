import React from 'react';

import SavedWorkoutsList from '../SavedWorkoutsList';
import SavedWorkoutCreate from '../SavedWorkoutCreate';


const SavedWorkoutsPage: React.FC = () => {
  // Optionally, could add state to refresh list after create
  return (
    <div>
      <SavedWorkoutCreate />
      <div className="my-6" />
      <SavedWorkoutsList />
    </div>
  );
};

export default SavedWorkoutsPage;
