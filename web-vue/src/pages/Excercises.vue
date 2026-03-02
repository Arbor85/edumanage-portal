<template>
  <div class="w-full max-w-5xl pb-10">
    <div class="mb-5">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Excercises</h1>
    </div>

    <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
      <input
        v-model.trim="searchQuery"
        type="text"
        placeholder="Search by name, muscle or tag"
        class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 md:col-span-3"
      />

      <select
        v-model="selectedPrimaryMuscle"
        class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="">All primary muscles</option>
        <option v-for="muscle in primaryMuscleOptions" :key="muscle" :value="muscle">
          {{ muscle }}
        </option>
      </select>

      <select
        v-model="selectedTag"
        class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="">All tags</option>
        <option v-for="tag in tagOptions" :key="tag" :value="tag">
          {{ tag }}
        </option>
      </select>
    </div>

    <div
      v-if="errorMessage"
      class="mb-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="isLoading"
      class="mb-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
    >
      Loading excercises...
    </div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="excercise in filteredExcercises"
        :key="excercise.id"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="mb-2 flex items-start justify-between gap-2">
          <h2 class="font-semibold text-slate-900 dark:text-slate-100">{{ excercise.name }}</h2>
          <span class="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            {{ excercise.primaryMuscle }}
          </span>
        </div>

        <p class="mb-3 text-sm text-slate-700 dark:text-slate-300">{{ excercise.shortDescription }}</p>

        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in excercise.tags"
            :key="`${excercise.id}-${tag}`"
            class="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200"
          >
            {{ tag }}
          </span>
        </div>
      </article>

      <div
        v-if="filteredExcercises.length === 0"
        class="md:col-span-2 lg:col-span-3 rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        No excercises found for selected filters.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePageTitle } from '../composables/usePageTitle'
import { useExcercisesApi } from '../services/excercisesApi'
import type { Excercise } from '../types/excercise'

usePageTitle('Excercises')

const excercisesApi = useExcercisesApi()

const excercises = ref<Excercise[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const selectedPrimaryMuscle = ref('')
const selectedTag = ref('')

const primaryMuscleOptions = computed(() => {
  const muscles = new Set(excercises.value.map((excercise) => excercise.primaryMuscle))
  return Array.from(muscles).sort((left, right) => left.localeCompare(right))
})

const tagOptions = computed(() => {
  const tags = new Set(excercises.value.flatMap((excercise) => excercise.tags))
  return Array.from(tags).sort((left, right) => left.localeCompare(right))
})

const filteredExcercises = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()
  const normalizedPrimaryMuscle = selectedPrimaryMuscle.value.trim().toLowerCase()
  const normalizedTag = selectedTag.value.trim().toLowerCase()

  return excercises.value.filter((excercise) => {
    const tagsText = excercise.tags.join(' ').toLowerCase()
    const matchesSearch =
      !normalizedQuery ||
      excercise.name.toLowerCase().includes(normalizedQuery) ||
      excercise.primaryMuscle.toLowerCase().includes(normalizedQuery) ||
      excercise.shortDescription.toLowerCase().includes(normalizedQuery) ||
      tagsText.includes(normalizedQuery)
    const matchesPrimaryMuscle =
      !normalizedPrimaryMuscle || excercise.primaryMuscle.toLowerCase() === normalizedPrimaryMuscle
    const matchesTag = !normalizedTag || excercise.tags.some((tag) => tag.toLowerCase() === normalizedTag)

    return matchesSearch && matchesPrimaryMuscle && matchesTag
  })
})

const loadExcercises = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    excercises.value = await excercisesApi.listExcercises()
  } catch {
    errorMessage.value = 'Failed to load excercises'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadExcercises()
})
</script>
