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

    <FormDialog :open="isOpen" title="Select course" save-label="Select" :save-disabled="!draftSelection" @cancel="closeDialog" @submit="applySelection">
      <div class="mb-3">
        <SearchInput v-model="searchQuery" placeholder="Search courses..." :autofocus="true" />
      </div>

      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span>Loading courses...</span>
        </div>
      </div>

      <div v-else class="custom-scrollbar space-y-2 rounded-md border border-slate-300 p-2 dark:border-slate-600">
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

        <p v-if="currentOptions.length === 0" class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300">
          No courses available.
        </p>
        <p v-else-if="filteredCourses.length === 0" class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300">
          No courses match your search.
        </p>
      </div>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import FormDialog from '../FormDialog.vue'
import SearchInput from '../SearchInput.vue'
import type { Course } from '../../types/course'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    options?: Course[]
    buttonText?: string
    fetchFn?: () => Promise<Course[]>
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
const isLoading = ref(false)
const localOptions = ref<Course[]>(props.options)
const dataFetched = ref(false)

const currentOptions = computed(() => localOptions.value.length > 0 ? localOptions.value : props.options)

const filteredCourses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return currentOptions.value
  return currentOptions.value.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q),
  )
})

const selectedButtonText = computed(() => {
  if (!props.modelValue) return props.buttonText
  return currentOptions.value.find((c) => c.id === props.modelValue)?.name ?? props.buttonText
})

watch(() => props.modelValue, (val) => {
  draftSelection.value = val ?? ''
})

const openDialog = async () => {
  draftSelection.value = props.modelValue ?? ''
  searchQuery.value = ''
  isOpen.value = true

  if (!dataFetched.value && props.fetchFn && localOptions.value.length === 0) {
    isLoading.value = true
    try {
      localOptions.value = await props.fetchFn()
      dataFetched.value = true
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      localOptions.value = []
    } finally {
      isLoading.value = false
    }
  }
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
