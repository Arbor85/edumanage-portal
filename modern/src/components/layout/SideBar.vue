<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkoutStore } from '../../stores/workoutStore'
import { useAuthStore } from '../../stores/authStore'
import {
  Home, Dumbbell, TrendingUp, Compass, User,
  Users, ClipboardList, Calendar, BookOpen, Package, LogOut,
  Building2, LayoutDashboard, CalendarDays,
} from 'lucide-vue-next'
import DarkModeToggle from '../DarkModeToggle.vue'
import type { Component } from 'vue'

const route = useRoute()
const workoutStore = useWorkoutStore()
const authStore = useAuthStore()

const clientItems: { to: string; icon: Component; label: string }[] = [
  { to: '/',         icon: Home,         label: 'Today' },
  { to: '/train',    icon: Dumbbell,     label: 'Train' },
  { to: '/progress', icon: TrendingUp,   label: 'Progress' },
  { to: '/explore',  icon: Compass,      label: 'Explore' },
  { to: '/profile',  icon: User,         label: 'Profile' },
]

const coachItems: { to: string; icon: Component; label: string }[] = [
  { to: '/coach/clients',   icon: Users,         label: 'Clients' },
  { to: '/coach/plans',     icon: ClipboardList, label: 'Plans' },
  { to: '/coach/meetings',  icon: Calendar,      label: 'Meetings' },
  { to: '/coach/courses',   icon: BookOpen,      label: 'Courses' },
  { to: '/coach/equipment', icon: Package,       label: 'Equipment' },
  { to: '/my-schedule',     icon: CalendarDays,  label: 'My Schedule' },
]

const organizerItems: { to: string; icon: Component; label: string }[] = [
  { to: '/organizer',                  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/organizer/trainers',         icon: Users,           label: 'Trainers' },
  { to: '/organizer/buildings',        icon: Building2,       label: 'Buildings' },
  { to: '/organizer/schedule-plans',   icon: CalendarDays,    label: 'Schedules' },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(to + '/')
}

// ── Sliding pill ──────────────────────────────────────────────────────────────

const clientNavEl = ref<HTMLElement | null>(null)
const coachNavEl  = ref<HTMLElement | null>(null)
const pillReady   = ref(false)

interface PillPos { top: number; height: number }

const clientPos = ref<PillPos | null>(null)
const coachPos  = ref<PillPos | null>(null)

function readPillPos(navEl: HTMLElement | null, items: typeof clientItems): PillPos | null {
  if (!navEl) return null
  const links = Array.from(navEl.querySelectorAll<HTMLElement>(':scope > a'))
  const idx = items.findIndex(item => isActive(item.to))
  if (idx === -1 || !links[idx]) return null
  const el = links[idx]
  if (!el.offsetHeight) return null
  return { top: el.offsetTop, height: el.offsetHeight }
}

function updatePills() {
  clientPos.value = readPillPos(clientNavEl.value, clientItems)
  coachPos.value  = readPillPos(coachNavEl.value,  coachItems)
}

// Update after every route change once DOM has settled
watch(() => route.path, () => nextTick(updatePills))

onMounted(async () => {
  await nextTick()
  updatePills()
  // Enable transition only after first placement so pill doesn't fly in on load
  await nextTick()
  pillReady.value = true
})

// ── Cursor glow ───────────────────────────────────────────────────────────────

const asideEl     = ref<HTMLElement | null>(null)
const glowY       = ref(0)
const glowVisible = ref(false)

function onMouseMove(e: MouseEvent) {
  const rect = asideEl.value?.getBoundingClientRect()
  if (!rect) return
  glowY.value = e.clientY - rect.top
}

// Active link index for coach section (needed for v-if on coach nav)
const coachActiveIdx = computed(() => coachItems.findIndex(item => isActive(item.to)))
const organizerActiveIdx = computed(() => organizerItems.findIndex(item => isActive(item.to)))
</script>

<template>
  <aside
    ref="asideEl"
    class="hidden lg:flex flex-col w-56 bg-surface-card min-h-screen flex-shrink-0 px-4 py-6 border-r border-gray-200 dark:border-white/5 relative"
    @mousemove="onMouseMove"
    @mouseenter="glowVisible = true"
    @mouseleave="glowVisible = false"
  >
    <!-- Cursor-following glow -->
    <div
      class="pointer-events-none absolute inset-0 z-0 transition-opacity duration-[400ms]"
      :style="{
        opacity: glowVisible ? 1 : 0,
        background: `radial-gradient(180px circle at 50% ${glowY}px, rgba(0,200,150,0.12) 0%, transparent 100%)`,
      }"
    />

    <!-- Logo -->
    <div class="relative z-10 flex items-center gap-2 px-2 mb-8">
      <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-glow">
        E
      </div>
      <span class="text-lg font-bold text-gray-900 dark:text-white">EduManage</span>
    </div>

    <!-- Client nav -->
    <nav ref="clientNavEl" class="relative flex-1 flex flex-col gap-1 z-10">
      <!-- Sliding active pill -->
      <div
        v-if="clientPos"
        aria-hidden="true"
        class="nav-pill absolute left-0 right-0 bg-primary/20 rounded-xl pointer-events-none z-0"
        :class="{ 'nav-pill--ready': pillReady }"
        :style="{ height: `${clientPos.height}px`, transform: `translateY(${clientPos.top}px)` }"
      />

      <RouterLink
        v-for="item in clientItems"
        :key="item.to"
        :to="item.to"
        class="relative z-10 flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-colors"
        :class="isActive(item.to)
          ? 'text-primary'
          : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span>{{ item.label }}</span>
        <span
          v-if="item.to === '/train' && workoutStore.activeWorkout"
          class="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse"
        />
      </RouterLink>
    </nav>

    <!-- Coach section -->
    <div v-if="authStore.isTrainer" class="relative z-10 mt-4">
      <div class="border-t border-gray-200 dark:border-white/10 pt-4">
        <p class="px-3 mb-2 text-xs font-bold tracking-widest uppercase text-text-muted">Coach</p>
        <nav ref="coachNavEl" class="relative flex flex-col gap-1">
          <!-- Sliding active pill -->
          <div
            v-if="coachPos && coachActiveIdx !== -1"
            aria-hidden="true"
            class="nav-pill absolute left-0 right-0 bg-primary/20 rounded-xl pointer-events-none z-0"
            :class="{ 'nav-pill--ready': pillReady }"
            :style="{ height: `${coachPos.height}px`, transform: `translateY(${coachPos.top}px)` }"
          />

          <RouterLink
            v-for="item in coachItems"
            :key="item.to"
            :to="item.to"
            class="relative z-10 flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-colors"
            :class="isActive(item.to)
              ? 'text-primary'
              : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
      </div>
    </div>

    <!-- Organizer section -->
    <div v-if="authStore.isOrganizer" class="relative z-10 mt-4">
      <div class="border-t border-gray-200 dark:border-white/10 pt-4">
        <p class="px-3 mb-2 text-xs font-bold tracking-widest uppercase text-text-muted">Organizer</p>
        <nav class="relative flex flex-col gap-1">
          <RouterLink
            v-for="item in organizerItems"
            :key="item.to"
            :to="item.to"
            class="relative z-10 flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-colors"
            :class="isActive(item.to)
              ? 'text-primary'
              : 'text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>
      </div>
    </div>

    <!-- Bottom: theme + logout -->
    <div class="relative z-10 border-t border-gray-200 dark:border-white/10 pt-4 flex flex-col gap-1 mt-4">
      <div class="flex items-center gap-3 px-3 py-2 min-h-[44px]">
        <DarkModeToggle />
        <span class="text-sm font-medium text-gray-500 dark:text-white/60">Theme</span>
      </div>
      <button
        class="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors w-full text-left focus-visible:ring-2 focus-visible:ring-primary"
        @click="authStore.logout()"
      >
        <LogOut class="w-5 h-5 flex-shrink-0" />
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.nav-pill {
  /* No transition on first mount — pill snaps to position */
  transition: none;
}
.nav-pill--ready {
  /* Subsequent moves slide */
  transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1);
}

@media (prefers-reduced-motion: reduce) {
  .nav-pill--ready {
    transition: none;
  }
}
</style>
