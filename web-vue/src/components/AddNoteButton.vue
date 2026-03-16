<template>
  <div class="group relative inline-flex">
    <button
      type="button"
      class="inline-flex items-center justify-center rounded-md border p-1.5 transition-colors"
      :class="hasNote
        ? 'border-sky-300 bg-sky-100 text-sky-800 hover:bg-sky-200 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-300 dark:hover:bg-sky-900/60'
        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'"
      :title="hasNote ? 'Edit note' : 'Add note'"
      :aria-label="hasNote ? 'Edit note' : 'Add note'"
      @click="openDialog"
    >
      <Pencil class="size-4" />
    </button>

    <div
      v-if="hasNote"
      class="pointer-events-none absolute left-1/2 top-full z-20 mt-1 hidden w-56 -translate-x-1/2 rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-700 shadow-lg group-hover:block dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
    >
      {{ modelValue }}
    </div>
  </div>

  <div
    v-if="isOpen"
    class="fixed inset-0 z-[95] flex items-center justify-center bg-slate-900/50 p-4"
    @click.self="closeDialog"
  >
    <div class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ dialogTitle }}</h3>
        <button
          type="button"
          class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          @click="closeDialog"
        >
          ✕
        </button>
      </div>

      <textarea
        v-model="draft"
        @keydown.enter.exact.prevent="saveNote"
        rows="6"
        class="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        placeholder="Write note..."
      />

      <div class="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          @click="closeDialog"
        >
          Cancel
        </button>
        <button
          type="button"
          class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
          @click="saveNote"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Pencil } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    dialogTitle?: string
  }>(),
  {
    modelValue: '',
    dialogTitle: 'Add note',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const draft = ref('')

const hasNote = computed(() => !!props.modelValue?.trim())

const openDialog = () => {
  draft.value = props.modelValue ?? ''
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const saveNote = () => {
  emit('update:modelValue', draft.value.trim())
  isOpen.value = false
}
</script>
