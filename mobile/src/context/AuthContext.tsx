import React, { createContext, useContext, useEffect, useState } from 'react'
import Auth0, { useAuth0 } from 'react-native-auth0'
import { setAuthToken } from '../api/apiClient'

const AUTH0_DOMAIN = 'your-auth0-domain.auth0.com'
const AUTH0_CLIENT_ID = 'your-auth0-client-id'
const ROLES_CLAIM = 'https://edumanage.app/roles'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  isTrainer: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  isTrainer: false,
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Auth0 domain={AUTH0_DOMAIN} clientId={AUTH0_CLIENT_ID}>
      <AuthInner>{children}</AuthInner>
    </Auth0>
  )
}

function AuthInner({ children }: { children: React.ReactNode }) {
  const { authorize, clearSession, getCredentials, user, isLoading } = useAuth0()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isTrainer, setIsTrainer] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (user) {
      setIsAuthenticated(true)
      const roles: string[] = ((user as Record<string, unknown>)[ROLES_CLAIM] as string[]) ?? []
      setIsTrainer(roles.includes('gym-trainer'))
      getCredentials().then(creds => {
        if (creds?.accessToken) setAuthToken(creds.accessToken)
      }).catch(() => {})
    } else {
      setIsAuthenticated(false)
      setAuthToken(null)
    }
  }, [user, isLoading])

  const login = async () => {
    await authorize({ scope: 'openid profile email', audience: undefined })
  }

  const logout = async () => {
    await clearSession()
    setAuthToken(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, isTrainer, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAppAuth() {
  return useContext(AuthContext)
}
