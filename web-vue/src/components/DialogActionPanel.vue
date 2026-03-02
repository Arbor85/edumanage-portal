<template>
  <div :class="panelClass">
    <div class="flex items-center justify-between gap-3">
      <button
        v-if="secondaryLabel"
        type="button"
        @click="$emit('secondary-click')"
        :class="secondaryButtonClass"
      >
        {{ secondaryLabel }}
      </button>
      <span v-else></span>

      <button
        type="button"
        @click="$emit('primary-click')"
        :disabled="primaryDisabled"
        class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
      >
        {{ primaryLabel }}
      </button>
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
    secondaryVariant?: 'default' | 'success' | 'danger'
    stickyBottom?: boolean
  }>(),
  {
    primaryDisabled: false,
    secondaryLabel: '',
    secondaryVariant: 'default',
    stickyBottom: false,
  },
)

defineEmits<{
  (event: 'primary-click'): void
  (event: 'secondary-click'): void
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
  const base = 'mt-4 border-t border-slate-200 pt-3 dark:border-slate-700'

  if (!props.stickyBottom) {
    return base
  }

  return `${base} sticky bottom-0 z-20 bg-white/95 px-2 pb-2 backdrop-blur dark:bg-slate-900/95`
})
</script>
