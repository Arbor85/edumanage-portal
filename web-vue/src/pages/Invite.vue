<template>
  <div class="w-full max-w-3xl">
    <h1 class="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Accept Invitation</h1>

    <div
      v-if="isLoading"
      class="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
    >
      Loading invitation...
    </div>

    <div
      v-else-if="errorMessage"
      class="rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
    >
      {{ errorMessage }}
    </div>

    <div v-else-if="invitation" class="space-y-4">
      <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 class="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Your Profile</h2>
        <div class="flex items-center gap-3">
          <img
            :src="user?.picture || fallbackUserAvatar"
            :alt="user?.name || 'Current user avatar'"
            class="h-12 w-12 rounded-full border border-slate-200 object-cover dark:border-slate-600"
          />
          <div>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ user?.name || user?.nickname || 'User' }}</p>
            <p class="text-sm text-slate-600 dark:text-slate-300">{{ user?.email || 'No email available' }}</p>
          </div>
        </div>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 class="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Invitation Details</h2>
        <div class="flex items-center gap-3">
          <img
            :src="invitation.imageUrl || fallbackInvitationAvatar"
            :alt="invitation.name || 'Invitation avatar'"
            class="h-12 w-12 rounded-full border border-slate-200 object-cover dark:border-slate-600"
          />
          <div>
            <p class="text-sm text-slate-600 dark:text-slate-300">Invited by</p>
            <p class="font-medium text-slate-900 dark:text-slate-100">{{ invitation.name || 'Unknown user' }}</p>
          </div>
        </div>
      </section>

      <div class="flex justify-end">
        <button
          type="button"
          @click="acceptInvite"
          :disabled="isAccepting"
          class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
        >
          {{ isAccepting ? 'Accepting...' : 'Accept Invitation' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useClientsApi } from '../services/clientsApi'
import type { InvitationDetails } from '../services/clientsApi'
import { usePageTitle } from '../composables/usePageTitle'

usePageTitle('Accept Invitation')

const route = useRoute()
const router = useRouter()
const { user } = useAuth0()
const clientsApi = useClientsApi()

const invitation = ref<InvitationDetails | null>(null)
const isLoading = ref(true)
const isAccepting = ref(false)
const errorMessage = ref('')

const invitationCode = computed(() => String(route.params.invitationCode || ''))

const fallbackUserAvatar = computed(() => {
  const displayName = user.value?.name || user.value?.nickname || 'User'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=E2E8F0&color=0F172A`
})

const fallbackInvitationAvatar = computed(() => {
  const displayName = invitation.value?.name || 'Inviter'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=CBD5E1&color=0F172A`
})

const loadInvitation = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    invitation.value = await clientsApi.getInvitationByCode(invitationCode.value)
  } catch {
    errorMessage.value = 'Failed to load invitation details.'
    invitation.value = null
  } finally {
    isLoading.value = false
  }
}

const acceptInvite = async () => {
  if (!invitation.value) {
    return
  }

  isAccepting.value = true
  errorMessage.value = ''

  try {
    await clientsApi.acceptInvitation(invitationCode.value, {
      invitationCode: invitationCode.value,
      imageUrl: user.value?.picture || fallbackUserAvatar.value,
    })
    await router.replace('/')
  } catch {
    errorMessage.value = 'Failed to accept invitation.'
  } finally {
    isAccepting.value = false
  }
}

onMounted(() => {
  loadInvitation()
})
</script>
