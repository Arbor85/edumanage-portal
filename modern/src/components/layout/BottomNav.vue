<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Home, Dumbbell, TrendingUp, Compass, User } from 'lucide-vue-next'
import type { Component } from 'vue'

const route = useRoute()

const items: { to: string; icon: Component; label: string }[] = [
  { to: '/',         icon: Home,       label: 'Today' },
  { to: '/train',    icon: Dumbbell,   label: 'Train' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/explore',  icon: Compass,    label: 'Explore' },
  { to: '/profile',  icon: User,       label: 'Profile' },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface dark:bg-surface-card border-t border-gray-100 dark:border-white/10 flex items-center justify-around px-2 pb-safe">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center gap-0.5 py-2 px-3 min-h-[56px] text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      :class="isActive(item.to) ? 'text-primary' : 'text-text-secondary'"
    >
      <component :is="item.icon" class="w-5 h-5" />
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
