import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { acceptInvitation } from '../../../services/menteesService';
import { useAuth } from '../../../contexts/AuthContext';

const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inviteKey = searchParams.get('key');

  useEffect(() => {
    if (!inviteKey) {
      setError('Invalid invitation link. No invite key provided.');
    }
  }, [inviteKey]);

  useEffect(() => {
    if (user?.username) {
      setName(user.username);
    }
  }, [user?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!inviteKey) {
      setError('Invalid invitation link');
      return;
    }

    if (!user?.sub) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await acceptInvitation(inviteKey, name, user.sub);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 w-12 rounded-md object-contain mx-auto"
              loading="lazy"
            />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Accept Invitation
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              You've been invited to join as a mentee. Complete your profile to get started.
            </p>
          </div>

          {success && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4 text-green-700 dark:text-green-300 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="material-symbols-outlined">check_circle</span>
                <span className="font-semibold">Invitation accepted!</span>
              </div>
              <p className="text-sm">Redirecting you...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {!user && !success && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 text-center space-y-3">
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Please log in to accept this invitation.
              </p>
              <a
                href="/login"
                className="inline-block px-6 py-2 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition"
              >
                Sign In
              </a>
            </div>
          )}

          {user && !success && (
            <>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-2 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Logged in as</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={loading}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !inviteKey}
                  className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">check</span>
                      Accept Invitation
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            {user ? (
              <p>Is that not you? <button onClick={logout} className="text-primary hover:underline font-semibold cursor-pointer">Logout</button></p>
            ) : (
              <p>Already have an account? <a href="/login" className="text-primary hover:underline font-semibold">Sign in</a></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;
