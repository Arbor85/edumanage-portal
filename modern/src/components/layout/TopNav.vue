<script setup lang="ts">
import { useRoute } from 'vue-router'
import DarkModeToggle from '../DarkModeToggle.vue'
import BaseAvatar from '../BaseAvatar.vue'
import { useAuthStore } from '../../stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/exercises': 'Exercise Library',
  '/routines': 'Workouts',
  '/plans': 'Training Plans',
  '/workout/active': 'Active Workout',
  '/history': 'History',
  '/clients': 'Clients',
  '/meetings': 'Schedule',
  '/courses': 'Courses',
  '/profile': 'Profile',
}

const pageTitle = () => titles[route.path] ?? 'EduManage'
</script>

<template>
  <header class="h-16 flex items-center px-4 sm:px-6 bg-surface dark:bg-surface-dark border-b border-gray-100 dark:border-white/10 flex-shrink-0">
    <h1 class="text-xl font-bold text-text-primary dark:text-white flex-1">{{ pageTitle() }}</h1>
    <div class="flex items-center gap-2">
      <DarkModeToggle />
      <RouterLink to="/profile" class="w-10 h-10 flex items-center justify-center rounded-xl focus-visible:ring-2 focus-visible:ring-primary">
        <BaseAvatar
          :src="authStore.user?.picture ?? null"
          :name="authStore.user?.name ?? 'User'"
          size="sm"
        />
      </RouterLink>
    </div>
  </header>
</template>
