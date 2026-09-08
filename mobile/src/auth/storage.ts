import * as SecureStore from 'expo-secure-store';

import type { AuthSession } from './types';

const SESSION_STORAGE_KEY = 'edumanage.auth.session';

export async function loadStoredSession(): Promise<AuthSession | null> {
  const rawSession = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  return JSON.parse(rawSession) as AuthSession;
}

export async function saveStoredSession(session: AuthSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function clearStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
}
