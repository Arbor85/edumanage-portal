import { AUTH0_CONFIG } from '@/config/auth0Config';
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
        userProfile = await fetchAuth0User(userToken);
        if (!userProfile) {
          console.warn('Auth0 user profile missing after restore. Check Auth0 configuration and token scope.');
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
          const result = await performOAuthLogin('google-oauth2');
          if (result) {
            const userProfile = await fetchAuth0User(result.accessToken);
            if (!userProfile) {
              console.warn('Auth0 user profile missing after Google sign-in. Check Auth0 domain, scopes, and /userinfo access.');
            }
            dispatch({
              type: 'SIGN_IN',
              payload: { token: result.accessToken, user: userProfile },
            });
            // Store token securely
            await SecureStore.setItemAsync('userToken', result.accessToken);
            if (Platform.OS === 'web') {
              await AsyncStorage.setItem('userToken', result.accessToken);
            }
          }
        } catch (e) {
          console.error('Google sign-in error:', e);
        }
      },
      signInWithGithub: async () => {
        try {
          const result = await performOAuthLogin('github');
          if (result) {
            const userProfile = await fetchAuth0User(result.accessToken);
            if (!userProfile) {
              console.warn('Auth0 user profile missing after GitHub sign-in. Check Auth0 domain, scopes, and /userinfo access.');
            }
            dispatch({
              type: 'SIGN_IN',
              payload: { token: result.accessToken, user: userProfile },
            });
            // Store token securely
            await SecureStore.setItemAsync('userToken', result.accessToken);
            if (Platform.OS === 'web') {
              await AsyncStorage.setItem('userToken', result.accessToken);
            }
          }
        } catch (e) {
          console.error('GitHub sign-in error:', e);
        }
      },
      signOut: async () => {
        try {
          await SecureStore.deleteItemAsync('userToken');
        } catch (e) {
          console.warn('Failed to delete token from SecureStore', e);
        }
        if (Platform.OS === 'web') {
          try {
            await AsyncStorage.removeItem('userToken');
          } catch (asyncStorageError) {
            console.warn('Failed to delete token from AsyncStorage', asyncStorageError);
          }
        }
        dispatch({ type: 'SIGN_OUT' });
      },
      signUp: async () => {
        try {
          const result = await performOAuthLogin('google-oauth2', true);
          if (result) {
            const userProfile = await fetchAuth0User(result.accessToken);
            if (!userProfile) {
              console.warn('Auth0 user profile missing after sign-up. Check Auth0 domain, scopes, and /userinfo access.');
            }
            dispatch({
              type: 'SIGN_UP',
              payload: { token: result.accessToken, user: userProfile },
            });
            // Store token securely
            await SecureStore.setItemAsync('userToken', result.accessToken);
            if (Platform.OS === 'web') {
              await AsyncStorage.setItem('userToken', result.accessToken);
            }
          }
        } catch (e) {
          console.error('Sign up error:', e);
        }
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

async function fetchAuth0User(accessToken: string) {
  if (!accessToken) {
    console.warn('Auth0 /userinfo skipped: missing access token.');
    return null;
  }

  if (!AUTH0_CONFIG.domain || AUTH0_CONFIG.domain.includes('YOUR_AUTH0_DOMAIN')) {
    console.warn('Auth0 /userinfo skipped: missing or placeholder AUTH0 domain.');
    return null;
  }

  try {
    const response = await fetch(`https://${AUTH0_CONFIG.domain}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.warn('Auth0 /userinfo request failed:', response.status, response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch Auth0 user profile', error);
    return null;
  }
}

/**
 * Performs OAuth login with Auth0
 * @param connection - Auth0 connection type (google-oauth2, github, etc.)
 * @param isSignup - Whether this is a signup flow
 */
async function performOAuthLogin(
  connection: string,
  isSignup: boolean = false
) {
  try {
    if (!AUTH0_CONFIG.domain || !AUTH0_CONFIG.clientId) {
      console.error('Auth0 configuration is missing. Check .env values.');
      return null;
    }

    const issuer = `https://${AUTH0_CONFIG.domain}`;
    const discovery = await AuthSession.fetchDiscoveryAsync(issuer);
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: AUTH0_CONFIG.scheme,
      path: 'callback',
    });

    const request = new AuthSession.AuthRequest({
      clientId: AUTH0_CONFIG.clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      usePKCE: true,
      extraParams: {
        connection,
        ...(AUTH0_CONFIG.audience ? { audience: AUTH0_CONFIG.audience } : {}),
        ...(isSignup ? { screen_hint: 'signup' } : {}),
      },
    });

    const authResult = await request.promptAsync(discovery, {
      useProxy: false,
    });

    if (authResult.type !== 'success') {
      console.warn('Auth0 authorization did not succeed:', authResult.type);
      return null;
    }

    if (!authResult.params?.code) {
      console.warn('Auth0 authorization missing code.');
      return null;
    }

    const tokenResult = await AuthSession.exchangeCodeAsync(
      {
        clientId: AUTH0_CONFIG.clientId,
        code: authResult.params.code,
        redirectUri,
        extraParams: {
          code_verifier: request.codeVerifier || '',
        },
      },
      discovery
    );

    if (!tokenResult?.accessToken) {
      console.warn('Auth0 token exchange did not return access token.');
      return null;
    }

    return {
      accessToken: tokenResult.accessToken,
    };
  } catch (error) {
    console.error(`OAuth login failed for ${connection}:`, error);
    throw error;
  }
}
