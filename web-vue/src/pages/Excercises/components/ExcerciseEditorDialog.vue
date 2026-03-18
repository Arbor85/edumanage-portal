<template>
  <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4" @click.self="$emit('cancel')">
    <div class="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
        <button
          type="button"
          @click="$emit('cancel')"
          class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          ✕
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
          <input
            v-model="name"
            type="text"
            placeholder="Exercise name"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Primary muscle</label>
          <SelectMuscles v-model="primaryMuscle" button-text="Select primary muscle" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Secondary muscles</label>
          <SelectMuscles v-model="secondaryMuscles" :multiple="true" button-text="Select secondary muscles" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Short description</label>
          <textarea
            v-model="shortDescription"
            rows="2"
            placeholder="Brief description of the exercise"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Tags
            <span class="font-normal text-slate-400">(press Enter or comma to add)</span>
          </label>
          <div v-if="tags.length" class="mb-2 flex flex-wrap gap-1.5">
            <span
              v-for="(tag, i) in tags"
              :key="i"
              class="flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200"
            >
              {{ tag }}
              <button
                type="button"
                @click="removeTag(i)"
                class="ml-0.5 leading-none text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400"
                :aria-label="`Remove tag ${tag}`"
              >
                ×
              </button>
            </span>
          </div>
          <input
            v-model="tagInput"
            type="text"
            placeholder="Add a tag..."
            @keydown.enter.prevent="addTag"
            @keydown.188.prevent="addTag"
            @blur="addTag"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <p
          v-if="errorMessage"
          class="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
        >
          {{ errorMessage }}
        </p>

        <div class="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="$emit('cancel')"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
          >
            {{ saveLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SelectMuscles from '../../../components/Select/SelectMuscles.vue'
import type { Excercise, ExcerciseWritePayload } from '../../../types/excercise'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    saveLabel: string
    initial?: Excercise | null
  }>(),
  {
    initial: null,
  },
)

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'save', payload: ExcerciseWritePayload): void
}>()

const name = ref('')
const primaryMuscle = ref('')
const secondaryMuscles = ref<string[]>([])
const shortDescription = ref('')
const tags = ref<string[]>([])
const tagInput = ref('')
const errorMessage = ref('')

const applyInitial = () => {
  name.value = props.initial?.name ?? ''
  primaryMuscle.value = props.initial?.primaryMuscle ?? ''
  secondaryMuscles.value = props.initial?.secondaryMuscles ? [...props.initial.secondaryMuscles] : []
  shortDescription.value = props.initial?.shortDescription ?? ''
  tags.value = props.initial?.tags ? [...props.initial.tags] : []
  tagInput.value = ''
  errorMessage.value = ''
}

watch(
  () => [props.open, props.initial],
  () => {
    if (props.open) applyInitial()
  },
  { immediate: true },
)

const addTag = () => {
  const value = tagInput.value.replace(/,$/, '').trim()
  if (value && !tags.value.includes(value)) {
    tags.value.push(value)
  }
  tagInput.value = ''
}

const removeTag = (index: number) => {
  tags.value.splice(index, 1)
}

const submit = () => {
  if (!name.value.trim()) {
    errorMessage.value = 'Please enter an exercise name.'
    return
  }

  if (!primaryMuscle.value.trim()) {
    errorMessage.value = 'Please enter a primary muscle.'
    return
  }

  // Flush any pending tag input before saving
  addTag()

  errorMessage.value = ''
  emit('save', {
    name: name.value.trim(),
    primaryMuscle: primaryMuscle.value.trim(),
    secondaryMuscles: [...secondaryMuscles.value],
    shortDescription: shortDescription.value.trim(),
    tags: [...tags.value],
  })
}
</script>
