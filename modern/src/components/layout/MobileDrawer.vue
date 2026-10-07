<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useNavDrawer } from '../../composables/useNavDrawer'
import {
  Home, TrendingUp, Compass, User,
  Users, ClipboardList, Calendar, BookOpen, Package, LogOut,
  Building2, LayoutDashboard, CalendarDays, KeyRound, List, Dumbbell, FileText, X,
} from '@lucide/vue'
import DarkModeToggle from '../DarkModeToggle.vue'
import AppLogo from '../AppLogo.vue'
import type { Component } from 'vue'

const route = useRoute()
const authStore = useAuthStore()
const { open, close } = useNavDrawer()

watch(() => route.path, close)

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(to + '/')
}

const clientItems: { to: string; icon: Component; label: string }[] = [
  { to: '/',            icon: Home,          label: 'Today' },
  { to: '/routines',    icon: List,          label: 'Routines' },
  { to: '/plans',       icon: ClipboardList, label: 'Plans' },
  { to: '/gym-profile', icon: Dumbbell,      label: 'Gym Profile' },
  { to: '/progress',    icon: TrendingUp,    label: 'Progress' },
  { to: '/explore',     icon: Compass,       label: 'Explore' },
  { to: '/profile',     icon: User,          label: 'Profile' },
]

const allCoachItems: { to: string; icon: Component; label: string; permission: string }[] = [
  { to: '/coach/clients',        icon: Users,         label: 'Clients',        permission: 'manage:clients' },
  { to: '/coach/plans',          icon: ClipboardList, label: 'Plans',          permission: 'manage:clients' },
  { to: '/coach/meetings',       icon: Calendar,      label: 'Meetings',       permission: 'manage:clients' },
  { to: '/coach/courses',        icon: BookOpen,      label: 'Courses',        permission: 'manage:clients' },
  { to: '/coach/equipment',      icon: Package,       label: 'Equipment',      permission: 'manage:equipment' },
  { to: '/coach/form-templates', icon: FileText,      label: 'Form Templates', permission: 'manage:forms' },
  { to: '/my-schedule',          icon: CalendarDays,  label: 'My Schedule',    permission: 'view:schedule' },
  { to: '/coach/mcp-keys',       icon: KeyRound,      label: 'MCP Keys',       permission: 'manage:clients' },
]

const allOrganizerItems: { to: string; icon: Component; label: string; permission: string }[] = [
  { to: '/organizer',                icon: LayoutDashboard, label: 'Dashboard', permission: 'manage:organization' },
  { to: '/organizer/trainers',       icon: Users,           label: 'Trainers',  permission: 'manage:organization' },
  { to: '/organizer/buildings',      icon: Building2,       label: 'Buildings', permission: 'manage:buildings' },
  { to: '/organizer/schedule-plans', icon: CalendarDays,    label: 'Schedules', permission: 'manage:schedule-plans' },
]

const coachItems = computed(() => allCoachItems.filter(i => authStore.hasPermission(i.permission)))
const organizerItems = computed(() => allOrganizerItems.filter(i => authStore.hasPermission(i.permission)))
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="open"
        class="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        @click="close"
      />
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <aside
        v-if="open"
        class="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-surface-card flex flex-col px-4 py-6 border-r border-gray-200 dark:border-white/5 overflow-y-auto"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div class="px-2">
            <AppLogo />
          </div>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Close menu"
            @click="close"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Client nav -->
        <nav class="flex flex-col gap-1">
          <RouterLink
            v-for="item in clientItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-colors"
            :class="isActive(item.to)
              ? 'text-primary bg-primary/10 dark:bg-primary/20'
              : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <!-- Coach section -->
        <div v-if="coachItems.length > 0" class="mt-4">
          <div class="border-t border-gray-200 dark:border-white/10 pt-4">
            <p class="px-3 mb-2 text-[10px] font-bold tracking-[0.12em] uppercase text-text-muted/80">Coach</p>
            <nav class="flex flex-col gap-1">
              <RouterLink
                v-for="item in coachItems"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-colors"
                :class="isActive(item.to)
                  ? 'text-primary bg-primary/10 dark:bg-primary/20'
                  : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'"
              >
                <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span>{{ item.label }}</span>
              </RouterLink>
            </nav>
          </div>
        </div>

        <!-- Organizer section -->
        <div v-if="organizerItems.length > 0" class="mt-4">
          <div class="border-t border-gray-200 dark:border-white/10 pt-4">
            <p class="px-3 mb-2 text-[10px] font-bold tracking-[0.12em] uppercase text-text-muted/80">Organizer</p>
            <nav class="flex flex-col gap-1">
              <RouterLink
                v-for="item in organizerItems"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-colors"
                :class="isActive(item.to)
                  ? 'text-primary bg-primary/10 dark:bg-primary/20'
                  : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'"
              >
                <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span>{{ item.label }}</span>
              </RouterLink>
            </nav>
          </div>
        </div>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Bottom: theme + logout -->
        <div class="border-t border-gray-200 dark:border-white/10 pt-4 flex flex-col gap-1 mt-4">
          <div class="flex items-center gap-3 px-3 py-2 min-h-[44px]">
            <DarkModeToggle />
            <span class="text-sm font-medium text-gray-500 dark:text-white/60">Theme</span>
          </div>
          <button
            class="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors w-full text-left"
            @click="authStore.logout()"
          >
            <LogOut class="w-5 h-5 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 260ms cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
