import { createAuth0Client, Auth0Client, Auth0ClientOptions } from '@auth0/auth0-spa-js';

let auth0Client: Auth0Client | null = null;

export async function initAuth0(options: Auth0ClientOptions) {
  auth0Client = await createAuth0Client(options);
  return auth0Client;
}

export function getAuth0Client(): Auth0Client {
  if (!auth0Client) {
    throw new Error('Auth0 client not initialized. Call initAuth0 first.');
  }
  return auth0Client;
}
