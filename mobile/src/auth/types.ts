export interface AuthUser {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
  updated_at?: string;
}

export interface AuthSession {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user: AuthUser;
}

export interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  isSigningIn: boolean;
  isConfigured: boolean;
  missingConfig: string[];
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}
