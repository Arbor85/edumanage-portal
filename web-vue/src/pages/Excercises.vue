<template>
  <div class="w-full max-w-5xl pb-24">
    <div class="mb-5">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Excercises</h1>
    </div>

    <div class="mb-4 flex flex-col gap-3">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          v-model.trim="searchQuery"
          type="text"
          placeholder="Search by name, muscle or tag"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:flex-1"
        />

        <div class="flex items-center gap-2 sm:shrink-0">
          <div class="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-600">
            <button
              type="button"
              @click="viewMode = 'tile'"
              class="px-3 py-1.5 text-xs font-medium"
              :class="viewMode === 'tile' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
            >
              Tile
            </button>
            <button
              type="button"
              @click="viewMode = 'list'"
              class="border-l border-slate-300 px-3 py-1.5 text-xs font-medium dark:border-slate-600"
              :class="viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
            >
              List
            </button>
          </div>

          <button
            type="button"
            @click="loadExcercises"
            :disabled="isLoading"
            aria-label="Refresh excercises"
            title="Refresh excercises"
            class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="h-4 w-4"
              :class="isLoading ? 'animate-spin' : ''"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <FilterOption
          v-model="selectedPrimaryMuscles"
          title="Primary muscles"
          :options="primaryMuscleOptions"
          all-label="All primary muscles"
        />

        <FilterOption
          v-model="selectedTags"
          title="Tags"
          :options="tagOptions"
          all-label="All tags"
        />
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="mb-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="isLoading"
      class="mb-3 flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-8 dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="inline-flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
        <svg class="h-5 w-5 animate-spin text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span>Loading excercises...</span>
      </div>
    </div>

    <div v-else-if="viewMode === 'tile'" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        <p class="mb-2">No excercises found for selected filters.</p>
        <button
          type="button"
          @click="loadExcercises"
          class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
        >
          Refresh list
        </button>
      </div>
    </div>

    <div
      v-else
      class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            <tr>
              <th class="px-4 py-3 font-semibold">Name</th>
              <th class="px-4 py-3 font-semibold">Primary muscle</th>
              <th class="px-4 py-3 font-semibold">Tags</th>
              <th class="px-4 py-3 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="excercise in filteredExcercises" :key="excercise.id" class="border-t border-slate-200 dark:border-slate-700">
              <td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{{ excercise.name }}</td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ excercise.primaryMuscle }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="tag in excercise.tags"
                    :key="`${excercise.id}-list-${tag}`"
                    class="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  >
                    {{ tag }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ excercise.shortDescription }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="filteredExcercises.length === 0"
        class="border-t border-slate-200 px-4 py-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
      >
        <p class="mb-2">No excercises found for selected filters.</p>
        <button
          type="button"
          @click="loadExcercises"
          class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
        >
          Refresh list
        </button>
      </div>
    </div>

    <div class="fixed bottom-0 left-56 right-0 z-30 px-6 pb-3">
      <div class="mx-auto w-full max-w-5xl">
        <div class="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
          <div class="flex items-center justify-end">
            <button
              type="button"
              @click="showCreateUnavailableInfo"
              class="inline-flex items-center gap-2 rounded-md border border-emerald-500 bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            >
              <Plus :size="18" />
              Create excercise
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import FilterOption from '../components/FilterOption.vue'
import { useLocalStorageState } from '../composables/useLocalStorageState'
import { usePageTitle } from '../composables/usePageTitle'
import { useExcercisesApi } from '../services/excercisesApi'
import type { Excercise } from '../types/excercise'

usePageTitle('Excercises')

const excercisesApi = useExcercisesApi()

const excercises = ref<Excercise[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const selectedPrimaryMuscles = ref<string[]>([])
const selectedTags = ref<string[]>([])
const viewMode = useLocalStorageState<'tile' | 'list'>('excercises:viewMode', 'tile')

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
  const normalizedPrimaryMuscles = selectedPrimaryMuscles.value.map((muscle) => muscle.toLowerCase())
  const normalizedTags = selectedTags.value.map((tag) => tag.toLowerCase())

  return excercises.value.filter((excercise) => {
    const tagsText = excercise.tags.join(' ').toLowerCase()
    const matchesSearch =
      !normalizedQuery ||
      excercise.name.toLowerCase().includes(normalizedQuery) ||
      excercise.primaryMuscle.toLowerCase().includes(normalizedQuery) ||
      excercise.shortDescription.toLowerCase().includes(normalizedQuery) ||
      tagsText.includes(normalizedQuery)
    const matchesPrimaryMuscle =
      normalizedPrimaryMuscles.length === 0 || normalizedPrimaryMuscles.includes(excercise.primaryMuscle.toLowerCase())
    const matchesTag =
      normalizedTags.length === 0 || excercise.tags.some((tag) => normalizedTags.includes(tag.toLowerCase()))

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

const showCreateUnavailableInfo = () => {
  errorMessage.value = 'Create excercise is not available yet.'
}

onMounted(() => {
  loadExcercises()
})
</script>
