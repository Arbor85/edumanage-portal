import { ref, computed } from 'vue'

const LS = {
  ACCESS_TOKEN: 'arbor_ropg_access_token',
  ID_TOKEN: 'arbor_ropg_id_token',
  REFRESH_TOKEN: 'arbor_ropg_refresh_token',
  EXPIRES_AT: 'arbor_ropg_expires_at',
  USER: 'arbor_ropg_user',
} as const

interface RopgUser {
  sub: string
  email: string
  name?: string
  picture?: string
  nickname?: string
}

function decodeJwt(token: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return {}
  }
}

function readUser(): RopgUser | null {
  try {
    const raw = localStorage.getItem(LS.USER)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function isExpired(): boolean {
  const at = localStorage.getItem(LS.EXPIRES_AT)
  return !at || Date.now() > Number(at)
}

function clearStorage(): void {
  Object.values(LS).forEach((k) => localStorage.removeItem(k))
}

// ── Singleton reactive state ──────────────────────────────────
const _authenticated = ref(!isExpired() && !!localStorage.getItem(LS.ACCESS_TOKEN))
const _user = ref<RopgUser | null>(_authenticated.value ? readUser() : null)
const _loading = ref(false)
const _error = ref<string | null>(null)

// ── Token refresh ─────────────────────────────────────────────
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(LS.REFRESH_TOKEN)
  if (!refreshToken) return null

  try {
    const res = await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
        refresh_token: refreshToken,
      }),
    })

    if (!res.ok) {
      clearStorage()
      _authenticated.value = false
      _user.value = null
      return null
    }

    const data = await res.json()
    localStorage.setItem(LS.ACCESS_TOKEN, data.access_token)
    localStorage.setItem(LS.EXPIRES_AT, String(Date.now() + data.expires_in * 1000))
    if (data.refresh_token) localStorage.setItem(LS.REFRESH_TOKEN, data.refresh_token)
    return data.access_token as string
  } catch {
    return null
  }
}

// ── Public functions (safe to call outside setup) ─────────────

export async function passwordLogin(email: string, password: string): Promise<void> {
  _loading.value = true
  _error.value = null

  try {
    const body: Record<string, string> = {
      grant_type: 'password',
      username: email,
      password,
      client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
      scope: 'openid profile email offline_access',
    }
    if (import.meta.env.VITE_AUTH0_AUDIENCE) {
      body.audience = import.meta.env.VITE_AUTH0_AUDIENCE
    }

    const res = await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error_description ?? data.error ?? 'Sign in failed. Check your credentials.')
    }

    localStorage.setItem(LS.ACCESS_TOKEN, data.access_token)
    localStorage.setItem(LS.EXPIRES_AT, String(Date.now() + data.expires_in * 1000))
    if (data.id_token) localStorage.setItem(LS.ID_TOKEN, data.id_token)
    if (data.refresh_token) localStorage.setItem(LS.REFRESH_TOKEN, data.refresh_token)

    const payload = data.id_token ? decodeJwt(data.id_token) : {}
    const user: RopgUser = {
      sub: payload.sub as string,
      email: payload.email as string ?? email,
      name: payload.name as string | undefined,
      picture: payload.picture as string | undefined,
      nickname: payload.nickname as string | undefined,
    }
    localStorage.setItem(LS.USER, JSON.stringify(user))
    _user.value = user
    _authenticated.value = true
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign in failed.'
    _error.value = message
    throw new Error(message)
  } finally {
    _loading.value = false
  }
}

export function passwordLogout(): void {
  clearStorage()
  _authenticated.value = false
  _user.value = null
  _error.value = null
}

export async function getPasswordAuthToken(): Promise<string> {
  if (!_authenticated.value) throw new Error('Not authenticated via password')

  const expiresAt = localStorage.getItem(LS.EXPIRES_AT)
  const nearExpiry = !expiresAt || Date.now() > Number(expiresAt) - 60_000

  if (nearExpiry) {
    const refreshed = await refreshAccessToken()
    if (!refreshed) throw new Error('Session expired. Please sign in again.')
    return refreshed
  }

  const token = localStorage.getItem(LS.ACCESS_TOKEN)
  if (!token) throw new Error('No access token found.')
  return token
}

export async function passwordSignup(email: string, username: string, password: string): Promise<void> {
  _loading.value = true
  _error.value = null

  try {
    const res = await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/dbconnections/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
        email,
        password,
        username,
        connection: 'Username-Password-Authentication',
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      const msg = data.description ?? data.code ?? 'Sign up failed.'
      throw new Error(msg === 'user_exists' ? 'An account with this email already exists.' : msg)
    }

    // Auto-login after successful signup
    await passwordLogin(email, password)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign up failed.'
    _error.value = message
    throw new Error(message)
  } finally {
    _loading.value = false
  }
}

// ── Composable ────────────────────────────────────────────────
export function usePasswordAuth() {
  return {
    isAuthenticated: computed(() => _authenticated.value),
    user: computed(() => _user.value),
    isLoading: computed(() => _loading.value),
    error: computed(() => _error.value),
    login: passwordLogin,
    signup: passwordSignup,
    logout: passwordLogout,
    getAccessToken: getPasswordAuthToken,
  }
}
