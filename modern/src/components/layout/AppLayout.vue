<script setup lang="ts">
import SideBar from './SideBar.vue'
import TopNav from './TopNav.vue'
import BottomNav from './BottomNav.vue'
import NotificationToast from '../NotificationToast.vue'
</script>

<template>
  <div class="flex min-h-screen bg-surface-muted dark:bg-gray-900">
    <SideBar />
    <div class="flex-1 flex flex-col min-w-0">
      <TopNav />
      <main class="flex-1 p-4 sm:p-6 pb-20 lg:pb-6 overflow-y-auto">
        <slot />
      </main>
    </div>
    <BottomNav />
    <NotificationToast />
  </div>
</template>
