<template>
  <div class="relative">
    <button
      type="button"
      @click="openDialog"
      class="inline-flex w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
    >
      <span class="truncate">{{ buttonLabel }}</span>
      <span
        v-if="selectionCount > 0"
        class="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-medium text-white"
      >
        {{ selectionCount }}
      </span>
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
          <button
            type="button"
            @click="closeDialog"
            aria-label="Close filter options"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            x
          </button>
        </div>

        <div class="custom-scrollbar max-h-72 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700">
          <div
            v-for="option in options"
            :key="option"
            class="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-2 text-sm text-slate-700 last:border-b-0 dark:border-slate-700 dark:text-slate-200"
          >
            <span>{{ option }}</span>
            <button
              type="button"
              @click="toggleOption(option)"
              class="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium"
              :class="isOptionSelected(option)
                ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
            >
              {{ isOptionSelected(option) ? 'Unselect' : 'Select' }}
            </button>
          </div>

          <div v-if="options.length === 0" class="px-3 py-3 text-sm text-slate-500 dark:text-slate-300">
            No options available.
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            @click="clearSelection"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Clear
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="closeDialog"
              class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="applySelection"
              class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    options: string[]
    modelValue: string[]
    allLabel?: string
  }>(),
  {
    allLabel: 'All',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void
}>()

const isOpen = ref(false)
const draftSelection = ref<string[]>([])

const normalizedModelValue = computed(() => {
  return Array.from(new Set(props.modelValue))
})

const selectionCount = computed(() => normalizedModelValue.value.length)

const buttonLabel = computed(() => {
  if (selectionCount.value === 0) {
    return `${props.title}: ${props.allLabel}`
  }

  return `${props.title}: ${selectionCount.value} selected`
})

watch(
  () => props.modelValue,
  (nextValue) => {
    draftSelection.value = Array.from(new Set(nextValue))
  },
  { immediate: true },
)

const openDialog = () => {
  draftSelection.value = [...normalizedModelValue.value]
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const toggleOption = (option: string) => {
  if (draftSelection.value.includes(option)) {
    draftSelection.value = draftSelection.value.filter((item) => item !== option)
    return
  }

  draftSelection.value = [...draftSelection.value, option]
}

const isOptionSelected = (option: string) => {
  return draftSelection.value.includes(option)
}

const clearSelection = () => {
  draftSelection.value = []
}

const applySelection = () => {
  emit('update:modelValue', Array.from(new Set(draftSelection.value)))
  closeDialog()
}
</script>
