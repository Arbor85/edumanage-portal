<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import * as invitationsApi from '../services/invitationsApi'
import type { InvitationOut } from '../types'
import AuthLayout from '../components/layout/AuthLayout.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseSpinner from '../components/BaseSpinner.vue'
import BaseAvatar from '../components/BaseAvatar.vue'
import { useToast } from '../composables/useToast'

const route = useRoute()
const router = useRouter()
const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0()
const toast = useToast()

const code = route.params.code as string
const invitation = ref<InvitationOut | null>(null)
const fetchError = ref(false)
const accepting = ref(false)

onMounted(async () => {
  try {
    invitation.value = await invitationsApi.getInvitation(code)
  } catch {
    fetchError.value = true
  }

  // Wait for auth0
  while (isLoading.value) await new Promise((r) => setTimeout(r, 50))

  if (isAuthenticated.value) {
    const pendingCode = sessionStorage.getItem('pendingInviteCode')
    if (pendingCode) {
      sessionStorage.removeItem('pendingInviteCode')
      await accept()
    }
  }
})

async function signUp() {
  sessionStorage.setItem('pendingInviteCode', code)
  await loginWithRedirect({
    authorizationParams: { screen_hint: 'signup' },
    appState: { returnTo: `/invite/${code}` },
  })
}

async function accept() {
  accepting.value = true
  try {
    await invitationsApi.acceptInvitation(code, {
      invitationCode: code,
      imageUrl: user.value?.picture ?? null,
    })
    toast.success('Invitation accepted! Welcome.')
    router.push('/dashboard')
  } catch {
    toast.error('Failed to accept invitation.')
  } finally {
    accepting.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
      <template v-if="fetchError">
        <p class="text-text-primary dark:text-white font-semibold mb-2">Invalid invitation</p>
        <p class="text-sm text-text-secondary mb-4">This invite link may be expired or invalid.</p>
        <RouterLink to="/login" class="text-primary text-sm font-medium">Go to login →</RouterLink>
      </template>

      <template v-else-if="!invitation">
        <BaseSpinner size="md" class="mx-auto" />
      </template>

      <template v-else>
        <BaseAvatar :src="invitation.imageUrl" :name="invitation.name ?? 'Trainer'" size="lg" class="mx-auto mb-4" />
        <p class="text-lg font-semibold text-text-primary dark:text-white mb-1">{{ invitation.name }}</p>
        <p class="text-sm text-text-secondary mb-6">has invited you to join their training platform</p>

        <template v-if="isAuthenticated">
          <BaseButton variant="primary" :full-width="true" :loading="accepting" @click="accept">
            Accept Invitation
          </BaseButton>
        </template>
        <template v-else>
          <BaseButton variant="primary" :full-width="true" @click="signUp">
            Create Account & Accept
          </BaseButton>
          <p class="text-xs text-text-secondary mt-3">
            Already have an account?
            <button class="text-primary font-medium" @click="loginWithRedirect({ appState: { returnTo: `/invite/${code}` } })">Sign in</button>
          </p>
        </template>
      </template>
    </div>
  </AuthLayout>
</template>
