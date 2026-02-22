import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl shadow-black/5 p-8 w-full max-w-lg border border-slate-200 dark:border-border-dark text-center">
        <div className="mx-auto mb-5 flex items-center justify-center size-14 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Access denied</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">You do not have permission to view this page.</p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/alerts', { replace: true })}
            className="w-full sm:w-auto bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20"
          >
            Go to Alerts
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 font-bold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
