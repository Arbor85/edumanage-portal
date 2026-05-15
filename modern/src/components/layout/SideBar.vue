<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useWorkoutStore } from '../../stores/workoutStore'
import { useAuthStore } from '../../stores/authStore'
import {
  Home, Dumbbell, ClipboardList, Calendar, Play,
  CalendarDays, BarChart2, Users, GraduationCap, User, LogOut
} from 'lucide-vue-next'
import type { Component } from 'vue'

const route = useRoute()
const workoutStore = useWorkoutStore()
const authStore = useAuthStore()

const navItems: { to: string; icon: Component; label: string; pulse?: boolean }[] = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/exercises', icon: Dumbbell, label: 'Exercises' },
  { to: '/routines', icon: ClipboardList, label: 'Workouts' },
  { to: '/plans', icon: Calendar, label: 'Plans' },
  { to: '/workout/active', icon: Play, label: 'Active', pulse: true },
  { to: '/meetings', icon: CalendarDays, label: 'Schedule' },
  { to: '/history', icon: BarChart2, label: 'Analytics' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/courses', icon: GraduationCap, label: 'Courses' },
]
</script>

<template>
  <aside class="hidden lg:flex flex-col w-56 bg-surface-dark min-h-screen flex-shrink-0 px-4 py-6">
    <!-- Logo -->
    <div class="flex items-center gap-2 px-2 mb-8">
      <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">E</div>
      <span class="text-lg font-bold text-white">EduManage</span>
    </div>

    <!-- Nav items -->
    <nav class="flex-1 flex flex-col gap-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-colors"
        :class="route.path === item.to || route.path.startsWith(item.to + '/')
          ? 'bg-primary/20 text-primary'
          : 'text-white/70 hover:text-white hover:bg-white/10'"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span>{{ item.label }}</span>
        <span
          v-if="item.pulse && workoutStore.activeWorkout"
          class="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse"
        />
      </RouterLink>
    </nav>

    <!-- Bottom: profile + logout -->
    <div class="border-t border-white/10 pt-4 flex flex-col gap-1">
      <RouterLink
        to="/profile"
        class="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        <User class="w-5 h-5 flex-shrink-0" />
        <span class="truncate">{{ authStore.user?.name ?? 'Profile' }}</span>
      </RouterLink>
      <button
        class="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors w-full text-left focus-visible:ring-2 focus-visible:ring-primary"
        @click="authStore.logout()"
      >
        <LogOut class="w-5 h-5 flex-shrink-0" />
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>
