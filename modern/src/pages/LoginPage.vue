<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import AuthLayout from '../components/layout/AuthLayout.vue'
import BaseButton from '../components/BaseButton.vue'

const { loginWithRedirect } = useAuth0()
</script>

<template>
  <AuthLayout>
    <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
      <div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">E</div>
      <h1 class="text-2xl font-bold text-text-primary dark:text-white mb-1">EduManage</h1>
      <p class="text-sm text-text-secondary mb-8">Your personal training management platform</p>
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
