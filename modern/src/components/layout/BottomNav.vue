<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useWorkoutStore } from '../../stores/workoutStore'
import { Home, Dumbbell, Play, Calendar, CalendarDays } from 'lucide-vue-next'
import type { Component } from 'vue'

const route = useRoute()
const workoutStore = useWorkoutStore()

const items: { to: string; icon: Component; label: string; fab?: boolean }[] = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/exercises', icon: Dumbbell, label: 'Exercises' },
  { to: '/workout/active', icon: Play, label: 'Workout', fab: true },
  { to: '/plans', icon: Calendar, label: 'Plans' },
  { to: '/meetings', icon: CalendarDays, label: 'Schedule' },
]
</script>

<template>
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface dark:bg-surface-dark border-t border-gray-100 dark:border-white/10 flex items-center justify-around px-2 pb-safe">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center gap-0.5 py-2 px-3 min-h-[56px] text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      :class="[
        item.fab ? '-mt-4' : '',
        route.path === item.to ? 'text-primary' : 'text-text-secondary',
      ]"
    >
      <span
        v-if="item.fab"
        class="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg text-white text-lg"
        :class="workoutStore.activeWorkout ? 'animate-pulse' : ''"
      >
        <component :is="item.icon" class="w-6 h-6" />
      </span>
      <component :is="item.icon" v-else class="text-xl w-5 h-5" />
      <span v-if="!item.fab">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
