<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'

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
          class="modal-backdrop absolute inset-0 bg-black/55 backdrop-blur-sm"
          @click="emit('close')"
        />

        <!-- Panel -->
        <div
          class="modal-panel relative bg-white dark:bg-surface-elevated rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col w-full max-h-[92dvh] overflow-hidden"
          :class="{
            'sm:max-w-sm':  size === 'sm',
            'sm:max-w-lg':  size === 'md' || !size,
            'sm:max-w-2xl': size === 'lg',
            'sm:max-w-full sm:h-full sm:rounded-none': size === 'fullscreen',
          }"
        >
          <!-- Drag handle (mobile) -->
          <div class="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div class="w-9 h-1 rounded-full bg-gray-200 dark:bg-white/20" />
          </div>

          <!-- Header -->
          <div v-if="title" class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/8 flex-shrink-0">
            <h2 class="text-base font-semibold text-text-primary dark:text-white tracking-tight">{{ title }}</h2>
            <button
              class="close-btn"
              aria-label="Close dialog"
              @click="emit('close')"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-5">
            <slot />
          </div>

          <!-- Footer slot -->
          <div v-if="$slots.footer" class="px-5 py-4 border-t border-gray-100 dark:border-white/8 flex-shrink-0">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Backdrop: same timing both ways (it's just opacity) */
.modal-backdrop {
  transition: opacity 220ms ease-out;
}
.modal-enter-from .modal-backdrop,
.modal-leave-to .modal-backdrop {
  opacity: 0;
}

/* Panel: asymmetric — enter is slower (user is reading), exit is snappy */
.modal-panel {
  transition:
    transform 260ms cubic-bezier(0.23, 1, 0.32, 1),
    opacity   260ms cubic-bezier(0.23, 1, 0.32, 1);
}
.modal-leave-active .modal-panel {
  transition:
    transform 160ms cubic-bezier(0.55, 0, 1, 0.45),
    opacity   160ms ease-in;
}

/* Mobile: sheet slides up from bottom */
@media (max-width: 639px) {
  .modal-enter-from .modal-panel,
  .modal-leave-to   .modal-panel {
    transform: translateY(100%);
    opacity: 1;
  }
}

/* Desktop: scale + fade from center */
@media (min-width: 640px) {
  .modal-enter-from .modal-panel,
  .modal-leave-to   .modal-panel {
    transform: scale(0.96) translateY(8px);
    opacity: 0;
  }
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  border-radius: 10px;
  color: rgb(107 114 128);
  transition: background 150ms ease-out, color 150ms ease-out;
}
.close-btn:hover {
  background: rgb(243 244 246);
  color: rgb(17 24 39);
}
:global(.dark) .close-btn {
  color: rgba(255,255,255,0.5);
}
:global(.dark) .close-btn:hover {
  background: rgba(255,255,255,0.08);
  color: white;
}
.close-btn:active {
  transform: scale(0.93);
  transition: transform 100ms cubic-bezier(0.23, 1, 0.32, 1);
}

@media (prefers-reduced-motion: reduce) {
  .modal-panel,
  .modal-leave-active .modal-panel { transition: opacity 150ms ease; transform: none !important; }
}
</style>
