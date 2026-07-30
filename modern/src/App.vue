<script setup lang="ts">
import SideBar from './components/layout/SideBar.vue'
import BottomNav from './components/layout/BottomNav.vue'
import NotificationToast from './components/NotificationToast.vue'
import ActiveWorkoutPill from './components/ActiveWorkoutPill.vue'
import { useRouteTransition } from './composables/useRouteTransition'

const { transitionName } = useRouteTransition()
</script>

<template>
  <RouterView v-slot="{ Component, route: r }">
    <template v-if="r.meta.requiresAuth && r.name !== 'Onboarding'">
      <div class="flex min-h-screen bg-surface-muted dark:bg-surface-page">
        <SideBar />
        <div class="flex-1 flex flex-col min-w-0">
          <main class="flex-1 overflow-y-auto">
            <div class="grid overflow-x-hidden p-4 sm:p-6 pb-20 lg:pb-6 min-h-full">
              <Transition :name="transitionName">
                <component :is="Component" :key="r.path" />
              </Transition>
            </div>
          </main>
        </div>
        <BottomNav />
        <ActiveWorkoutPill />
        <NotificationToast />
      </div>
    </template>
    <component :is="Component" v-else :key="r.path" />
  </RouterView>
</template>
