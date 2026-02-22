/**
 * Auth0 Configuration
 * Update these values with your Auth0 application credentials
 */

export const auth0Config = {
  // Your Auth0 domain (e.g., "your-app.auth0.com")
  domain: import.meta.env.VITE_AUTH0_DOMAIN || 'YOUR_AUTH0_DOMAIN',
  
  // Your Auth0 application ID
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || 'YOUR_AUTH0_CLIENT_ID',
  
  // Redirect URL after successful login (typically your app URL)
  redirectUri: `${window.location.origin}/callback`,
  
  // Redirect URL after logout
  postLogoutRedirectUri: `${window.location.origin}/`,
  
  // Auth0 audience (optional, only if you have an API configured)
  audience: import.meta.env.VITE_AUTH0_AUDIENCE || undefined,
  
  // Scopes to request
  scope: 'openid profile email'
};
