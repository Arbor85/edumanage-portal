import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

export const useAuthStore = defineStore('auth', () => {
  const { user: auth0User, isAuthenticated: auth0IsAuthenticated, isLoading: auth0IsLoading, logout: auth0Logout } = useAuth0()

  const isLoading = computed(() => auth0IsLoading.value)
  const isAuthenticated = computed(() => auth0IsAuthenticated.value)
  const user = computed(() => auth0User.value ?? null)

  // Auth0 custom Action must add https://edumanage.app/roles claim to the token
  const isTrainer = computed(() => {
    const roles: string[] = user.value?.['https://edumanage.app/roles'] ?? []
    return roles.includes('trainer')
  })

  async function bootstrap() {
    // Auth0 handles token refresh internally; this is a hook for future setup
  }

  function logout() {
    auth0Logout({ logoutParams: { returnTo: window.location.origin + '/login' } })
  }

  return { user, isLoading, isAuthenticated, isTrainer, bootstrap, logout }
})
