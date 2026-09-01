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
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 dark:bg-surface-card/95 border-t border-gray-100 dark:border-white/8 flex items-center justify-around px-1 pb-safe backdrop-blur-md">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="relative flex flex-col items-center gap-0.5 py-2.5 px-3 min-h-[56px] min-w-[52px] text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      :class="isActive(item.to) ? 'text-primary' : 'text-text-secondary'"
    >
      <component :is="item.icon" class="w-5 h-5 transition-transform duration-150" :class="isActive(item.to) ? 'scale-110' : ''" />
      <span class="transition-opacity duration-150" :class="isActive(item.to) ? 'opacity-100' : 'opacity-70'">{{ item.label }}</span>
      <!-- Active dot -->
      <span
        v-if="isActive(item.to)"
        class="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
      />
    </RouterLink>
  </nav>
</template>
