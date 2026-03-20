<template>
  <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4" @click.self="$emit('cancel')">
    <div :class="maxWidthClass" class="w-full rounded-lg border border-white/60 bg-white/60 shadow-lg hover:shadow-2xl focus-within:shadow-2xl transition-shadow backdrop-blur-xl dark:border-slate-700 dark:bg-slate-800/40 flex flex-col">
      <div class="px-5 py-4 flex items-center justify-between border-b border-white/50 dark:border-slate-600">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
        <button
          type="button"
          @click="$emit('cancel')"
          class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          ✕
        </button>
      </div>

      <form class="p-5 space-y-4" @submit.prevent="$emit('submit')">
        <slot />

        <div class="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="$emit('cancel')"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            v-if="showSave"
            type="submit"
            :disabled="saveDisabled"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ saveLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    saveLabel?: string
    saveDisabled?: boolean
    showSave?: boolean
    maxWidthClass?: string
  }>(),
  {
    saveLabel: 'Save',
    saveDisabled: false,
    showSave: true,
    maxWidthClass: 'max-w-lg',
  },
)

defineEmits<{
  (event: 'cancel'): void
  (event: 'submit'): void
}>()
</script>
