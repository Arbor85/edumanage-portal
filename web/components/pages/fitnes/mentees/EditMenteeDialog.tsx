import React, { useState } from 'react';
import { Mentee } from '../../../../types';
import { updateMentee, deleteMentee } from '@services/menteesService';
import MenteeFormFields from './MenteeFormFields';
import SelectOption from './SelectOption';

interface EditMenteeDialogProps {
  mentee: Mentee;
  onClose: () => void;
  onDelete: (mentee: Mentee) => void;
  onUpdate?: (mentee: Mentee) => void;
}

const EditMenteeDialog: React.FC<EditMenteeDialogProps> = ({ mentee, onClose, onDelete, onUpdate }) => {
  const [name, setName] = useState(mentee.name);
  const [email, setEmail] = useState(mentee.email_address || '');
  const [notes, setNotes] = useState(mentee.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<'InPerson' | 'Online' | 'Group'>(mentee.type as 'InPerson' | 'Online' | 'Group');
  const [status, setStatus] = useState<'Active' | 'Suspended'>(mentee.status as 'Active' | 'Suspended');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updated = await updateMentee(mentee.id, { name, email_address: email, notes, status, type });
      if (onUpdate) onUpdate(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update mentee');
    } finally {
      setLoading(false);
    }
  };

  // Status is now handled by SelectOption and form submit

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteMentee(mentee.id);
      onDelete(mentee);
    } catch (err: any) {
      setError(err.message || 'Failed to delete mentee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-dark rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Mentee</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <MenteeFormFields
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          notes={notes}
          setNotes={setNotes}
          loading={loading}
          error={error}
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
            <SelectOption
              value={type}
              values={[
                { value: 'InPerson', label: 'In Person', icon: 'person' },
                { value: 'Online', label: 'Online', icon: 'wifi' },
                { value: 'Group', label: 'Group', icon: 'groups' },
              ]}
              onChange={setType}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <SelectOption
              value={status}
              values={[
                { value: 'Active', label: 'Active', icon: 'check_circle' },
                { value: 'Suspended', label: 'Suspended', icon: 'pause_circle' },
              ]}
              onChange={setStatus}
              disabled={loading}
            />
          </div>
        </MenteeFormFields>
        <div className="flex items-center justify-between gap-2 pt-2">
          <div className="flex-1 flex gap-2 justify-between">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1" disabled={loading}>Cancel</button>
            <button
              type="submit"
              className="btn btn-primary flex-1 ml-auto rounded-lg px-4 py-2 text-base font-bold shadow border border-primary/70 bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/30 transition"
              disabled={loading}
              style={{ fontWeight: 700, letterSpacing: '0.03em' }}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditMenteeDialog;
