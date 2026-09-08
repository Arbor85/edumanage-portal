import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { clearStoredSession, loadStoredSession, saveStoredSession } from './storage';
import { getAuth0Config } from './config';
import type { AuthContextValue, AuthSession as StoredAuthSession, AuthUser } from './types';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected authentication error occurred.';
}

function buildDiscoveryDocument(issuer: string): AuthSession.DiscoveryDocument {
  return {
    authorizationEndpoint: `${issuer}/authorize`,
    endSessionEndpoint: `${issuer}/v2/logout`,
    revocationEndpoint: `${issuer}/oauth/revoke`,
    tokenEndpoint: `${issuer}/oauth/token`,
    userInfoEndpoint: `${issuer}/userinfo`,
  };
}

async function fetchUserProfile(
  userInfoEndpoint: string,
  accessToken: string,
): Promise<AuthUser> {
  const response = await fetch(userInfoEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Auth0 profile request failed.');
  }

  return (await response.json()) as AuthUser;
}

function createNextSession(
  tokenResponse: AuthSession.TokenResponse,
  currentUser: AuthUser,
  fallbackRefreshToken?: string,
): StoredAuthSession {
  return {
    accessToken: tokenResponse.accessToken,
    expiresAt: tokenResponse.issuedAt
      ? tokenResponse.issuedAt + tokenResponse.expiresIn
      : undefined,
    idToken: tokenResponse.idToken,
    refreshToken: tokenResponse.refreshToken ?? fallbackRefreshToken,
    user: currentUser,
  };
}

function isSessionExpired(session: StoredAuthSession): boolean {
  if (!session.expiresAt) {
    return false;
  }

  return session.expiresAt <= Math.floor(Date.now() / 1000) + 60;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const config = useMemo(() => getAuth0Config(), []);
  const discovery = useMemo(
    () => (config.isConfigured ? buildDiscoveryDocument(config.issuer) : null),
    [config],
  );
  const [session, setSession] = useState<StoredAuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: config.clientId || 'missing-auth0-client-id',
      redirectUri: config.redirectUri,
      responseType: AuthSession.ResponseType.Code,
      scopes: config.scopes,
      usePKCE: true,
      ...(config.audience ? { extraParams: { audience: config.audience } } : {}),
    },
    discovery,
  );

  const refreshSession = useCallback(
    async (existingSession?: StoredAuthSession | null) => {
      if (!config.isConfigured || !discovery) {
        return;
      }

      const sessionToRefresh = existingSession ?? session;

      if (!sessionToRefresh?.refreshToken) {
        throw new Error('No refresh token is available for this session.');
      }

      const refreshedTokens = await AuthSession.refreshAsync(
        {
          clientId: config.clientId,
          refreshToken: sessionToRefresh.refreshToken,
          scopes: config.scopes,
          ...(config.audience ? { extraParams: { audience: config.audience } } : {}),
        },
        discovery,
      );

      const currentUser = await fetchUserProfile(
        discovery.userInfoEndpoint,
        refreshedTokens.accessToken,
      );
      const nextSession = createNextSession(
        refreshedTokens,
        currentUser,
        sessionToRefresh.refreshToken,
      );

      await saveStoredSession(nextSession);
      setSession(nextSession);
    },
    [config, discovery, session],
  );

  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      try {
        if (!config.isConfigured) {
          return;
        }

        const storedSession = await loadStoredSession();

        if (!storedSession) {
          return;
        }

        if (isSessionExpired(storedSession)) {
          if (!storedSession.refreshToken) {
            await clearStoredSession();
            return;
          }

          await refreshSession(storedSession);
          return;
        }

        if (isActive) {
          setSession(storedSession);
        }
      } catch (restoreError) {
        await clearStoredSession();

        if (isActive) {
          setError(getAuthErrorMessage(restoreError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isActive = false;
    };
  }, [config.isConfigured, refreshSession]);

  useEffect(() => {
    if (response?.type !== 'success' || !request?.codeVerifier || !discovery) {
      return;
    }

    let isActive = true;

    const completeAuthentication = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: config.clientId,
            code: response.params.code,
            redirectUri: config.redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier,
              ...(config.audience ? { audience: config.audience } : {}),
            },
          },
          discovery,
        );
        const currentUser = await fetchUserProfile(
          discovery.userInfoEndpoint,
          tokenResponse.accessToken,
        );
        const nextSession = createNextSession(tokenResponse, currentUser);

        await saveStoredSession(nextSession);

        if (isActive) {
          setSession(nextSession);
        }
      } catch (exchangeError) {
        await clearStoredSession();

        if (isActive) {
          setError(getAuthErrorMessage(exchangeError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
          setIsSigningIn(false);
        }
      }
    };

    completeAuthentication();

    return () => {
      isActive = false;
    };
  }, [config, discovery, request?.codeVerifier, response]);

  const signIn = useCallback(async () => {
    if (!config.isConfigured) {
      setError(
        `Missing Auth0 configuration: ${config.missingConfig.join(', ')}.`,
      );
      return;
    }

    if (!request) {
      setError('Auth0 is still preparing the sign-in request.');
      return;
    }

    setError(null);
    setIsSigningIn(true);

    const result = await promptAsync();

    if (result.type === 'cancel' || result.type === 'dismiss') {
      setIsSigningIn(false);
      return;
    }

    if (result.type === 'error') {
      setError(result.error?.message ?? 'Auth0 sign-in failed.');
      setIsSigningIn(false);
    }
  }, [config, promptAsync, request]);

  const signOut = useCallback(async () => {
    if (config.isConfigured && discovery?.endSessionEndpoint) {
      const logoutUrl = `${discovery.endSessionEndpoint}?${new URLSearchParams({
        client_id: config.clientId,
        returnTo: config.logoutRedirectUri,
      }).toString()}`;

      await WebBrowser.openAuthSessionAsync(
        logoutUrl,
        config.logoutRedirectUri,
      );
    }

    await clearStoredSession();
    setSession(null);
    setError(null);
  }, [config, discovery?.endSessionEndpoint]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      clearError,
      error,
      isConfigured: config.isConfigured,
      isLoading,
      isSigningIn,
      missingConfig: config.missingConfig,
      refreshSession: () => refreshSession(),
      session,
      signIn,
      signOut,
    }),
    [
      clearError,
      config.isConfigured,
      config.missingConfig,
      error,
      isLoading,
      isSigningIn,
      refreshSession,
      session,
      signIn,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
