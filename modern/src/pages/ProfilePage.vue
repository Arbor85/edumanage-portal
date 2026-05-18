<script setup lang="ts">
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('Profile')
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseAvatar from '../components/BaseAvatar.vue'
import BaseButton from '../components/BaseButton.vue'

const authStore = useAuthStore()
const router = useRouter()

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <AppLayout>
    <PageHeader title="Profile" subtitle="Your account information." />

    <div class="max-w-md flex flex-col gap-6">
      <div class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-6 flex flex-col items-center gap-3">
        <BaseAvatar :src="authStore.user?.picture" :name="authStore.user?.name ?? ''" size="lg" />
        <p class="text-xl font-bold text-text-primary dark:text-white">{{ authStore.user?.name ?? '—' }}</p>
        <p class="text-sm text-text-secondary">{{ authStore.user?.email ?? '—' }}</p>
      </div>

      <div class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/5">
        <div class="p-4 flex items-center gap-3">
          <span class="text-text-secondary text-sm w-28">Name</span>
          <span class="text-text-primary dark:text-white text-sm">{{ authStore.user?.name ?? '—' }}</span>
        </div>
        <div class="p-4 flex items-center gap-3">
          <span class="text-text-secondary text-sm w-28">Email</span>
          <span class="text-text-primary dark:text-white text-sm">{{ authStore.user?.email ?? '—' }}</span>
        </div>
        <div class="p-4 flex items-center gap-3">
          <span class="text-text-secondary text-sm w-28">Nickname</span>
          <span class="text-text-primary dark:text-white text-sm">{{ authStore.user?.nickname ?? '—' }}</span>
        </div>
      </div>

      <BaseButton variant="danger" @click="logout">Log Out</BaseButton>
    </div>
  </AppLayout>
</template>
