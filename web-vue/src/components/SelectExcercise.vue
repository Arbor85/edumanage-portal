<template>
  <div>
    <button
      type="button"
      @click="openDialog"
      class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
    >
      {{ buttonText }}
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Select excercises</h3>
          <button
            type="button"
            @click="closeDialog"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div class="max-h-64 space-y-2 overflow-auto rounded-md border border-slate-300 p-2 dark:border-slate-600">
          <label
            v-for="excercise in options"
            :key="excercise"
            class="flex items-center gap-2 rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <input
              type="checkbox"
              :value="excercise"
              :checked="draftSelection.includes(excercise)"
              @change="toggleExcercise(excercise)"
              class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span>{{ excercise }}</span>
          </label>

          <p v-if="options.length === 0" class="px-2 py-1 text-xs text-slate-500 dark:text-slate-300">
            No excercises available.
          </p>
        </div>

        <div class="mt-4 flex items-center justify-end gap-2">
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
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string[]
    options?: string[]
    buttonText?: string
  }>(),
  {
    modelValue: () => [],
    options: () => [],
    buttonText: 'Select excercises',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void
}>()

const isOpen = ref(false)
const draftSelection = ref<string[]>([...props.modelValue])

watch(
  () => props.modelValue,
  (value) => {
    if (!isOpen.value) {
      draftSelection.value = [...value]
    }
  },
)

const openDialog = () => {
  draftSelection.value = [...props.modelValue]
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const toggleExcercise = (name: string) => {
  if (draftSelection.value.includes(name)) {
    draftSelection.value = draftSelection.value.filter((item) => item !== name)
    return
  }

  draftSelection.value = [...draftSelection.value, name]
}

const applySelection = () => {
  emit('update:modelValue', [...draftSelection.value])
  closeDialog()
}
</script>
