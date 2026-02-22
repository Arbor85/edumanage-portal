import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const DataItem: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => (
    <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
      <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</dt>
      <dd className="text-base text-slate-900 dark:text-slate-100 break-all">
        {value || <span className="text-slate-400 dark:text-slate-500 italic">Not available</span>}
      </dd>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.username}
                className="size-20 rounded-full border-4 border-white dark:border-slate-800 shadow-lg"
              />
            ) : (
              <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                <span className="material-symbols-outlined text-4xl text-primary">person</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.username || 'User Profile'}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Role: <span className="font-semibold text-primary">{user?.role?.toUpperCase()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_circle</span>
            User Information
          </h2>
          <dl className="space-y-3">
            <DataItem label="Display Name" value={user?.username} />
            <DataItem label="Email" value={user?.email} />
            <DataItem label="Application Role" value={user?.role} />
            <DataItem label="Auth0 Role" value={user?.auth0_role} />
          </dl>
        </div>

        {/* Help Text */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xl">info</span>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p className="font-medium mb-1">About This Profile</p>
              <p>
                This page displays your user profile information including your display name, email, and assigned role.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
