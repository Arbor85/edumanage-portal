<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Dumbbell, Search, SlidersHorizontal, RefreshCw } from '@lucide/vue'
import { useExerciseStore } from '../../stores/exerciseStore'
import { useExercisePicker } from '../../composables/useExercisePicker'
import { useToast } from '../../composables/useToast'
import EmptyState from '../EmptyState.vue'
import ExerciseCard from './ExerciseCard.vue'
import ExerciseFilterPanel from './ExerciseFilterPanel.vue'
import ExercisePreview from './ExercisePreview.vue'

const PAGE_SIZE = 24

defineProps<{
  selectedIds: number[]
  multiple?: boolean
}>()
const emit = defineEmits<{ select: [id: number] }>()

const exerciseStore = useExerciseStore()
const toast = useToast()
const picker = useExercisePicker()

const mobileView = ref<'list' | 'filters' | 'preview'>('list')
const previewId = ref<number | null>(null)
const visibleCount = ref(PAGE_SIZE)

const visibleExercises = computed(() => picker.filteredExercises.value.slice(0, visibleCount.value))
const previewExercise = computed(() => exerciseStore.exercises.find((e) => e.id === previewId.value) ?? null)

watch(picker.filteredExercises, () => { visibleCount.value = PAGE_SIZE })

onMounted(() => {
  if (!exerciseStore.exercises.length) exerciseStore.fetch()
})

function openPreview(id: number) {
  previewId.value = id
  mobileView.value = 'preview'
}

async function toggleFavourite(id: number) {
  try {
    await exerciseStore.toggleFavourite(id)
  } catch {
    toast.error('Could not update favourite')
  }
}

const isInitialLoading = computed(() => exerciseStore.isLoading && !exerciseStore.exercises.length)
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-4 h-full min-h-0">
    <!-- Filters -->
    <aside
      class="lg:w-60 lg:flex-shrink-0 lg:overflow-y-auto custom-scrollbar lg:pr-2 lg:border-r border-gray-100 dark:border-white/10"
      :class="mobileView === 'filters' ? 'block' : 'hidden lg:block'"
    >
      <ExerciseFilterPanel
        :muscle-groups="picker.muscleGroups.value"
        :muscle-counts="picker.muscleCounts.value"
        :equipment-options="picker.equipmentOptions.value"
        :equipment="picker.equipment.value"
        :category-options="picker.categoryOptions.value"
        :categories="picker.categories.value"
        :level-options="picker.levelOptions.value"
        :levels="picker.levels.value"
        :quick="picker.quick.value"
        :favourite-count="picker.favouriteCount.value"
        :recent-count="picker.recentCount.value"
        :active-count="picker.activeFilterCount.value"
        @toggle-muscle="picker.toggleMuscleGroup"
        @toggle-equipment="picker.toggleEquipment"
        @toggle-category="picker.toggleCategory"
        @toggle-level="picker.toggleLevel"
        @update:quick="picker.quick.value = $event"
        @clear="picker.clearFilters"
      />
      <button
        type="button"
        class="lg:hidden sticky bottom-0 mt-4 w-full h-11 rounded-xl bg-primary text-white text-sm font-bold"
        @click="mobileView = 'list'"
      >
        Show {{ picker.filteredExercises.value.length }} exercises
      </button>
    </aside>

    <!-- Results -->
    <section class="flex-1 min-w-0 min-h-0 flex-col gap-3" :class="mobileView === 'list' ? 'flex' : 'hidden lg:flex'">
      <div class="flex gap-2 flex-shrink-0">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <input
            v-model="picker.searchQuery.value"
            type="search"
            placeholder="Search name, muscle or equipment..."
            class="w-full h-11 pl-9 pr-3 text-sm bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 outline-none text-text-primary dark:text-white placeholder:text-text-secondary focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <button
          type="button"
          class="lg:hidden relative flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl border transition-colors"
          :class="picker.activeFilterCount.value
            ? 'bg-primary border-primary text-white'
            : 'border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-text-secondary'"
          aria-label="Open filters"
          @click="mobileView = 'filters'"
        >
          <SlidersHorizontal class="w-4 h-4" />
          <span
            v-if="picker.activeFilterCount.value"
            class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center"
          >{{ picker.activeFilterCount.value }}</span>
        </button>
        <button
          type="button"
          class="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 dark:border-white/10 text-text-secondary hover:text-text-primary dark:hover:text-white"
          aria-label="Refresh exercises"
          :disabled="exerciseStore.isLoading"
          @click="exerciseStore.fetch()"
        >
          <RefreshCw class="w-4 h-4" :class="exerciseStore.isLoading ? 'animate-spin' : ''" />
        </button>
      </div>

      <p class="text-xs text-text-secondary px-0.5 flex-shrink-0">
        <span class="font-semibold text-text-primary dark:text-white">{{ picker.filteredExercises.value.length }}</span>
        of {{ exerciseStore.exercises.length }} exercises
      </p>

      <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
        <div v-if="isInitialLoading" class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div v-for="n in 6" :key="n" class="aspect-[4/5] rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
        </div>
        <EmptyState
          v-else-if="!picker.filteredExercises.value.length"
          :icon="Dumbbell"
          title="No exercises found"
          description="Try a different search term or clear some filters"
        />
        <template v-else>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <ExerciseCard
              v-for="ex in visibleExercises"
              :key="ex.id"
              :exercise="ex"
              :selected="selectedIds.includes(ex.id)"
              :previewed="previewId === ex.id"
              :multiple="!!multiple"
              @preview="openPreview(ex.id)"
              @select="emit('select', ex.id)"
              @favourite="toggleFavourite(ex.id)"
            />
          </div>
          <button
            v-if="visibleCount < picker.filteredExercises.value.length"
            type="button"
            class="mt-3 w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
            @click="visibleCount += PAGE_SIZE"
          >
            Show more ({{ picker.filteredExercises.value.length - visibleCount }} left)
          </button>
        </template>
      </div>
    </section>

    <!-- Preview -->
    <aside
      class="lg:w-72 lg:flex-shrink-0 lg:overflow-y-auto custom-scrollbar lg:pl-2 lg:border-l border-gray-100 dark:border-white/10"
      :class="mobileView === 'preview' ? 'block' : 'hidden lg:block'"
    >
      <ExercisePreview
        v-if="previewExercise"
        :exercise="previewExercise"
        :selected="selectedIds.includes(previewExercise.id)"
        :multiple="!!multiple"
        @select="emit('select', previewExercise.id)"
        @favourite="toggleFavourite(previewExercise.id)"
        @back="mobileView = 'list'"
      />
      <p v-else class="hidden lg:block text-sm text-text-secondary text-center py-10">
        Select an exercise card to see its muscles and how it is performed.
      </p>
    </aside>
  </div>
</template>
