import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const target = user.role === 'gym'
        ? '/alerts'
        : user.role === 'platform'
          ? '/platform/subscription-history'
          : '/rooms';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login('auth0');
  };

  const handleGoogleLogin = () => {
    login('google');
  };

  const handleGitHubLogin = () => {
    login('github');
  };

  const handleFacebookLogin = () => {
    login('facebook');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl shadow-black/5 p-8 w-full max-w-md border border-slate-200 dark:border-border-dark">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Login</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            Your access level is determined by your Auth0 profile
          </p>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-lg border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm active:scale-[0.99] flex items-center justify-center gap-3"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>
          <button
            type="button"
            onClick={handleGitHubLogin}
            className="w-full bg-slate-900 dark:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg border-2 border-slate-900 dark:border-slate-700 hover:bg-slate-800 dark:hover:bg-slate-700 transition shadow-sm active:scale-[0.99] flex items-center justify-center gap-3"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
            </svg>
            {isLoading ? 'Redirecting...' : 'Continue with GitHub'}
          </button>
          <button
            type="button"
            onClick={handleFacebookLogin}
            className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-lg border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm active:scale-[0.99] flex items-center justify-center gap-3"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {isLoading ? 'Redirecting...' : 'Continue with Facebook'}
          </button>
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-300 dark:border-slate-600 w-full"></div>
            <span className="absolute bg-white dark:bg-surface-dark px-3 text-xs text-slate-500 dark:text-slate-400">OR</span>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-[0.99]"
            disabled={isLoading}
          >
            {isLoading ? 'Redirecting to Auth0...' : 'Login with Auth0'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
