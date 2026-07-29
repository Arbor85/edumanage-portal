<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useWorkoutStore } from '../../stores/workoutStore'
import { useAuthStore } from '../../stores/authStore'
import {
  Home, Dumbbell, TrendingUp, Compass, User,
  Users, ClipboardList, Calendar, BookOpen, Package, LogOut
} from 'lucide-vue-next'
import DarkModeToggle from '../DarkModeToggle.vue'
import type { Component } from 'vue'

const route = useRoute()
const workoutStore = useWorkoutStore()
const authStore = useAuthStore()

const clientItems: { to: string; icon: Component; label: string }[] = [
  { to: '/',         icon: Home,       label: 'Today' },
  { to: '/train',    icon: Dumbbell,   label: 'Train' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/explore',  icon: Compass,    label: 'Explore' },
  { to: '/profile',  icon: User,       label: 'Profile' },
]

const coachItems: { to: string; icon: Component; label: string }[] = [
  { to: '/coach/clients',   icon: Users,         label: 'Clients' },
  { to: '/coach/plans',     icon: ClipboardList, label: 'Plans' },
  { to: '/coach/meetings',  icon: Calendar,      label: 'Meetings' },
  { to: '/coach/courses',   icon: BookOpen,      label: 'Courses' },
  { to: '/coach/equipment', icon: Package,       label: 'Equipment' },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <aside class="hidden lg:flex flex-col w-56 bg-surface-card min-h-screen flex-shrink-0 px-4 py-6 border-r border-white/5">
    <!-- Logo -->
    <div class="flex items-center gap-2 px-2 mb-8">
      <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-glow">
        E
      </div>
      <span class="text-lg font-bold text-white">EduManage</span>
    </div>

    <!-- Client nav -->
    <nav class="flex-1 flex flex-col gap-1">
      <RouterLink
        v-for="item in clientItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-all"
        :class="isActive(item.to)
          ? 'bg-primary/20 text-primary shadow-glow'
          : 'text-white/60 hover:text-white hover:bg-white/8'"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span>{{ item.label }}</span>
        <span
          v-if="item.to === '/train' && workoutStore.activeWorkout"
          class="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse"
        />
      </RouterLink>
    </nav>

    <!-- Coach section (trainers only) -->
    <div v-if="authStore.isTrainer" class="mt-4">
      <div class="border-t border-white/10 pt-4">
        <p class="px-3 mb-2 text-xs font-bold tracking-widest uppercase text-text-muted">Coach</p>
        <nav class="flex flex-col gap-1">
          <RouterLink
            v-for="item in coachItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-all"
            :class="isActive(item.to)
              ? 'bg-primary/20 text-primary'
              : 'text-white/60 hover:text-white hover:bg-white/8'"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
      </div>
    </div>

    <!-- Bottom: theme + logout -->
    <div class="border-t border-white/10 pt-4 flex flex-col gap-1 mt-4">
      <div class="flex items-center gap-3 px-3 py-2 min-h-[44px]">
        <DarkModeToggle />
        <span class="text-sm font-medium text-white/60">Theme</span>
      </div>
      <button
        class="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all w-full text-left focus-visible:ring-2 focus-visible:ring-primary"
        @click="authStore.logout()"
      >
        <LogOut class="w-5 h-5 flex-shrink-0" />
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>
