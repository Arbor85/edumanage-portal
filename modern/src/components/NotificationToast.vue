<script setup lang="ts">
import { Teleport } from 'vue'
import { CheckCircle, XCircle, Info } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed bottom-20 right-4 lg:bottom-4 z-[100] flex flex-col gap-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-float text-sm font-semibold min-w-[240px] max-w-xs backdrop-blur-sm border"
          :class="{
            'bg-primary text-white border-primary-dark/30': toast.type === 'success',
            'bg-red-500 text-white border-red-600/30': toast.type === 'error',
            'bg-gray-900 text-white border-white/10 dark:bg-surface-elevated dark:border-white/10': toast.type === 'info',
          }"
        >
          <CheckCircle v-if="toast.type === 'success'" class="w-4 h-4 flex-shrink-0 opacity-90" />
          <XCircle v-else-if="toast.type === 'error'" class="w-4 h-4 flex-shrink-0 opacity-90" />
          <Info v-else class="w-4 h-4 flex-shrink-0 opacity-90" />
          <span class="leading-snug">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1), transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.15s ease !important;
  }
  .toast-enter-from,
  .toast-leave-to {
    transform: none !important;
  }
}
</style>
