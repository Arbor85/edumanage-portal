<script setup lang="ts">
import { ref, reactive } from 'vue'
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('Profile')
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseAvatar from '../components/BaseAvatar.vue'
import BaseButton from '../components/BaseButton.vue'
import { db } from '../db/offlineDb'

const authStore = useAuthStore()
const router = useRouter()

type Tab = 'account' | 'local-data'
const activeTab = ref<Tab>('account')

async function logout() {
  await authStore.logout()
  router.push('/login')
}

const indexedDbTables = [
  { key: 'routines', label: 'Routines', description: 'Cached routine definitions' },
  { key: 'exercises', label: 'Exercises', description: 'Cached exercise definitions' },
  { key: 'plans', label: 'Plans', description: 'Cached training plans' },
  { key: 'workoutQueue', label: 'Workout Queue', description: 'Pending offline workout submissions' },
  { key: 'syncMeta', label: 'Sync Metadata', description: 'Last sync timestamps per entity' },
] as const

const localStorageKeys = [
  { key: 'activeWorkout', label: 'Active Workout', description: 'In-progress workout session state' },
  { key: 'workoutHistory', label: 'Workout History', description: 'Local workout history log' },
  { key: 'userProfile', label: 'User Profile', description: 'Cached user profile data' },
  { key: 'weightUnit', label: 'Weight Unit', description: 'Preferred unit (kg / lbs)' },
  { key: 'challengeCompleted', label: 'Daily Challenge', description: 'Daily challenge completion marker' },
] as const

type IdbKey = typeof indexedDbTables[number]['key']
type LsKey = typeof localStorageKeys[number]['key']

const clearing = reactive<Record<string, boolean>>({})
const cleared = reactive<Record<string, boolean>>({})

async function clearIdbTable(key: IdbKey) {
  clearing[key] = true
  try {
    await db[key].clear()
    cleared[key] = true
    setTimeout(() => { cleared[key] = false }, 2000)
  } finally {
    clearing[key] = false
  }
}

function clearLsKey(key: LsKey) {
  clearing[key] = true
  try {
    localStorage.removeItem(key)
    cleared[key] = true
    setTimeout(() => { cleared[key] = false }, 2000)
  } finally {
    clearing[key] = false
  }
}
</script>

<template>
  <AppLayout>
    <PageHeader title="Profile" subtitle="Your account information." />

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 border-b border-gray-100 dark:border-white/10">
      <button
        v-for="tab in ([{ id: 'account', label: 'Account' }, { id: 'local-data', label: 'Local Data' }] as const)"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="activeTab === tab.id
          ? 'border-primary text-primary'
          : 'border-transparent text-text-secondary hover:text-text-primary dark:hover:text-white'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Account Tab -->
    <div v-if="activeTab === 'account'" class="max-w-md flex flex-col gap-6">
      <div
        class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-6 flex flex-col items-center gap-3">
        <BaseAvatar :src="authStore.user?.picture" :name="authStore.user?.name ?? ''" size="lg" />
        <p class="text-xl font-bold text-text-primary dark:text-white">{{ authStore.user?.name ?? '—' }}</p>
        <p class="text-sm text-text-secondary">{{ authStore.user?.email ?? '—' }}</p>
      </div>

      <div
        class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/5">
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

      <div
        class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-4 flex flex-col gap-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Permissions</p>
        <p v-if="authStore.permissions.length === 0" class="text-xs text-text-secondary">No special permissions</p>
        <p v-for="p in authStore.permissions" :key="p" class="text-xs text-green-500 font-bold">{{ p }}</p>
      </div>

      <BaseButton variant="danger" @click="logout">Log Out</BaseButton>
    </div>

    <!-- Local Data Tab -->
    <div v-else class="max-w-xl flex flex-col gap-6">
      <!-- IndexedDB -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-3">IndexedDB (Offline Cache)</p>
        <div
          class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/5">
          <div
            v-for="table in indexedDbTables"
            :key="table.key"
            class="p-4 flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-primary dark:text-white">{{ table.label }}</p>
              <p class="text-xs text-text-secondary truncate">{{ table.description }}</p>
            </div>
            <button
              @click="clearIdbTable(table.key)"
              :disabled="clearing[table.key]"
              class="shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              :class="cleared[table.key]
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:opacity-50'"
            >
              {{ cleared[table.key] ? 'Cleared' : clearing[table.key] ? '...' : 'Clear' }}
            </button>
          </div>
        </div>
      </div>

      <!-- localStorage -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-3">localStorage</p>
        <div
          class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/5">
          <div
            v-for="entry in localStorageKeys"
            :key="entry.key"
            class="p-4 flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-primary dark:text-white">{{ entry.label }}</p>
              <p class="text-xs text-text-secondary truncate">{{ entry.description }}</p>
            </div>
            <button
              @click="clearLsKey(entry.key)"
              class="shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              :class="cleared[entry.key]
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'"
            >
              {{ cleared[entry.key] ? 'Cleared' : 'Clear' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
