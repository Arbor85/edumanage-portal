<script setup lang="ts">
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('Sign In')
import { useAuth0 } from '@auth0/auth0-vue'
import AuthLayout from '../components/layout/AuthLayout.vue'
import BaseButton from '../components/BaseButton.vue'
import AppLogo from '../components/AppLogo.vue'

const { loginWithRedirect } = useAuth0()
</script>

<template>
  <AuthLayout>
    <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
      <div class="flex justify-center mb-5">
        <AppLogo size="lg" />
      </div>
      <p class="text-sm text-text-secondary mb-8">Training management for coaches and clients</p>
      <div class="flex flex-col gap-3">
        <BaseButton variant="primary" :full-width="true" @click="loginWithRedirect()">
          Sign In
        </BaseButton>
        <BaseButton variant="secondary" :full-width="true" @click="loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })">
          Create Account
        </BaseButton>
      </div>
    </div>
  </AuthLayout>
</template>
