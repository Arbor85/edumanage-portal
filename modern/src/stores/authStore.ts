import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { getProfile } from '../services/userProfileService'
import { usePasswordAuth, passwordLogout, getPasswordAuthToken } from '../composables/usePasswordAuth'
import type { UserProfile } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const {
    user: auth0User,
    isAuthenticated: auth0IsAuthenticated,
    isLoading: auth0IsLoading,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0()

  const ropg = usePasswordAuth()

  const isLoading = computed(() => auth0IsLoading.value)
  const isAuthenticated = computed(() => auth0IsAuthenticated.value || ropg.isAuthenticated.value)
  const user = computed(() => auth0User.value ?? ropg.user.value ?? null)

  const permissions = ref<string[]>([])
  const userProfile = ref<UserProfile | null>(null)
  const appReady = ref(false)

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  async function getAccessToken(): Promise<string> {
    if (auth0IsAuthenticated.value) return getAccessTokenSilently()
    return getPasswordAuthToken()
  }

  async function loadPermissions() {
    try {
      const token = await getAccessToken()
      const payload = JSON.parse(atob(token.split('.')[1]))
      permissions.value = payload.permissions ?? []
    } catch {
      permissions.value = []
    }
  }

  watch(
    [isAuthenticated, isLoading],
    async ([authenticated, loading]) => {
      if (loading) return
      if (authenticated) {
        if (!userProfile.value) userProfile.value = await getProfile()
        await loadPermissions()
      }
      appReady.value = true
    },
    { immediate: true }
  )

  async function bootstrap() {
    // hook for future setup
  }

  function logout() {
    userProfile.value = null
    permissions.value = []
    if (auth0IsAuthenticated.value) {
      auth0Logout({ logoutParams: { returnTo: window.location.origin + '/login' } })
    } else {
      passwordLogout()
      window.location.href = '/login'
    }
  }

  return { user, isLoading, isAuthenticated, permissions, hasPermission, userProfile, appReady, bootstrap, logout, getAccessToken }
})
