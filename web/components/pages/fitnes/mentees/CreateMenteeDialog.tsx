import React, { useState } from 'react';
import SelectOption from './SelectOption';
import MenteeFormFields from './MenteeFormFields';
import { createMentee } from '../../../../services/menteesService';
import { Mentee } from '../../../../types';
import { useAuth } from '../../../../contexts/AuthContext';

interface CreateMenteeDialogProps {
    onClose: () => void;
    onCreate: (mentee: Mentee) => void;
}

const CreateMenteeDialog: React.FC<CreateMenteeDialogProps> = ({ onClose, onCreate }) => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [type, setType] = useState<'InPerson' | 'Online' | 'Group'>('InPerson');
    const [status, setStatus] = useState<'Active' | 'Suspended'>('Active');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter a name');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            if (!user?.sub) throw new Error('User not authenticated');
            const newMentee = await createMentee({
                name,
                email_address: email || undefined,
                creator_id: user.sub,
                type,
                status,
                notes: notes || undefined,
            });
            onCreate(newMentee);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create mentee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-dark rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Invite Mentee</h3>
                    <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">{error}</div>}
                <div className="space-y-3">
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
                </div>
                <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="flex-1 flex gap-2 justify-between">
                        <button type="button" onClick={onClose} className="btn btn-secondary flex-1" disabled={loading}>Cancel</button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1 ml-auto rounded-lg px-4 py-2 text-base font-bold shadow border border-primary/70 bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/30 transition"
                            disabled={loading}
                            style={{ fontWeight: 700, letterSpacing: '0.03em' }}
                        >
                            {loading ? 'Inviting...' : 'Invite'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateMenteeDialog;
