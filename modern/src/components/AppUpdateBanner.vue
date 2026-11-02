<script setup lang="ts">
import { RefreshCw } from '@lucide/vue'
import { useAppUpdate } from '../composables/useAppUpdate'

const { needRefresh, applyUpdate } = useAppUpdate()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="-translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div
      v-if="needRefresh"
      class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 py-3
             bg-primary text-white shadow-lg"
    >
      <div class="flex items-center gap-2 min-w-0">
        <RefreshCw class="w-4 h-4 flex-shrink-0" />
        <p class="text-sm font-semibold truncate">New version available</p>
      </div>
      <button
        class="flex-shrink-0 px-4 h-8 bg-white/20 hover:bg-white/30 active:scale-95
               text-white text-xs font-bold rounded-lg transition-all"
        @click="applyUpdate"
      >
        Reload
      </button>
    </div>
  </Transition>
</template>
