import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback, user, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  // Process callback code from URL
  useEffect(() => {
    // Prevent multiple calls to the token endpoint
    if (hasProcessed.current) {
      return;
    }

    const processCallback = async () => {
      hasProcessed.current = true;

      // Check for error response from Auth0
      const errorParam = searchParams.get('error');
      const errorDescParam = searchParams.get('error_description');

      if (errorParam) {
        setError(errorDescParam || 'Authentication failed');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Get authorization code from URL
      const code = searchParams.get('code');
      
      if (!code) {
        setError('No authorization code received');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Exchange code for tokens
        const success = await handleCallback(code);
        
        if (!success) {
          setError('Failed to complete authentication');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred during authentication');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  // Redirect once user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && !error) {
      const target = user.role === 'gym'
        ? '/alerts'
        : user.role === 'platform'
          ? '/platform/subscription-history'
          : '/rooms';
      
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="text-center">
        {error ? (
          <div>
            <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
              Authentication Error
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              Completing authentication...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallbackPage;
