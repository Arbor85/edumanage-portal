<script setup lang="ts">
import { computed, watch } from 'vue'
import type { ExcerciseOut } from '../../types'
import { useExerciseStore } from '../../stores/exerciseStore'
import { useExercisePicker } from '../../composables/useExercisePicker'
import { exerciseImageMap } from '../../data/exerciseImageMap'
import BaseModal from '../BaseModal.vue'
import BaseInput from '../BaseInput.vue'
import BaseBadge from '../BaseBadge.vue'
import EmptyState from '../EmptyState.vue'
import { Dumbbell, SlidersHorizontal, X, Star, Check } from 'lucide-vue-next'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  close: []
  add: [exercises: ExcerciseOut[]]
  addAsSuperset: [exercises: ExcerciseOut[]]
}>()

const exerciseStore = useExerciseStore()

const {
  selectedIds,
  searchQuery,
  muscleFilter,
  filteredExercises,
  selectedExercises,
  hasMultipleSelected,
  favouriteCount,
  toggleSelection,
  toggleDirectFavourite,
  reset,
} = useExercisePicker()

import { ref } from 'vue'
const _filterDialogOpen = ref(false)

watch(
  () => props.open,
  (val) => {
    if (val) {
      reset()
      _filterDialogOpen.value = false
      if (!exerciseStore.exercises.length) exerciseStore.fetch()
    }
  },
)

const muscleOptions = computed(() => {
  const muscles = new Set(
    exerciseStore.exercises.flatMap((e) => (e.primaryMuscle ? [e.primaryMuscle] : [])),
  )
  return [...muscles].sort()
})

const total = computed(() => exerciseStore.exercises.length)
const isFiltered = computed(() => muscleFilter.value.length > 0 || !!searchQuery.value)

const favourites = computed(() => filteredExercises.value.filter((e) => e.isDirectFavourite))
const nonFavourites = computed(() => filteredExercises.value.filter((e) => !e.isDirectFavourite))
const hasFavourites = computed(() => favouriteCount.value > 0)

function toggleMuscle(muscle: string) {
  const idx = muscleFilter.value.findIndex((m) => m.toLowerCase() === muscle.toLowerCase())
  if (idx === -1) muscleFilter.value = [...muscleFilter.value, muscle]
  else muscleFilter.value = muscleFilter.value.filter((_, i) => i !== idx)
}

function removeMuscle(muscle: string) {
  muscleFilter.value = muscleFilter.value.filter((m) => m.toLowerCase() !== muscle.toLowerCase())
}

function clearAll() {
  muscleFilter.value = []
  _filterDialogOpen.value = false
}

function onAdd() {
  emit('add', selectedExercises.value)
  reset()
  emit('close')
}

function onAddAsSuperset() {
  emit('addAsSuperset', selectedExercises.value)
  reset()
  emit('close')
}

const FALLBACK = '/images/benchpress.png'

function exerciseImageSrc(ex: ExcerciseOut): string {
  const mapEntry = exerciseImageMap[(ex.name ?? '').toLowerCase()]
  return ex.imagePath ?? mapEntry?.imagePath ?? FALLBACK
}
</script>

<template>
  <BaseModal :open="open" title="Add Exercise" size="md" @close="emit('close')">
    <div class="flex flex-col gap-3">

      <!-- Search + filter button -->
      <div class="flex gap-2">
        <BaseInput v-model="searchQuery" placeholder="Search exercises..." autofocus class="flex-1" />
        <button
          type="button"
          class="flex-shrink-0 relative flex items-center justify-center w-11 h-11 rounded-xl border transition-colors"
          :class="muscleFilter.length
            ? 'bg-primary border-primary text-white'
            : 'border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-text-secondary hover:text-text-primary dark:hover:text-white'"
          @click="_filterDialogOpen = true"
        >
          <SlidersHorizontal class="w-4 h-4" />
          <span
            v-if="muscleFilter.length"
            class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center"
          >
            {{ muscleFilter.length }}
          </span>
        </button>
      </div>

      <!-- Selected muscle pills -->
      <div v-if="muscleFilter.length" class="flex flex-wrap gap-1.5">
        <button
          v-for="muscle in muscleFilter"
          :key="muscle"
          type="button"
          class="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary transition-colors hover:bg-primary/20"
          @click="removeMuscle(muscle)"
        >
          {{ muscle }}
          <X class="w-3 h-3" />
        </button>
      </div>

      <!-- Count summary -->
      <p class="text-xs text-text-secondary px-0.5">
        <template v-if="isFiltered">
          <span class="font-semibold text-text-primary dark:text-white">{{ filteredExercises.length }}</span>
          of {{ total }} exercises
        </template>
        <template v-else>
          {{ total }} exercises
        </template>
      </p>

      <!-- Exercise list -->
      <ul class="flex flex-col gap-0.5 max-h-72 overflow-y-auto custom-scrollbar -mx-1 px-1">

        <!-- Favourites section -->
        <template v-if="hasFavourites && favourites.length">
          <li class="px-2 pt-1 pb-0.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Favourites</span>
          </li>
          <li v-for="ex in favourites" :key="ex.id">
            <button
              type="button"
              class="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-sm text-text-primary dark:text-white text-left transition-colors"
              :class="selectedIds.has(ex.id)
                ? 'bg-primary/10 dark:bg-primary/20'
                : 'hover:bg-gray-50 dark:hover:bg-white/5'"
              @click="toggleSelection(ex.id)"
            >
              <!-- Star button -->
              <button
                type="button"
                class="flex-shrink-0 p-0.5 rounded transition-colors hover:text-amber-500"
                :class="ex.isDirectFavourite ? 'text-amber-400' : 'text-gray-300 dark:text-white/20'"
                @click.stop="toggleDirectFavourite(ex.id)"
              >
                <Star class="w-3.5 h-3.5" :fill="ex.isDirectFavourite ? 'currentColor' : 'none'" />
              </button>
              <img
                :src="exerciseImageSrc(ex)"
                :alt="ex.name ?? ''"
                class="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100 dark:bg-white/10"
                @error="($event.target as HTMLImageElement).src = FALLBACK"
              />
              <span class="flex-1 truncate font-medium">{{ ex.name }}</span>
              <BaseBadge v-if="ex.primaryMuscle" :label="ex.primaryMuscle" />
              <Check v-if="selectedIds.has(ex.id)" class="w-4 h-4 text-primary flex-shrink-0" />
            </button>
          </li>
        </template>

        <!-- All exercises section -->
        <template v-if="nonFavourites.length">
          <li v-if="hasFavourites && favourites.length" class="px-2 pt-2 pb-0.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-text-secondary">All exercises</span>
          </li>
          <li v-for="ex in nonFavourites" :key="ex.id">
            <button
              type="button"
              class="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-sm text-text-primary dark:text-white text-left transition-colors"
              :class="selectedIds.has(ex.id)
                ? 'bg-primary/10 dark:bg-primary/20'
                : 'hover:bg-gray-50 dark:hover:bg-white/5'"
              @click="toggleSelection(ex.id)"
            >
              <!-- Star button -->
              <button
                type="button"
                class="flex-shrink-0 p-0.5 rounded transition-colors hover:text-amber-500"
                :class="ex.isDirectFavourite ? 'text-amber-400' : 'text-gray-300 dark:text-white/20'"
                @click.stop="toggleDirectFavourite(ex.id)"
              >
                <Star class="w-3.5 h-3.5" :fill="ex.isDirectFavourite ? 'currentColor' : 'none'" />
              </button>
              <img
                :src="exerciseImageSrc(ex)"
                :alt="ex.name ?? ''"
                class="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100 dark:bg-white/10"
                @error="($event.target as HTMLImageElement).src = FALLBACK"
              />
              <span class="flex-1 truncate font-medium">{{ ex.name }}</span>
              <BaseBadge v-if="ex.primaryMuscle" :label="ex.primaryMuscle" />
              <Check v-if="selectedIds.has(ex.id)" class="w-4 h-4 text-primary flex-shrink-0" />
            </button>
          </li>
        </template>

        <li v-if="!filteredExercises.length">
          <EmptyState :icon="Dumbbell" title="No exercises found" description="Try a different search term" />
        </li>
      </ul>

      <!-- Action bar -->
      <div class="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-white/10">
        <span v-if="selectedIds.size > 0" class="text-xs text-text-secondary flex-1">
          {{ selectedIds.size }} selected
        </span>
        <span v-else class="flex-1" />
        <button
          v-if="hasMultipleSelected"
          type="button"
          class="px-3 h-9 rounded-xl text-sm font-semibold border border-primary text-primary hover:bg-primary/5 transition-colors"
          @click="onAddAsSuperset"
        >
          Add as Superset
        </button>
        <button
          type="button"
          class="px-4 h-9 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="selectedIds.size === 0"
          @click="onAdd"
        >
          Add
        </button>
      </div>

    </div>
  </BaseModal>

  <!-- Muscle filter sheet -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="_filterDialogOpen"
        class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40"
        @click.self="_filterDialogOpen = false"
      >
        <div class="w-full max-w-sm bg-surface-card rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[70vh]">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-white/10 flex-shrink-0">
            <p class="text-sm font-bold text-text-primary dark:text-white">Filter by muscle</p>
            <div class="flex items-center gap-2">
              <button
                v-if="muscleFilter.length"
                type="button"
                class="text-xs text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors"
                @click="clearAll"
              >
                Clear all
              </button>
              <button
                type="button"
                class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                @click="_filterDialogOpen = false"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Options -->
          <ul class="overflow-y-auto custom-scrollbar py-2 flex-1">
            <li v-for="muscle in muscleOptions" :key="muscle">
              <button
                type="button"
                class="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                @click="toggleMuscle(muscle)"
              >
                <span
                  class="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors"
                  :class="muscleFilter.some(m => m.toLowerCase() === muscle.toLowerCase())
                    ? 'bg-primary border-primary'
                    : 'border-gray-300 dark:border-white/20'"
                >
                  <svg v-if="muscleFilter.some(m => m.toLowerCase() === muscle.toLowerCase())" class="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span
                  class="flex-1 text-left"
                  :class="muscleFilter.some(m => m.toLowerCase() === muscle.toLowerCase())
                    ? 'font-semibold text-primary'
                    : 'text-text-primary dark:text-white'"
                >
                  {{ muscle }}
                </span>
                <span class="text-xs text-text-secondary">
                  {{ exerciseStore.exercises.filter(e => e.primaryMuscle?.toLowerCase() === muscle.toLowerCase()).length }}
                </span>
              </button>
            </li>
          </ul>

          <!-- Done button -->
          <div class="p-4 border-t border-gray-100 dark:border-white/10 flex-shrink-0">
            <button
              type="button"
              class="w-full h-11 rounded-xl bg-primary text-white text-sm font-bold transition-colors hover:bg-primary-dark"
              @click="_filterDialogOpen = false"
            >
              {{ muscleFilter.length ? `Show ${filteredExercises.length} exercises` : 'Done' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
