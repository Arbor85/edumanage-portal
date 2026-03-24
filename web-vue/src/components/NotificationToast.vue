<template>
  <Teleport to="body">
    <Transition name="notification-toast">
      <div
        v-if="open"
        class="pointer-events-none fixed top-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-md justify-end sm:w-full"
      >
        <div
          :key="animationKey"
          class="pointer-events-auto inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3.5 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.45)] dark:border-gray-700 dark:bg-gray-900"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div class="h-7 w-7 flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
              <circle
                fill="none"
                stroke-width="2"
                cx="14"
                cy="14"
                r="12"
                class="stroke-gray-200 dark:stroke-gray-700"
              />
              <circle
                class="circle-prog"
                cx="14"
                cy="14"
                r="12"
                :style="progressStyle"
              />
              <path class="check-path" d="M9 14.5l3.5 3.5 6.5-7" />
            </svg>
          </div>

          <div class="min-w-0 flex-1">
            <p
              class="animate-label text-sm font-medium tracking-tight text-gray-900 dark:text-gray-50"
              v-html="renderedTitle"
            />
            <p
              v-if="message"
              class="animate-sub mt-0.5 text-xs text-gray-400 dark:text-gray-500"
              v-html="renderedMessage"
            />
          </div>

          <button
            type="button"
            @click="restart"
            class="animate-replay ml-1 text-gray-300 transition-colors hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-300"
            title="Replay"
            aria-label="Replay notification animation"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2.5 8a5.5 5.5 0 1 0 1.2-3.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M2.5 4.5V8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message?: string
    durationMs?: number
  }>(),
  {
    message: '',
    durationMs: 4200,
  },
)

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
}>()

const animationKey = ref(0)
const hideTimerId = ref<number>()

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const renderMarkdown = (value: string) => {
  const escapedValue = escapeHtml(value).replace(/\r\n/g, '\n')

  return escapedValue
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br />')
}

const clearHideTimer = () => {
  if (hideTimerId.value !== undefined) {
    window.clearTimeout(hideTimerId.value)
    hideTimerId.value = undefined
  }
}

const scheduleAutoHide = () => {
  clearHideTimer()
  hideTimerId.value = window.setTimeout(() => {
    emit('update:open', false)
  }, props.durationMs)
}

const restart = () => {
  animationKey.value += 1
  scheduleAutoHide()
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      clearHideTimer()
      return
    }

    restart()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearHideTimer()
})

const renderedTitle = computed(() => renderMarkdown(props.title))
const renderedMessage = computed(() => renderMarkdown(props.message))
const progressStyle = computed(() => ({
  animationDuration: `${props.durationMs}ms`,
}))
</script>

<style scoped>
.notification-toast-enter-active,
.notification-toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.notification-toast-enter-from,
.notification-toast-leave-to {
  opacity: 0;
  transform: translate3d(0, -8px, 0);
}

.circle-prog {
  fill: none;
  stroke: #10b981;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 75.4;
  stroke-dashoffset: 75.4;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  animation-name: notification-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.check-path {
  fill: none;
  stroke: #10b981;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 18;
  stroke-dashoffset: 18;
  animation: notification-check 420ms ease 120ms forwards;
}

.animate-label {
  animation: notification-label 260ms ease 80ms both;
}

.animate-sub {
  animation: notification-label 260ms ease 140ms both;
}

.animate-replay {
  animation: notification-label 260ms ease 200ms both;
}

:deep(code) {
  border-radius: 0.375rem;
  background: rgba(148, 163, 184, 0.18);
  padding: 0.1rem 0.35rem;
  font-size: 0.95em;
}

@keyframes notification-progress {
  from {
    stroke-dashoffset: 75.4;
  }

  to {
    stroke-dashoffset: 0;
  }
}

@keyframes notification-check {
  from {
    stroke-dashoffset: 18;
  }

  to {
    stroke-dashoffset: 0;
  }
}

@keyframes notification-label {
  from {
    opacity: 0;
    transform: translate3d(0, 4px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
</style>