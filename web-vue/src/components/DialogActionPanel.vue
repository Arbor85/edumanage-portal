<template>
  <div :class="containerClass">
    <div class="mx-auto w-full max-w-5xl">
      <div :class="panelClass">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button v-if="cancelLabel" type="button" @click="$emit('cancel-click')"
              class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
              {{ cancelLabel }}
            </button>

            <button v-if="secondaryLabel" type="button" @click="$emit('secondary-click')" :class="secondaryButtonClass">
              {{ secondaryLabel }}
            </button>

            <span v-if="!cancelLabel && !secondaryLabel"></span>
          </div>

          <button :type="primaryButtonType" @click="$emit('primary-click')" :disabled="primaryDisabled"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50">
            {{ primaryLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    primaryLabel: string
    primaryDisabled?: boolean
    secondaryLabel?: string
    cancelLabel?: string
    secondaryVariant?: 'default' | 'success' | 'danger'
    stickyBottom?: boolean
    primaryButtonType?: 'button' | 'submit'
    dialogMode?: boolean
  }>(),
  {
    primaryDisabled: false,
    secondaryLabel: '',
    cancelLabel: '',
    secondaryVariant: 'default',
    stickyBottom: false,
    primaryButtonType: 'button',
    dialogMode: false,
  },
)

defineEmits<{
  (event: 'primary-click'): void
  (event: 'secondary-click'): void
  (event: 'cancel-click'): void
}>()

const secondaryButtonClass = computed(() => {
  if (props.secondaryVariant === 'danger') {
    return 'inline-flex items-center rounded-md border border-rose-300 bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600 dark:border-rose-400 dark:bg-rose-600 dark:hover:bg-rose-500'
  }

  if (props.secondaryVariant === 'success') {
    return 'inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600'
  }

  return 'inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
})

const panelClass = computed(() => {
  const base = 'border-t border-slate-200 pt-4 dark:border-slate-700'

  if (!props.stickyBottom) {
    return base
  }

  return `${base} sticky bottom-0 z-20 bg-white/95 px-2 pb-2 backdrop-blur dark:bg-slate-900/95`
})

const containerClass = computed(() => {
  const base = 'fixed bottom-0 right-0 bg-slate-100 px-6 pb-3 shadow-[0_-6px_16px_-14px_rgba(15,23,42,0.32)] transition-shadow duration-200 hover:shadow-[0_-10px_24px_-14px_rgba(15,23,42,0.45)] dark:bg-slate-900 dark:shadow-[0_-6px_16px_-14px_rgba(2,6,23,0.7)] dark:hover:shadow-[0_-10px_24px_-14px_rgba(2,6,23,0.9)]'

  if (props.dialogMode) {
    return `${base} left-0 z-[95]`
  }

  return `${base} left-56 z-30`
})
</script>
