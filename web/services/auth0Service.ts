/**
 * Auth0 Authentication Service
 * Handles Auth0 login, logout, token management, and user info retrieval
 */

import { auth0Config } from '../auth0-config';

interface Auth0User {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  email_verified?: boolean;
  [key: string]: any; // For custom claims including roles
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  id_token?: string;
  scope?: string;
}

class Auth0Service {
  private accessToken: string | null = null;
  private idToken: string | null = null;
  private expiresAt: number | null = null;
  private user: Auth0User | null = null;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Generate Auth0 authorization URL
   */
  getLoginUrl(connection?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: auth0Config.clientId,
      redirect_uri: auth0Config.redirectUri,
      scope: auth0Config.scope,
      ...(auth0Config.audience && { audience: auth0Config.audience }),
      ...(connection && { connection })
    });

    return `https://${auth0Config.domain}/authorize?${params.toString()}`;
  }

  /**
   * Generate Google login URL (shortcut)
   */
  getGoogleLoginUrl(): string {
    return this.getLoginUrl('google-oauth2');
  }

  /**
   * Generate GitHub login URL (shortcut)
   */
  getGitHubLoginUrl(): string {
    return this.getLoginUrl('github');
  }

  /**
   * Generate Facebook login URL (shortcut)
   */
  getFacebookLoginUrl(): string {
    return this.getLoginUrl('facebook');
  }

  /**
   * Generate Auth0 logout URL
   */
  getLogoutUrl(): string {
    const params = new URLSearchParams({
      client_id: auth0Config.clientId,
      returnTo: auth0Config.postLogoutRedirectUri
    });

    return `https://${auth0Config.domain}/v2/logout?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   * This should be called from the callback page
   */
  async handleCallback(code: string): Promise<boolean> {
    try {
      // Get backend API URL from environment
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const tokenUrl = `${apiBaseUrl}/api/auth/token`;
      
      // Exchange code for tokens via your backend
      // Send the redirect_uri that was used in the authorization request
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          code,
          redirect_uri: auth0Config.redirectUri 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange authorization code');
      }

      const data: TokenResponse = await response.json();
      this.setTokens(data.access_token, data.expires_in, data.id_token);
      
      // Get user info from userinfo endpoint (properly encoded UTF-8)
      await this.fetchUserInfo();
      
      // Also decode ID token to get roles from custom claims and merge
      if (data.id_token && this.user) {
        const idTokenData = this.decodeIdToken(data.id_token);
        if (idTokenData) {
          // Merge ID token claims (roles) with userinfo data (properly encoded name/email)
          this.user = { ...this.user, ...idTokenData };
          this.saveToStorage();
        }
      }
      return true;
    } catch (error) {
      console.error('Auth0 callback error:', error);
      return false;
    }
  }

  /**
   * Set tokens and expiration
   */
  private setTokens(accessToken: string, expiresIn: number, idToken?: string): void {
    this.accessToken = accessToken;
    this.idToken = idToken || null;
    this.expiresAt = Date.now() + expiresIn * 1000;
    this.saveToStorage();
  }

  /**
   * Decode ID token JWT to extract user claims
   * This contains custom claims like roles that aren't in userinfo endpoint
   */
  private decodeIdToken(idToken: string): Auth0User | null {
    try {
      // JWT has 3 parts: header.payload.signature
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        console.error('Invalid JWT format');
        return null;
      }

      // Decode the payload (second part)
      const payload = parts[1];
      // Replace URL-safe base64 chars
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      
      // Decode base64 to UTF-8 using TextDecoder (handles international characters)
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decodedPayload = new TextDecoder('utf-8').decode(bytes);
      
      const user = JSON.parse(decodedPayload);
      
      console.log('Decoded ID token user data:', user);
      return user;
    } catch (error) {
      console.error('Failed to decode ID token:', error);
      return null;
    }
  }

  /**
   * Fetch user info from Auth0 userinfo endpoint
   * Includes custom roles claim (https://yourapp.com/roles or similar)
   */
  async fetchUserInfo(): Promise<Auth0User | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await fetch(`https://${auth0Config.domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      this.user = await response.json();
      this.saveToStorage();
      return this.user;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      return null;
    }
  }

  /**
   * Extract user role from Auth0 custom claims
   * Looks for common role claim names used in Auth0
   */
  getUserRole(): string | null {
    if (!this.user) {
      return null;
    }

    // Check for common Auth0 role claim names
    const roleClaimNames = [
      'https://edumanage.com/roles',
      'https://edumanage.com/role',
      'roles',
      'role',
      'app_role'
    ];
    console.log('Checking for user roles in claims:', this.user);
    for (const claimName of roleClaimNames) {
      if (this.user[claimName]) {
        const role = this.user[claimName];
        // If it's an array, return the first element
        console.log(`Found role claim "${claimName}":`, role);
        return Array.isArray(role) ? role[0] : role;
      }
    }

    console.warn('No role found in user claims. Available claims:', Object.keys(this.user));
    return null;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    if (this.isExpired()) {
      this.clearTokens();
      return null;
    }
    return this.accessToken;
  }

  /**
   * Get current user info
   */
  getUser(): Auth0User | null {
    return this.user;
  }

  /**
   * Check if token is expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return true;
    }
    return Date.now() > this.expiresAt;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && !this.isExpired();
  }

  /**
   * Logout and clear tokens
   */
  logout(): void {
    this.clearTokens();
    // Redirect to Auth0 logout
    window.location.href = this.getLogoutUrl();
  }

  /**
   * Clear all tokens and user data
   */
  private clearTokens(): void {
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = null;
    this.user = null;
    this.clearStorage();
  }

  /**
   * Load tokens from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('auth0_session');
      if (stored) {
        const data = JSON.parse(stored);
        this.accessToken = data.accessToken || null;
        this.idToken = data.idToken || null;
        this.expiresAt = data.expiresAt || null;
        this.user = data.user || null;
      }
    } catch (error) {
      console.error('Failed to load auth session from storage:', error);
    }
  }

  /**
   * Save tokens to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(
        'auth0_session',
        JSON.stringify({
          accessToken: this.accessToken,
          idToken: this.idToken,
          expiresAt: this.expiresAt,
          user: this.user
        })
      );
    } catch (error) {
      console.error('Failed to save auth session to storage:', error);
    }
  }

  /**
   * Clear tokens from localStorage
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem('auth0_session');
    } catch (error) {
      console.error('Failed to clear auth session from storage:', error);
    }
  }
}

export const auth0Service = new Auth0Service();
