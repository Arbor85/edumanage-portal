<script setup lang="ts">
import { Teleport, watch, onUnmounted } from 'vue'

const props = defineProps<{
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'fullscreen'
}>()
const emit = defineEmits<{ close: [] }>()

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
onUnmounted(() => { document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="emit('close')"
        />

        <!-- Panel -->
        <div
          class="relative bg-white dark:bg-surface-dark rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col w-full max-h-[90dvh] overflow-hidden"
          :class="{
            'sm:max-w-sm':  size === 'sm',
            'sm:max-w-lg':  size === 'md' || !size,
            'sm:max-w-2xl': size === 'lg',
            'sm:max-w-full sm:h-full sm:rounded-none': size === 'fullscreen',
          }"
        >
          <!-- Header -->
          <div v-if="title" class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/10 flex-shrink-0">
            <h2 class="text-lg font-semibold text-text-primary dark:text-white">{{ title }}</h2>
            <button
              class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary dark:text-white/60 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close dialog"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-5">
            <slot />
          </div>

          <!-- Footer slot -->
          <div v-if="$slots.footer" class="px-5 py-4 border-t border-gray-100 dark:border-white/10 flex-shrink-0">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .relative, .modal-leave-active .relative { transition: transform 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .relative { transform: translateY(24px); }
.modal-leave-to { opacity: 0; }
.modal-leave-to .relative { transform: translateY(24px); }
</style>
