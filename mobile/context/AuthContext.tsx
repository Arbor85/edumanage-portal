import { OAUTH_CONFIG, OAUTH_ENDPOINTS } from '@/config/auth0Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { Platform } from 'react-native';

// Complete the web browser polyfill automatically
WebBrowser.maybeCompleteAuthSession();

export interface AuthContextType {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  user: any | null;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  signUp: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = React.useReducer(
    (prevState: any, action: any) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.payload?.token ?? action.payload,
            user: action.payload?.user ?? null,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.payload.token,
            user: action.payload.user,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            user: null,
          };
        case 'SIGN_UP':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.payload.token,
            user: action.payload.user,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      user: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      let userProfile = null;
      try {
        // Restore token stored in `SecureStore` (preferred for native)
        userToken = await SecureStore.getItemAsync('userToken');
      } catch (e) {
        console.warn('Failed to restore token from SecureStore', e);
      }

      // Fallback to AsyncStorage only on web platform
      if (!userToken && Platform.OS === 'web') {
        try {
          userToken = await AsyncStorage.getItem('userToken');
        } catch (asyncStorageError) {
          console.warn('Failed to restore token from AsyncStorage', asyncStorageError);
        }
      }

      if (userToken) {
        let authProvider = 'google';
        try {
          authProvider = (await SecureStore.getItemAsync('authProvider')) || 'google';
        } catch (e) {
          if (Platform.OS === 'web') {
            authProvider = (await AsyncStorage.getItem('authProvider')) || 'google';
          }
        }
        
        if (authProvider === 'google') {
          userProfile = await fetchGoogleUser(userToken);
        } else if (authProvider === 'github') {
          userProfile = await fetchGithubUser(userToken);
        }
        
        if (!userProfile) {
          console.warn('User profile missing after restore.');
        }
      }

      dispatch({ type: 'RESTORE_TOKEN', payload: { token: userToken, user: userProfile } });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signInWithGoogle: async () => {
        try {
          const result = await performGoogleLogin();
          if (result) {
            const userProfile = await fetchGoogleUser(result.accessToken);
            if (!userProfile) {
              console.warn('Google user profile missing after sign-in.');
            }
            dispatch({
              type: 'SIGN_IN',
              payload: { token: result.accessToken, user: userProfile },
            });
            // Store token securely
            await SecureStore.setItemAsync('userToken', result.accessToken);
            await SecureStore.setItemAsync('authProvider', 'google');
            if (Platform.OS === 'web') {
              await AsyncStorage.setItem('userToken', result.accessToken);
              await AsyncStorage.setItem('authProvider', 'google');
            }
          }
        } catch (e) {
          console.error('Google sign-in error:', e);
        }
      },
      signInWithGithub: async () => {
        try {
          const result = await performGithubLogin();
          if (result) {
            const userProfile = await fetchGithubUser(result.accessToken);
            if (!userProfile) {
              console.warn('GitHub user profile missing after sign-in.');
            }
            dispatch({
              type: 'SIGN_IN',
              payload: { token: result.accessToken, user: userProfile },
            });
            // Store token securely
            await SecureStore.setItemAsync('userToken', result.accessToken);
            await SecureStore.setItemAsync('authProvider', 'github');
            if (Platform.OS === 'web') {
              await AsyncStorage.setItem('userToken', result.accessToken);
              await AsyncStorage.setItem('authProvider', 'github');
            }
          }
        } catch (e) {
          console.error('GitHub sign-in error:', e);
        }
      },
      signOut: async () => {
        try {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('authProvider');
        } catch (e) {
          console.warn('Failed to delete token from SecureStore', e);
        }
        if (Platform.OS === 'web') {
          try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('authProvider');
          } catch (asyncStorageError) {
            console.warn('Failed to delete token from AsyncStorage', asyncStorageError);
          }
        }
        dispatch({ type: 'SIGN_OUT' });
      },
      signUp: async () => {
        // Just redirect to Google sign-in (Google doesn't distinguish between sign-in and sign-up)
        return authContext.signInWithGoogle();
      },
    }),
    []
  );

  const value: AuthContextType = {
    ...state,
    ...authContext,
    isLoading: state.isLoading,
    isSignout: state.isSignout,
    userToken: state.userToken,
    user: state.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Fetch Google user profile
 */
async function fetchGoogleUser(accessToken: string) {
  if (!accessToken) {
    console.warn('Google userinfo skipped: missing access token.');
    return null;
  }

  try {
    const response = await fetch(OAUTH_ENDPOINTS.google.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.warn('Google userinfo request failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return {
      name: data.name,
      email: data.email,
      picture: data.picture,
      sub: data.id,
    };
  } catch (error) {
    console.warn('Failed to fetch Google user profile', error);
    return null;
  }
}

/**
 * Fetch GitHub user profile
 */
async function fetchGithubUser(accessToken: string) {
  if (!accessToken) {
    console.warn('GitHub user API skipped: missing access token.');
    return null;
  }

  try {
    const response = await fetch(OAUTH_ENDPOINTS.github.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      console.warn('GitHub user API request failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return {
      name: data.name || data.login,
      email: data.email,
      picture: data.avatar_url,
      sub: data.id.toString(),
      username: data.login,
    };
  } catch (error) {
    console.warn('Failed to fetch GitHub user profile', error);
    return null;
  }
}

/**
 * Performs OAuth login with Google
 */
async function performGoogleLogin() {
  try {
    if (!OAUTH_CONFIG.google.clientId) {
      console.error('Google OAuth configuration is missing. Check .env for EXPO_PUBLIC_GOOGLE_CLIENT_ID.');
      return null;
    }

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: OAUTH_CONFIG.scheme,
      path: 'callback',
    });

    console.log('Google OAuth Redirect URI:', redirectUri);

    const discovery = {
      authorizationEndpoint: OAUTH_ENDPOINTS.google.authorizationEndpoint,
      tokenEndpoint: OAUTH_ENDPOINTS.google.tokenEndpoint,
      revocationEndpoint: OAUTH_ENDPOINTS.google.revocationEndpoint,
    };

    const request = new AuthSession.AuthRequest({
      clientId: OAUTH_CONFIG.google.clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      usePKCE: true,
      responseType: AuthSession.ResponseType.Code,
    });

    const authResult = await request.promptAsync(discovery, {
      useProxy: false,
    });

    if (authResult.type !== 'success') {
      console.warn('Google authorization did not succeed:', authResult.type);
      return null;
    }

    if (!authResult.params?.code) {
      console.warn('Google authorization missing code.');
      return null;
    }

    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId: OAUTH_CONFIG.google.clientId,
        code: authResult.params.code,
        redirectUri,
        extraParams: {
          code_verifier: request.codeVerifier || '',
        },
      },
      discovery
    );

    if (!tokenResult?.accessToken) {
      console.warn('Google token exchange did not return access token.');
      return null;
    }

    return {
      accessToken: tokenResult.accessToken,
    };
  } catch (error) {
    console.error('Google OAuth login failed:', error);
    throw error;
  }
}

/**
 * Performs OAuth login with GitHub
 */
async function performGithubLogin() {
  try {
    if (!OAUTH_CONFIG.github.clientId || !OAUTH_CONFIG.github.clientSecret) {
      console.error('GitHub OAuth configuration is missing. Check .env for EXPO_PUBLIC_GITHUB_CLIENT_ID and EXPO_PUBLIC_GITHUB_CLIENT_SECRET.');
      return null;
    }

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: OAUTH_CONFIG.scheme,
      path: 'callback',
    });

    console.log('GitHub OAuth Redirect URI:', redirectUri);

    const discovery = {
      authorizationEndpoint: OAUTH_ENDPOINTS.github.authorizationEndpoint,
      tokenEndpoint: OAUTH_ENDPOINTS.github.tokenEndpoint,
      revocationEndpoint: OAUTH_ENDPOINTS.github.revocationEndpoint,
    };

    const request = new AuthSession.AuthRequest({
      clientId: OAUTH_CONFIG.github.clientId,
      scopes: ['read:user', 'user:email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    });

    const authResult = await request.promptAsync(discovery, {
      useProxy: false,
    });

    if (authResult.type !== 'success') {
      console.warn('GitHub authorization did not succeed:', authResult.type);
      return null;
    }

    if (!authResult.params?.code) {
      console.warn('GitHub authorization missing code.');
      return null;
    }

    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId: OAUTH_CONFIG.github.clientId,
        code: authResult.params.code,
        redirectUri,
        extraParams: {
          client_secret: OAUTH_CONFIG.github.clientSecret,
        },
      },
      discovery
    );

    if (!tokenResult?.accessToken) {
      console.warn('GitHub token exchange did not return access token.');
      return null;
    }

    return {
      accessToken: tokenResult.accessToken,
    };
  } catch (error) {
    console.error('GitHub OAuth login failed:', error);
    throw error;
  }
}
