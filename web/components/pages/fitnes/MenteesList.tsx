import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMentees, createMentee, deleteMentee } from '../../../services/menteesService';
import { getTrainingPlans, deleteTrainingPlan } from '../../../services/trainingPlanService';
import { useAuth } from '../../../contexts/AuthContext';
import { Mentee } from '../../../types';
import WorkoutActionBar from './components/WorkoutActionBar';

interface MenteesListProps {
  onInvite?: () => void;
}

const MenteesList: React.FC<MenteesListProps> = ({ onInvite }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [selectedInviteKey, setSelectedInviteKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [menteeToDelete, setMenteeToDelete] = useState<Mentee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'email_address' | 'status' | 'created'>('created');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadMentees();
  }, []);

  const loadMentees = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.sub) {
        throw new Error('User not authenticated');
      }
      const data = await getMentees(user.sub);
      setMentees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentees');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError('Please fill in all fields');
      return;
    }

    setInviteLoading(true);
    setInviteError(null);
    try {
      if (!user?.sub) {
        throw new Error('User not authenticated');
      }
      const newMentee = await createMentee({
        name: inviteName,
        email_address: inviteEmail,
        creator_id: user.sub
      });
      setMentees([...mentees, newMentee]);
      setInviteName('');
      setInviteEmail('');
      setShowInviteForm(false);
      if (onInvite) onInvite();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to create mentee');
    } finally {
      setInviteLoading(false);
    }
  }

  const handleCopyInviteKey = (inviteKey: string) => {
    setSelectedInviteKey(inviteKey);
  };

  const handleCopyUrl = () => {
    if (!selectedInviteKey) return;
    const inviteUrl = `${window.location.origin}/accept-invitation?key=${selectedInviteKey}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteMentee = async () => {
    if (!menteeToDelete) return;
    setIsDeleting(true);
    try {
      // Delete all plans assigned to this mentee
      const assignedPlans = await getTrainingPlans(undefined, menteeToDelete.id);
      for (const plan of assignedPlans) {
        await deleteTrainingPlan(plan.id);
      }
      // Delete the mentee
      await deleteMentee(menteeToDelete.id);
      setMentees(mentees.filter(m => m.id !== menteeToDelete.id));
      setMenteeToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete mentee');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'invited':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            Invited
          </span>
        );
      case 'accepted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
            Accepted
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleSort = (field: 'name' | 'email_address' | 'status' | 'created') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedMentees = mentees
    .filter((mentee) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        mentee.name.toLowerCase().includes(searchLower) ||
        mentee.email_address.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];

      if (sortField === 'created') {
        aValue = new Date(a.created).getTime();
        bValue = new Date(b.created).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-32">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mentees ({mentees.length})</h2>
        <button
          type="button"
          onClick={() => loadMentees()}
          disabled={loading}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-60 transition"
          aria-label="Refresh mentees"
        >
          <span className="material-symbols-outlined text-primary text-sm">refresh</span>
        </button>
      </div>

      {mentees.length > 0 && (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {filteredAndSortedMentees.length === 0 && mentees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 max-w-md w-full text-center space-y-4 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-center">
                <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-6">
                  <span className="material-symbols-outlined text-6xl text-primary">
                    people_outline
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  No Mentees Yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Get started by inviting your first mentee. They'll receive a unique invitation link to join your mentorship program.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowInviteForm(true);
                  setInviteError(null);
                }}
                className="flex items-center gap-2 justify-center px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition w-full"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Invite Your First Mentee
              </button>
            </div>
          </div>
        ) : filteredAndSortedMentees.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <span className="material-symbols-outlined text-4xl mb-2 block">search_off</span>
            <p>No mentees found matching "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th 
                    onClick={() => handleSort('name')}
                    className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortField === 'name' && (
                        <span className="material-symbols-outlined text-sm">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('email_address')}
                    className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      Email
                      {sortField === 'email_address' && (
                        <span className="material-symbols-outlined text-sm">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortField === 'status' && (
                        <span className="material-symbols-outlined text-sm">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('created')}
                    className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition select-none"
                  >
                    <div className="flex items-center gap-1">
                      Created
                      {sortField === 'created' && (
                        <span className="material-symbols-outlined text-sm">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedMentees.map((mentee) => (
                  <tr
                    key={mentee.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="py-3 px-4 text-slate-900 dark:text-white">{mentee.name}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{mentee.email_address}</td>
                    <td className="py-3 px-4">{getStatusBadge(mentee.status)}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{formatDate(mentee.created)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/split-plans/create?mentee=${mentee.id}`}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-green-100 hover:bg-green-200 dark:bg-green-950 dark:hover:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium transition"
                        >
                          <span className="material-symbols-outlined text-sm">add_circle</span>
                          Create Plan
                        </Link>
                        <Link
                          to={`/split-plans?mentee=${mentee.id}`}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 text-primary text-xs font-medium transition"
                        >
                          <span className="material-symbols-outlined text-sm">fitness_center</span>
                          Plans
                        </Link>
                        {mentee.status === 'invited' && (
                          <button
                            onClick={() => handleCopyInviteKey(mentee.invite_key)}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium transition"
                          >
                            <span className="material-symbols-outlined text-sm">share</span>
                            Share
                          </button>
                        )}
                        <button
                          onClick={() => setMenteeToDelete(mentee)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-red-100 hover:bg-red-200 dark:bg-red-950 dark:hover:bg-red-900 text-red-700 dark:text-red-300 text-xs font-medium transition"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedInviteKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Share Invitation</h3>
              <button
                onClick={() => setSelectedInviteKey(null)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              Share this URL with the mentee to invite them:
            </p>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 break-all">
              <code className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                {`${window.location.origin}/accept-invitation?key=${selectedInviteKey}`}
              </code>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyUrl}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 rounded font-medium flex items-center justify-center gap-2 transition"
              >
                <span className="material-symbols-outlined text-sm">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
              <button
                onClick={() => setSelectedInviteKey(null)}
                className="flex-1 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white py-2 rounded font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showInviteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Invite New Mentee</h3>
              <button
                onClick={() => {
                  setShowInviteForm(false);
                  setInviteError(null);
                }}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {inviteError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3 text-red-700 dark:text-red-300 text-sm">
                {inviteError}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Enter mentee's name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter mentee's email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-2 rounded font-medium transition flex items-center justify-center gap-2"
                >
                  {inviteLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">add</span>
                      Create & Invite
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteError(null);
                  }}
                  className="flex-1 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white py-2 rounded font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {menteeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Mentee</h3>
              <button
                onClick={() => setMenteeToDelete(null)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <strong>{menteeToDelete.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleDeleteMentee}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 rounded font-medium flex items-center justify-center gap-2 transition"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Delete
                  </>
                )}
              </button>
              <button
                onClick={() => setMenteeToDelete(null)}
                disabled={isDeleting}
                className="flex-1 bg-slate-300 hover:bg-slate-400 disabled:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:disabled:bg-slate-800 text-slate-900 dark:text-white py-2 rounded font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <WorkoutActionBar
        primaryAction={{
          label: 'Invite Mentee',
          icon: 'add_circle',
          onClick: () => {
            setShowInviteForm(true);
            setInviteError(null);
          }
        }}
      />
    </div>
  );
};

export default MenteesList;
