<template>
  <div>
    <button
      type="button"
      @click="openDialog"
      :class="[
        'inline-flex min-h-10 items-center rounded-md border px-3 py-2 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40',
        hasSelection
          ? 'w-full justify-between border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
          : 'w-full justify-between border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700'
      ]"
    >
      <span class="truncate">{{ selectedButtonText }}</span>
      <span class="ml-2 shrink-0">▾</span>
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Select muscle</h3>
          <button
            type="button"
            @click="closeDialog"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div class="mb-3">
          <SearchInput v-model="searchQuery" placeholder="Search muscles..." :autofocus="true" />
        </div>

        <div class="custom-scrollbar max-h-96 space-y-2 overflow-auto rounded-md border border-slate-300 p-2 dark:border-slate-600">
          <button
            v-for="muscle in filteredMuscles"
            :key="muscle"
            type="button"
            @click="toggleSelection(muscle)"
            :class="[
              'w-full rounded px-3 py-2 text-left text-sm transition-colors',
              isSelected(muscle)
                ? 'bg-emerald-100 text-slate-900 dark:bg-emerald-900/30 dark:text-slate-100'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
            ]"
          >
            <div class="flex items-center justify-between gap-2">
              <span>{{ muscle }}</span>
              <span v-if="isSelected(muscle)" class="shrink-0 text-emerald-600 dark:text-emerald-400">✓</span>
            </div>
          </button>

          <p v-if="filteredMuscles.length === 0" class="px-2 py-3 text-center text-sm text-slate-500 dark:text-slate-300">
            No muscles match your search.
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
            v-if="multiple"
            type="button"
            @click="applySelection"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SearchInput from '../SearchInput.vue'

const MUSCLE_OPTIONS = [
  'chest (pectoralis major)',
  'upper chest (clavicular head)',
  'lower chest',
  'back (latissimus dorsi)',
  'upper back (trapezius)',
  'middle back (rhomboids)',
  'lower back (erector spinae)',
  'shoulders (deltoids)',
  'front deltoids (anterior deltoid)',
  'side deltoids (lateral deltoid)',
  'rear deltoids (posterior deltoid)',
  'biceps (biceps brachii)',
  'triceps (triceps brachii)',
  'forearms (brachioradialis)',
  'abs (rectus abdominis)',
  'obliques (external obliques)',
  'core (transverse abdominis)',
  'glutes (gluteus maximus)',
  'gluteus medius',
  'quadriceps',
  'hamstrings',
  'calves (gastrocnemius)',
  'calves (soleus)',
] as const

const props = withDefaults(
  defineProps<{
    modelValue?: string | string[]
    buttonText?: string
    multiple?: boolean
  }>(),
  {
    modelValue: '',
    buttonText: 'Select primary muscle',
    multiple: false,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | string[]): void
}>()

const isOpen = ref(false)
const draftSelection = ref<string[]>([])
const searchQuery = ref('')

const multiple = computed(() => props.multiple)

const normalizedModelValue = computed(() => {
  if (multiple.value) {
    return Array.isArray(props.modelValue) ? props.modelValue : []
  }

  if (typeof props.modelValue === 'string' && props.modelValue) {
    return [props.modelValue]
  }

  return []
})

const hasSelection = computed(() => normalizedModelValue.value.length > 0)

const filteredMuscles = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()
  const selectedSet = new Set(draftSelection.value)

  if (!normalizedQuery) {
    return [...MUSCLE_OPTIONS].sort((left, right) => {
      const leftSelected = selectedSet.has(left)
      const rightSelected = selectedSet.has(right)
      if (leftSelected === rightSelected) {
        return left.localeCompare(right)
      }
      return leftSelected ? -1 : 1
    })
  }

  const matches = MUSCLE_OPTIONS.filter((muscle) => muscle.toLowerCase().includes(normalizedQuery))
  const combined = new Set<string>([...draftSelection.value, ...matches])

  return [...combined].sort((left, right) => {
    const leftSelected = selectedSet.has(left)
    const rightSelected = selectedSet.has(right)
    if (leftSelected === rightSelected) {
      return left.localeCompare(right)
    }
    return leftSelected ? -1 : 1
  })
})

const selectedButtonText = computed(() => {
  const selected = normalizedModelValue.value

  if (selected.length === 0) {
    return props.buttonText
  }

  if (!multiple.value) {
    return selected[0]
  }

  return selected.join(', ')
})

watch(
  () => [props.modelValue, props.multiple],
  () => {
    if (!isOpen.value) {
      draftSelection.value = [...normalizedModelValue.value]
    }
  },
)

const isSelected = (muscle: string) => {
  return draftSelection.value.includes(muscle)
}

const toggleSelection = (muscle: string) => {
  if (!multiple.value) {
    emit('update:modelValue', muscle)
    closeDialog()
    return
  }

  if (isSelected(muscle)) {
    draftSelection.value = draftSelection.value.filter((value) => value !== muscle)
    return
  }

  draftSelection.value = [...draftSelection.value, muscle]
}

const openDialog = () => {
  draftSelection.value = [...normalizedModelValue.value]
  searchQuery.value = ''
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const applySelection = () => {
  emit('update:modelValue', [...draftSelection.value])
  closeDialog()
}
</script>
