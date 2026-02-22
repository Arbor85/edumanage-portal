import React, { useState } from 'react';
import ExerciseSetDialog, { ExerciseSetDialogState } from './ExerciseSetDialog';
import AISuggestSetsDialog from './AISuggestSetsDialog';
import type { ExerciseEntry, ExerciseSetType, ExerciseSet } from '../workoutTypes';
import { DEFAULT_REST_SECONDS, formatRest, getSetVolume, getVolumeChange } from '../workoutUtils';

const parseRestParts = (minutes: string, seconds: string) => {
  const mins = Math.max(0, Number(minutes) || 0);
  const secs = Math.min(59, Math.max(0, Number(seconds) || 0));
  return mins * 60 + secs;
};

const setTypeLabel = (type: ExerciseSetType) => {
  switch (type) {
    case 'warmup':
      return 'Warmup';
    case 'failure':
      return 'Failure';
    case 'drop_set':
      return 'Drop';
    default:
      return 'Normal';
  }
};

const setTypeTone = (type: ExerciseSetType) => {
  switch (type) {
    case 'warmup':
      return 'text-amber-600 dark:text-amber-300';
    case 'failure':
      return 'text-rose-600 dark:text-rose-300';
    case 'drop_set':
      return 'text-purple-600 dark:text-purple-300';
    default:
      return 'text-emerald-600 dark:text-emerald-300';
  }
};

type ExerciseSetsListProps = {
  dayId: string;
  exercise: ExerciseEntry;
  exerciseIndex: number;
  isExpanded: boolean;
  onMoveSet: (dayId: string, exerciseIndex: number, fromIndex: number, toIndex: number) => void;
  onUpdateSet: (
    dayId: string,
    exerciseIndex: number,
    setIndex: number,
    field: 'type' | 'weight' | 'reps' | 'restTimeSeconds',
    value: string | number | null
  ) => void;
  onRemoveSet: (dayId: string, exerciseIndex: number, setIndex: number) => void;
  onAddSet: (dayId: string, exerciseIndex: number) => void;
  onReplaceSets: (dayId: string, exerciseIndex: number, newSets: ExerciseSet[]) => void;
  setActiveSync: React.Dispatch<React.SetStateAction<{
    dayId: string;
    exerciseIndex: number;
    setIndex: number;
    field: 'weight' | 'reps';
  } | null>>;
};

const ExerciseSetsList: React.FC<ExerciseSetsListProps> = ({
  dayId,
  exercise,
  exerciseIndex,
  isExpanded,
  onMoveSet,
  onUpdateSet,
  onRemoveSet,
  onAddSet,
  onReplaceSets,
  setActiveSync,
}) => {
  if (!isExpanded) return null;

  const [editDialog, setEditDialog] = useState<ExerciseSetDialogState | null>(null);
  const [draggedSetIndex, setDraggedSetIndex] = useState<number | null>(null);
  const [dragOverSetIndex, setDragOverSetIndex] = useState<number | null>(null);
  const [showAIDialog, setShowAIDialog] = useState(false);

  const openEditDialog = (setIndex: number) => {
    const set = exercise.sets[setIndex];
    if (!set) return;
    const exerciseRest = exercise.restTimeSeconds ?? DEFAULT_REST_SECONDS;
    const effectiveRest = set.restTimeSeconds ?? exerciseRest;
    const mins = Math.floor(effectiveRest / 60);
    const secs = effectiveRest % 60;
    const movementTUT = set.movementTUT ?? null;
    setEditDialog({
      setIndex,
      type: set.type,
      weight: set.weight,
      reps: set.reps,
      restEnabled: set.restTimeSeconds !== null && set.restTimeSeconds !== undefined,
      minutes: String(mins),
      seconds: String(secs).padStart(2, '0'),
      tutDownSeconds: movementTUT ? String(movementTUT.downSeconds) : '',
      tutBottomSeconds: movementTUT ? String(movementTUT.bottomSeconds) : '',
      tutUpSeconds: movementTUT ? String(movementTUT.upSeconds) : '',
      tutTopSeconds: movementTUT ? String(movementTUT.topSeconds) : '',
    });
  };

  const closeEditDialog = () => setEditDialog(null);

  const saveEditDialog = () => {
    if (!editDialog) return;
    const current = exercise.sets[editDialog.setIndex];
    if (!current) {
      closeEditDialog();
      return;
    }
    const nextRest = editDialog.restEnabled
      ? parseRestParts(editDialog.minutes, editDialog.seconds)
      : null;
    const nextTutValues = [
      editDialog.tutDownSeconds,
      editDialog.tutBottomSeconds,
      editDialog.tutUpSeconds,
      editDialog.tutTopSeconds,
    ];
    const hasTutValue = nextTutValues.some(value => String(value).trim().length > 0);
    const nextTut = hasTutValue
      ? {
          downSeconds: Math.max(0, Number(editDialog.tutDownSeconds) || 0),
          bottomSeconds: Math.max(0, Number(editDialog.tutBottomSeconds) || 0),
          upSeconds: Math.max(0, Number(editDialog.tutUpSeconds) || 0),
          topSeconds: Math.max(0, Number(editDialog.tutTopSeconds) || 0),
        }
      : null;
    if (editDialog.type !== current.type) {
      onUpdateSet(dayId, exerciseIndex, editDialog.setIndex, 'type', editDialog.type);
    }
    if (editDialog.weight !== current.weight) {
      onUpdateSet(dayId, exerciseIndex, editDialog.setIndex, 'weight', editDialog.weight);
    }
    if (editDialog.reps !== current.reps) {
      onUpdateSet(dayId, exerciseIndex, editDialog.setIndex, 'reps', editDialog.reps);
    }
    const currentRest = current.restTimeSeconds ?? null;
    if (currentRest !== nextRest) {
      onUpdateSet(dayId, exerciseIndex, editDialog.setIndex, 'restTimeSeconds', nextRest);
    }
    const currentTut = current.movementTUT ?? null;
    const nextTutSignature = nextTut ? JSON.stringify(nextTut) : null;
    const currentTutSignature = currentTut ? JSON.stringify(currentTut) : null;
    if (currentTutSignature !== nextTutSignature) {
      onUpdateSet(dayId, exerciseIndex, editDialog.setIndex, 'movementTUT', nextTut);
    }
    closeEditDialog();
  };

  const handleDragStart = (setIndex: number) => {
    setDraggedSetIndex(setIndex);
  };

  const handleDragOver = (event: React.DragEvent, setIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    if (draggedSetIndex !== null && draggedSetIndex !== setIndex) {
      setDragOverSetIndex(setIndex);
    }
  };

  const handleDrop = (event: React.DragEvent, setIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    if (draggedSetIndex === null) return;
    if (draggedSetIndex !== setIndex) {
      onMoveSet(dayId, exerciseIndex, draggedSetIndex, setIndex);
    }
    setDraggedSetIndex(null);
    setDragOverSetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedSetIndex(null);
    setDragOverSetIndex(null);
  };

  return (
    <>
      <div className="space-y-2">
        {exercise.sets.map((set, setIndex) => (
          <div
            key={`${dayId}-${exercise.name}-set-${setIndex}`}
            draggable={!editDialog}
            onDragStart={() => !editDialog && handleDragStart(setIndex)}
            onDragOver={(event) => !editDialog && handleDragOver(event, setIndex)}
            onDrop={(event) => !editDialog && handleDrop(event, setIndex)}
            onDragEnd={() => !editDialog && handleDragEnd()}
            className={`flex w-full flex-nowrap items-center gap-2 relative ${
              dragOverSetIndex === setIndex ? 'rounded-2xl border border-primary bg-primary/5' : ''
            } ${editDialog ? 'opacity-90' : ''}`}
          >
            {(() => {
              const exerciseRest = exercise.restTimeSeconds ?? DEFAULT_REST_SECONDS;
              const effectiveRest = set.restTimeSeconds ?? exerciseRest;
              const restLabel = set.restTimeSeconds === null || set.restTimeSeconds === undefined
                ? `${formatRest(effectiveRest)} (auto)`
                : formatRest(effectiveRest);
              const weightLabel = set.weight ? `${set.weight} kg` : '-- kg';
              const repsLabel = set.reps ? `${set.reps} reps` : '-- reps';
              return (
                <>
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Set {setIndex + 1}</span>
                    <span className={`text-[11px] font-semibold ${setTypeTone(set.type)}`}>Type: {setTypeLabel(set.type)}</span>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Weight: {weightLabel}</span>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Reps: {repsLabel}</span>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Rest: {restLabel}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {(() => {
                      const previousVolume = setIndex > 0 ? getSetVolume(exercise.sets[setIndex - 1]) : null;
                      const currentVolume = getSetVolume(set);
                      const change = getVolumeChange(previousVolume, currentVolume);
                      if (!change) return null;
                      if (change.direction === 'flat') {
                        return (
                          <span className="text-[11px] font-semibold text-slate-400">= (0%)</span>
                        );
                      }
                      const isUp = change.direction === 'up';
                      const colorClass = isUp ? 'text-emerald-400' : 'text-amber-400';
                      const arrow = isUp ? 'arrow_upward' : 'arrow_downward';
                      const sign = isUp ? '+' : '-';
                      return (
                        <span className={`flex items-center gap-1 text-[11px] font-bold ${colorClass}`}>
                          <span className="material-symbols-outlined text-sm leading-none">{arrow}</span>
                          <span>({sign}{change.percent}%)</span>
                        </span>
                      );
                    })()}
                    <span className="min-w-[96px] text-center text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-border-dark rounded-xl px-2 py-2">
                      Vol {getSetVolume(set)}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditDialog(setIndex)}
                      className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-200 bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-border-dark rounded-full px-3 py-2"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      draggable={false}
                      className={`text-slate-400 transition-colors ${
                        editDialog
                          ? 'cursor-not-allowed opacity-40'
                          : 'hover:text-primary cursor-grab active:cursor-grabbing'
                      }`}
                      aria-label="Drag to reorder set"
                      title="Drag to reorder set"
                    >
                      <span className="material-symbols-outlined text-lg">drag_indicator</span>
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onAddSet(dayId, exerciseIndex)}
          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-border-dark text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Add Set
        </button>
        <button
          type="button"
          onClick={() => setShowAIDialog(true)}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all flex items-center justify-center"
          aria-label="Ask AI"
          title="Ask AI for set suggestions"
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span>
        </button>
      </div>

      {editDialog && (
        <ExerciseSetDialog
          open={Boolean(editDialog)}
          exercise={exercise}
          state={editDialog}
          dayId={dayId}
          exerciseIndex={exerciseIndex}
          setActiveSync={setActiveSync}
          onChange={next => setEditDialog(next)}
          onClose={closeEditDialog}
          onDelete={(setIndex) => {
            onRemoveSet(dayId, exerciseIndex, setIndex);
            closeEditDialog();
          }}
          onSave={saveEditDialog}
        />
      )}

      <AISuggestSetsDialog
        open={showAIDialog}
        exerciseName={exercise.name}
        onClose={() => setShowAIDialog(false)}
        onSetsGenerated={(generatedSets: ExerciseSet[]) => {
          console.log('AI Generated Sets:', generatedSets);
          // Replace all sets with AI-generated ones
          onReplaceSets(dayId, exerciseIndex, generatedSets);
        }}
      />
    </>
  );
};

export default ExerciseSetsList;
