<template>
  <button 
    @click="handleLogin" 
    class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 dark:border-emerald-400 dark:bg-emerald-600 dark:hover:bg-emerald-500"
    :disabled="isLoading"
  >
    {{ isLoading ? 'Loading...' : 'Log In' }}
  </button>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'

const { loginWithRedirect, isLoading } = useAuth0()

const handleLogin = () => {
  loginWithRedirect({
    authorizationParams: {
      scope: 'openid profile email',
    },
  })
}
</script>