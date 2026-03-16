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

        <div class="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          <select
            v-model="selectedTag"
            class="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">All tags</option>
            <option v-for="tag in availableTags" :key="tag" :value="tag">{{ tag }}</option>
          </select>

          <select
            v-model="selectedPrimaryMuscle"
            class="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">All primary muscles</option>
            <option v-for="muscle in availablePrimaryMuscles" :key="muscle" :value="muscle">{{ muscle }}</option>
          </select>
        </div>

        <div class="custom-scrollbar max-h-64 space-y-2 overflow-auto rounded-md border border-slate-300 p-2 dark:border-slate-600">
          <div
            v-for="excercise in filteredOptions"
            :key="excercise.id"
            class="flex items-center justify-between gap-2 rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium">{{ excercise.name }}</p>
              <p class="truncate text-xs text-slate-500 dark:text-slate-300">
                {{ excercise.primaryMuscle }} • {{ excercise.tags.join(', ') || 'No tags' }}
              </p>
            </div>

            <button
              type="button"
              @click="toggleExcercise(excercise.name)"
              :class="isSelected(excercise.name)
                ? 'inline-flex items-center rounded-md border border-rose-300 bg-white px-2 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-700 dark:text-rose-300 dark:hover:bg-rose-900/30'
                : 'inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-600'"
            >
              {{ isSelected(excercise.name) ? 'Remove' : 'Select' }}
            </button>
          </div>

          <p v-if="options.length === 0" class="px-2 py-1 text-xs text-slate-500 dark:text-slate-300">
            No excercises available.
          </p>

          <p
            v-else-if="filteredOptions.length === 0"
            class="px-2 py-1 text-xs text-slate-500 dark:text-slate-300"
          >
            No excercises match selected filters.
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
import { computed, ref, watch } from 'vue'
import type { Excercise } from '../../types/excercise'

const props = withDefaults(
  defineProps<{
    modelValue?: string[]
    options?: Excercise[]
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
const selectedTag = ref('')
const selectedPrimaryMuscle = ref('')

const availableTags = computed(() => {
  const uniqueTags = new Set<string>()

  for (const excercise of props.options) {
    for (const tag of excercise.tags) {
      uniqueTags.add(tag)
    }
  }

  return [...uniqueTags].sort((left, right) => left.localeCompare(right))
})

const availablePrimaryMuscles = computed(() => {
  const uniqueMuscles = new Set<string>()

  for (const excercise of props.options) {
    if (excercise.primaryMuscle) {
      uniqueMuscles.add(excercise.primaryMuscle)
    }
  }

  return [...uniqueMuscles].sort((left, right) => left.localeCompare(right))
})

const filteredOptions = computed(() => {
  return props.options.filter((excercise) => {
    const matchesTag = selectedTag.value ? excercise.tags.includes(selectedTag.value) : true
    const matchesPrimaryMuscle = selectedPrimaryMuscle.value ? excercise.primaryMuscle === selectedPrimaryMuscle.value : true

    return matchesTag && matchesPrimaryMuscle
  })
})

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
  selectedTag.value = ''
  selectedPrimaryMuscle.value = ''
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

const isSelected = (name: string) => {
  return draftSelection.value.includes(name)
}

const applySelection = () => {
  emit('update:modelValue', [...draftSelection.value])
  closeDialog()
}
</script>
