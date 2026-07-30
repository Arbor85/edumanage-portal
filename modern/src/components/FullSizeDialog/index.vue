<script setup lang="ts">
import { Teleport, watch, onUnmounted } from 'vue'

const props = defineProps<{ open: boolean }>()

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
onUnmounted(() => { document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900"
        role="dialog"
        aria-modal="true"
      >
        <div v-if="$slots.header" class="flex-shrink-0 flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/10">
          <slot name="header" />
        </div>
        <div class="flex-1 min-h-0 overflow-hidden">
          <slot />
        </div>
        <div v-if="$slots.footer" class="flex-shrink-0 px-5 py-4 border-t border-gray-100 dark:border-white/10">
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active, .dialog-leave-active {
  transition: opacity 0.2s cubic-bezier(0.23, 1, 0.32, 1), transform 0.2s cubic-bezier(0.23, 1, 0.32, 1);
}
.dialog-enter-from { opacity: 0; transform: translateY(16px); }
.dialog-leave-to { opacity: 0; transform: translateY(-8px); }

@media (prefers-reduced-motion: reduce) {
  .dialog-enter-active, .dialog-leave-active {
    transition: opacity 0.15s ease !important;
  }
  .dialog-enter-from, .dialog-leave-to { transform: none !important; }
}
</style>
