import * as AuthSession from 'expo-auth-session';

const DEFAULT_SCHEME = 'com.edumanage.mobile';
const DEFAULT_SCOPES = ['openid', 'profile', 'email', 'offline_access'];

export interface Auth0Config {
  audience?: string;
  clientId: string;
  domain: string;
  isConfigured: boolean;
  issuer: string;
  logoutRedirectUri: string;
  missingConfig: string[];
  redirectUri: string;
  scheme: string;
  scopes: string[];
}

export function getAuth0Config(): Auth0Config {
  const domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN?.trim() ?? '';
  const clientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID?.trim() ?? '';
  const audience = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE?.trim() || undefined;
  const scheme = process.env.EXPO_PUBLIC_AUTH0_SCHEME?.trim() || DEFAULT_SCHEME;
  const missingConfig = [];

  if (!domain) {
    missingConfig.push('EXPO_PUBLIC_AUTH0_DOMAIN');
  }

  if (!clientId) {
    missingConfig.push('EXPO_PUBLIC_AUTH0_CLIENT_ID');
  }

  const issuer = domain ? `https://${domain}` : '';

  return {
    audience,
    clientId,
    domain,
    isConfigured: missingConfig.length === 0,
    issuer,
    logoutRedirectUri: AuthSession.makeRedirectUri({ scheme, path: 'logout/callback' }),
    missingConfig,
    redirectUri: AuthSession.makeRedirectUri({ scheme, path: 'auth/callback' }),
    scheme,
    scopes: DEFAULT_SCOPES,
  };
}
