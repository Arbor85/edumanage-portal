<script setup lang="ts">
import { onMounted } from 'vue'
import SideBar from './components/layout/SideBar.vue'
import BottomNav from './components/layout/BottomNav.vue'
import MobileDrawer from './components/layout/MobileDrawer.vue'
import NotificationToast from './components/NotificationToast.vue'
import ActiveWorkoutPill from './components/ActiveWorkoutPill.vue'
import OfflineBanner from './components/OfflineBanner.vue'
import { Menu } from '@lucide/vue'
import { useRouteTransition } from './composables/useRouteTransition'
import { useOfflineSync } from './composables/useOfflineSync'
import { useNavDrawer } from './composables/useNavDrawer'

const { transitionName } = useRouteTransition()
const { start } = useOfflineSync()
const { toggle } = useNavDrawer()

onMounted(() => { start() })
</script>

<template>
  <RouterView v-slot="{ Component, route: r }">
    <template v-if="r.meta.requiresAuth">
      <div class="flex min-h-screen bg-surface-muted dark:bg-surface-page">
        <SideBar />
        <div class="flex-1 flex flex-col min-w-0">
          <OfflineBanner />
          <!-- Mobile top bar -->
          <header class="lg:hidden flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-glow">E</div>
              <span class="text-[14px] font-bold tracking-tight text-gray-900 dark:text-white">EduManage</span>
            </div>
            <button
              class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-card text-text-secondary hover:text-primary hover:border-primary/30 transition-all duration-150"
              aria-label="Open menu"
              @click="toggle"
            >
              <Menu class="w-5 h-5" />
            </button>
          </header>
          <main class="flex-1 overflow-y-auto">
            <div class="grid overflow-x-hidden p-4 sm:p-6 pb-20 lg:pb-6 min-h-full">
              <Transition :name="transitionName">
                <component :is="Component" :key="r.path" />
              </Transition>
            </div>
          </main>
        </div>
        <BottomNav />
        <MobileDrawer />
        <ActiveWorkoutPill />
        <NotificationToast />
      </div>
    </template>
    <component :is="Component" v-else :key="r.path" />
  </RouterView>
</template>
