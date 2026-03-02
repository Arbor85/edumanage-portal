<template>
  <button
    v-if="isAuthenticated"
    @click="handleLogout"
    class="inline-flex items-center rounded-md border border-red-300 bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-60 dark:border-red-400 dark:bg-red-600 dark:hover:bg-red-500"
    :disabled="isLoading"
  >
    {{ isLoading ? 'Loading...' : 'Log Out' }}
  </button>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'

const { logout, isLoading, isAuthenticated } = useAuth0()

const handleLogout = () => {
  logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  })
}
</script>