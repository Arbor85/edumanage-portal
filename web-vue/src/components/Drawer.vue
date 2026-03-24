<template>
  <Teleport to="body">
    <Transition name="drawer" appear>
      <div
        v-if="open"
        class="fixed inset-0 z-[70] bg-slate-900/50"
        @click.self="$emit('cancel')"
      >
        <div class="flex h-full w-full justify-end">
          <div
            :class="widthClass"
            class="drawer-panel flex h-full w-full max-w-full flex-col border-l border-white/60 bg-white shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-800"
          >
            <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
              <button
                type="button"
                @click="$emit('cancel')"
                class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="Close drawer"
              >
                ✕
              </button>
            </div>

            <form class="flex min-h-0 flex-1 flex-col" @submit.prevent="$emit('submit')">
              <div class="min-h-0 flex-1 overflow-y-auto p-5">
                <slot />
              </div>

              <div class="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
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
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    saveLabel?: string
    saveDisabled?: boolean
    showSave?: boolean
    widthClass?: string
  }>(),
  {
    saveLabel: 'Save',
    saveDisabled: false,
    showSave: true,
    widthClass: 'sm:max-w-lg',
  },
)

defineEmits<{
  (event: 'cancel'): void
  (event: 'submit'): void
}>()
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 220ms ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-panel {
  transform: translateX(0);
  transition: transform 260ms ease;
  will-change: transform;
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(100%);
}
</style>