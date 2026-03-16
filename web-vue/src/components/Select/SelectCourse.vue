<template>
  <div>
    <button
      type="button"
      @click="openDialog"
      :class="[
        'inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
        modelValue
          ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
          : 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700'
      ]"
    >
      {{ selectedButtonText }}
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Select course</h3>
          <button
            type="button"
            @click="closeDialog"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div class="mb-3">
          <SearchInput v-model="searchQuery" placeholder="Search courses..." :autofocus="true" />
        </div>

        <div class="custom-scrollbar max-h-96 space-y-2 overflow-auto rounded-md border border-slate-300 p-2 dark:border-slate-600">
          <div
            v-for="course in filteredCourses"
            :key="course.id"
            @click="draftSelection = course.id"
            :class="[
              'flex cursor-pointer items-center gap-3 rounded px-3 py-2 transition-colors',
              draftSelection === course.id
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
            ]"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {{ course.name }}
                </p>
                <span
                  :class="course.type === 'Group' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'"
                  class="rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0"
                >
                  {{ course.type }}
                </span>
              </div>
              <p class="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                {{ course.price.currency }} {{ course.price.value.toFixed(2) }}
                <span v-if="course.type === 'Group' && course.size" class="text-slate-500 dark:text-slate-400">
                  · up to {{ course.size }}
                </span>
              </p>
              <p v-if="course.description" class="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                {{ course.description }}
              </p>
            </div>
            <div v-if="draftSelection === course.id" class="text-emerald-600 dark:text-emerald-400 shrink-0">✓</div>
          </div>

          <p v-if="options.length === 0" class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300">
            No courses available.
          </p>
          <p v-else-if="filteredCourses.length === 0" class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300">
            No courses match your search.
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
            :disabled="!draftSelection"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SearchInput from '../SearchInput.vue'
import type { Course } from '../../types/course'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    options?: Course[]
    buttonText?: string
  }>(),
  {
    modelValue: '',
    options: () => [],
    buttonText: 'Select course',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const draftSelection = ref(props.modelValue)
const searchQuery = ref('')

const filteredCourses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q),
  )
})

const selectedButtonText = computed(() => {
  if (!props.modelValue) return props.buttonText
  return props.options.find((c) => c.id === props.modelValue)?.name ?? props.buttonText
})

watch(() => props.modelValue, (val) => {
  draftSelection.value = val ?? ''
})

const openDialog = () => {
  draftSelection.value = props.modelValue ?? ''
  searchQuery.value = ''
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const applySelection = () => {
  if (draftSelection.value) {
    emit('update:modelValue', draftSelection.value)
  }
  closeDialog()
}
</script>
