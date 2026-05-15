<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useAuthStore } from '../stores/authStore'
import AuthLayout from '../components/layout/AuthLayout.vue'
import BaseSpinner from '../components/BaseSpinner.vue'

const router = useRouter()
const { isLoading, isAuthenticated } = useAuth0()
const authStore = useAuthStore()

onMounted(async () => {
  // Wait for auth0 to finish
  while (isLoading.value) await new Promise((r) => setTimeout(r, 50))
  await authStore.bootstrap()
  const redirect = new URLSearchParams(window.location.search).get('redirect') ?? '/dashboard'
  router.replace(isAuthenticated.value ? redirect : '/login')
})
</script>

<template>
  <AuthLayout>
    <div class="flex flex-col items-center gap-4">
      <BaseSpinner size="lg" />
      <p class="text-sm text-text-secondary">Signing you in…</p>
    </div>
  </AuthLayout>
</template>
