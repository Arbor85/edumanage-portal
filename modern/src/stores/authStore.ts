import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { getProfile } from '../services/userProfileService'
import type { UserProfile } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const { user: auth0User, isAuthenticated: auth0IsAuthenticated, isLoading: auth0IsLoading, logout: auth0Logout } = useAuth0()

  const isLoading = computed(() => auth0IsLoading.value)
  const isAuthenticated = computed(() => auth0IsAuthenticated.value)
  const user = computed(() => auth0User.value ?? null)

  // Auth0 custom Action must add https://edumanage.app/roles claim to the token
  const isTrainer = computed(() => {
    const roles: string[] = user.value?.['https://edumanage.app/roles'] ?? []
    return roles.includes('gym-trainer')
  })

  const isOrganizer = computed(() => {
    const roles: string[] = user.value?.['https://edumanage.app/roles'] ?? []
    return roles.includes('gym-organizer')
  })

  const userProfile = ref<UserProfile | null>(null)
  const onboardingComplete = computed(() => userProfile.value?.onboardingComplete ?? false)

  // Fetch profile once Auth0 finishes loading and user is authenticated
  watch(
    () => isAuthenticated.value && !isLoading.value,
    async (ready) => {
      if (ready && !userProfile.value) {
        userProfile.value = await getProfile()
      }
    },
    { immediate: true }
  )

  function setProfile(profile: UserProfile) {
    userProfile.value = profile
  }

  async function bootstrap() {
    // Auth0 handles token refresh internally; this is a hook for future setup
  }

  function logout() {
    userProfile.value = null
    auth0Logout({ logoutParams: { returnTo: window.location.origin + '/login' } })
  }

  return { user, isLoading, isAuthenticated, isTrainer, isOrganizer, userProfile, onboardingComplete, setProfile, bootstrap, logout }
})
