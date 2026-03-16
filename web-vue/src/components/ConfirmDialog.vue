<template>
  <div v-if="open" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" @click.self="$emit('cancel')">
    <div class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
      <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">{{ message }}</p>

      <div class="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          @click="$emit('cancel')"
          class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          @click="$emit('confirm')"
          :class="confirmVariant === 'primary'
            ? 'border-emerald-500 bg-emerald-500 hover:bg-emerald-600'
            : 'border-rose-500 bg-rose-500 hover:bg-rose-600'"
          class="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium text-white"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    confirmVariant?: 'danger' | 'primary'
  }>(),
  {
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    confirmVariant: 'danger',
  },
)

defineEmits<{
  (event: 'confirm'): void
  (event: 'cancel'): void
}>()
</script>
