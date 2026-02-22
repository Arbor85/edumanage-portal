import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth0Service } from '../services/auth0Service';

export type UserRole = 'plan' | 'gym' | 'platform';

export interface User {
  username: string;
  email: string;
  role: UserRole;
  sub?: string;
  picture?: string;
  auth0_role?: string; // Raw Auth0 role for reference
}

/**
 * Map Auth0 role strings to application roles
 * Configure this mapping based on your Auth0 role names
 */
function mapAuth0RoleToAppRole(auth0Role: string | null): UserRole {
  if (!auth0Role) return 'gym';
  
  const roleMap: Record<string, UserRole> = {
    'plan': 'plan',
    'gym': 'gym',
    'fitness': 'gym', // Alternative name
    'platform': 'platform',
    'admin': 'platform' // Admins get platform access
  };
  
  return roleMap[auth0Role.toLowerCase()] || 'gym';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (provider?: 'auth0' | 'google' | 'github' | 'facebook') => void;
  logout: () => void;
  handleCallback: (code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize from Auth0 session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (auth0Service.isAuthenticated()) {
          const auth0User = auth0Service.getUser();
          if (auth0User) {
            // Get role from Auth0 custom claims
            const auth0Role = auth0Service.getUserRole();
            const appRole = mapAuth0RoleToAppRole(auth0Role);
            const userData: User = {
              username: auth0User.name || auth0User.email || 'User',
              email: auth0User.email || '',
              role: appRole,
              sub: auth0User.sub,
              picture: auth0User.picture,
              auth0_role: auth0Role || undefined
            };
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (provider?: 'auth0' | 'google' | 'github' | 'facebook') => {
    setIsLoading(true);
    // Redirect to Auth0 login (role will be retrieved from Auth0 during callback)
    if (provider === 'google') {
      window.location.href = auth0Service.getGoogleLoginUrl();
    } else if (provider === 'github') {
      window.location.href = auth0Service.getGitHubLoginUrl();
    } else if (provider === 'facebook') {
      window.location.href = auth0Service.getFacebookLoginUrl();
    } else {
      window.location.href = auth0Service.getLoginUrl();
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    auth0Service.logout();
  };

  const handleCallback = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await auth0Service.handleCallback(code);
      if (success) {
        const auth0User = auth0Service.getUser();
        if (auth0User) {
          // Get role from Auth0 custom claims
          const auth0Role = auth0Service.getUserRole();
          const appRole = mapAuth0RoleToAppRole(auth0Role);
          const userData: User = {
            username: auth0User.name || auth0User.email || 'User',
            email: auth0User.email || '',
            role: appRole,
            sub: auth0User.sub,
            picture: auth0User.picture,
            auth0_role: auth0Role || undefined
          };
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
      return success;
    } catch (error) {
      console.error('Authentication callback failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, handleCallback }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
