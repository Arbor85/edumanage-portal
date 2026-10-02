import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { getProfile } from '../services/userProfileService'
import type { UserProfile } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const { user: auth0User, isAuthenticated: auth0IsAuthenticated, isLoading: auth0IsLoading, logout: auth0Logout, getAccessTokenSilently } = useAuth0()

  const isLoading = computed(() => auth0IsLoading.value)
  const isAuthenticated = computed(() => auth0IsAuthenticated.value)
  const user = computed(() => auth0User.value ?? null)

  const permissions = ref<string[]>([])
  const userProfile = ref<UserProfile | null>(null)

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  async function loadPermissions() {
    try {
      const token = await getAccessTokenSilently()
      const payload = JSON.parse(atob(token.split('.')[1]))
      permissions.value = payload.permissions ?? []
    } catch {
      permissions.value = []
    }
  }

  watch(
    () => isAuthenticated.value && !isLoading.value,
    async (ready) => {
      if (ready) {
        if (!userProfile.value) userProfile.value = await getProfile()
        await loadPermissions()
      }
    },
    { immediate: true }
  )

  async function bootstrap() {
    // Auth0 handles token refresh internally; this is a hook for future setup
  }

  function logout() {
    userProfile.value = null
    permissions.value = []
    auth0Logout({ logoutParams: { returnTo: window.location.origin + '/login' } })
  }

  return { user, isLoading, isAuthenticated, permissions, hasPermission, userProfile, bootstrap, logout }
})
