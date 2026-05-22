<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePageTitle } from '../composables/usePageTitle'
import { useRoute, useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import * as invitationsApi from '../services/invitationsApi'
import type { InvitationOut } from '../types'
import AuthLayout from '../components/layout/AuthLayout.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseSpinner from '../components/BaseSpinner.vue'
import BaseAvatar from '../components/BaseAvatar.vue'
import { useToast } from '../composables/useToast'

usePageTitle('Join')

const route = useRoute()
const router = useRouter()
const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0()
const toast = useToast()

const code = route.params.code as string
const invitation = ref<InvitationOut | null>(null)
const fetchError = ref(false)
const accepting = ref(false)

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const form = ref({
  email: '',
  firstName: '',
  lastName: '',
  gender: '',
})

onMounted(async () => {
  try {
    invitation.value = await invitationsApi.getInvitation(code)
  } catch {
    fetchError.value = true
  }

  while (isLoading.value) await new Promise((r) => setTimeout(r, 50))

  if (isAuthenticated.value) {
    form.value.email = user.value?.email ?? ''
    const pendingCode = sessionStorage.getItem('pendingJoinCode')
    if (pendingCode) sessionStorage.removeItem('pendingJoinCode')
  }
})

function signIn() {
  sessionStorage.setItem('pendingJoinCode', code)
  loginWithRedirect({ appState: { returnTo: `/join/${code}` } })
}

function signUp() {
  sessionStorage.setItem('pendingJoinCode', code)
  loginWithRedirect({
    authorizationParams: { screen_hint: 'signup' },
    appState: { returnTo: `/join/${code}` },
  })
}

async function accept() {
  if (!form.value.firstName || !form.value.lastName || !form.value.email || !form.value.gender) {
    toast.error('Please fill in all fields.')
    return
  }
  accepting.value = true
  try {
    await invitationsApi.acceptInvitation(code, {
      invitationCode: code,
      imageUrl: user.value?.picture ?? null,
      email: form.value.email || null,
      firstName: form.value.firstName || null,
      lastName: form.value.lastName || null,
      gender: form.value.gender || null,
    })
    toast.success('Welcome! Invitation accepted.')
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
    <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 w-full max-w-sm">
      <!-- Error -->
      <template v-if="fetchError">
        <p class="text-text-primary dark:text-white font-semibold mb-2">Invalid invitation</p>
        <p class="text-sm text-text-secondary mb-4">This invite link may be expired or invalid.</p>
        <RouterLink to="/login" class="text-primary text-sm font-medium">Go to login →</RouterLink>
      </template>

      <!-- Loading invitation -->
      <template v-else-if="!invitation">
        <BaseSpinner size="md" class="mx-auto" />
      </template>

      <template v-else>
        <!-- Trainer info -->
        <div class="flex flex-col items-center text-center mb-6">
          <BaseAvatar :src="invitation.imageUrl" :name="invitation.name ?? 'Trainer'" size="lg" class="mb-3" />
          <p class="text-lg font-semibold text-text-primary dark:text-white">{{ invitation.name }}</p>
          <p class="text-sm text-text-secondary mt-1">has invited you to join their training platform</p>
        </div>

        <!-- Not authenticated -->
        <template v-if="!isAuthenticated">
          <BaseButton variant="primary" :full-width="true" class="mb-3" @click="signUp">
            Create Account & Join
          </BaseButton>
          <p class="text-xs text-text-secondary text-center">
            Already have an account?
            <button class="text-primary font-medium" @click="signIn">Sign in</button>
          </p>
        </template>

        <!-- Authenticated: profile form -->
        <template v-else>
          <form class="flex flex-col gap-4" @submit.prevent="accept">
            <BaseInput v-model="form.firstName" label="First name" placeholder="Jane" />
            <BaseInput v-model="form.lastName" label="Last name" placeholder="Doe" />
            <BaseInput v-model="form.email" label="Email" type="email" placeholder="jane@example.com" />

            <!-- Gender -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-text-primary dark:text-white">Gender</label>
              <div class="flex gap-2">
                <button
                  v-for="g in GENDERS"
                  :key="g.value"
                  type="button"
                  :class="['flex-1 py-2 rounded-xl border text-sm font-medium transition-colors', form.gender === g.value ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-white/10 text-text-secondary dark:text-white/60 hover:border-primary/50']"
                  @click="form.gender = g.value">
                  {{ g.label }}
                </button>
              </div>
            </div>

            <BaseButton variant="primary" :full-width="true" :loading="accepting" type="submit" class="mt-2">
              Accept & Join
            </BaseButton>
          </form>
        </template>
      </template>
    </div>
  </AuthLayout>
</template>
