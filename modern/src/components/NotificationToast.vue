<script setup lang="ts">
import { Teleport } from 'vue'
import { CheckCircle, XCircle, Info } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium min-w-[240px] max-w-xs"
          :class="{
            'bg-primary text-white': toast.type === 'success',
            'bg-red-500 text-white': toast.type === 'error',
            'bg-gray-800 text-white': toast.type === 'info',
          }"
        >
          <CheckCircle v-if="toast.type === 'success'" class="w-4 h-4 flex-shrink-0" />
          <XCircle v-else-if="toast.type === 'error'" class="w-4 h-4 flex-shrink-0" />
          <Info v-else class="w-4 h-4 flex-shrink-0" />
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
