<script setup lang="ts">
import { WifiOff, RefreshCw } from 'lucide-vue-next'
import { useNetworkStatus } from '../composables/useNetworkStatus'
import { useOfflineSync } from '../composables/useOfflineSync'

const { isOnline } = useNetworkStatus()
const { pendingCount, isSyncing } = useOfflineSync()
</script>

<template>
  <Transition name="banner">
    <div
      v-if="!isOnline || (isOnline && (isSyncing || pendingCount > 0))"
      class="flex items-center gap-2 px-4 py-2 text-sm font-medium"
      :class="{
        'bg-amber-500/10 text-amber-700 dark:text-amber-400': !isOnline,
        'bg-blue-500/10 text-blue-700 dark:text-blue-400': isOnline && (isSyncing || pendingCount > 0),
      }"
    >
      <WifiOff v-if="!isOnline" class="w-4 h-4 flex-shrink-0" />
      <RefreshCw v-else class="w-4 h-4 flex-shrink-0 animate-spin" />
      <span v-if="!isOnline">You're offline. Viewing cached data.</span>
      <span v-else-if="isSyncing">Syncing workouts…</span>
      <span v-else>{{ pendingCount }} workout{{ pendingCount !== 1 ? 's' : '' }} pending sync</span>
    </div>
  </Transition>
</template>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.banner-enter-to,
.banner-leave-from {
  max-height: 3rem;
}
</style>
