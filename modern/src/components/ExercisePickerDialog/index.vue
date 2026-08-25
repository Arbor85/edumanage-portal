<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ExcerciseOut } from '../../types'
import { useExerciseStore } from '../../stores/exerciseStore'
import { exerciseImageMap } from '../../data/exerciseImageMap'
import BaseModal from '../BaseModal.vue'
import BaseInput from '../BaseInput.vue'
import BaseBadge from '../BaseBadge.vue'
import EmptyState from '../EmptyState.vue'
import { Dumbbell, SlidersHorizontal, X } from 'lucide-vue-next'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; select: [exercise: ExcerciseOut] }>()

const exerciseStore = useExerciseStore()
const search = ref('')
const muscleFilters = ref<string[]>([])
const filterDialogOpen = ref(false)

watch(() => props.open, (val) => {
  if (val) {
    search.value = ''
    muscleFilters.value = []
    filterDialogOpen.value = false
    if (!exerciseStore.exercises.length) exerciseStore.fetch()
  }
})

const muscleOptions = computed(() => {
  const muscles = new Set(
    exerciseStore.exercises.flatMap((e) => e.primaryMuscle ? [e.primaryMuscle] : [])
  )
  return [...muscles].sort()
})

const filtered = computed(() =>
  exerciseStore.exercises.filter((e) => {
    const matchSearch = !search.value || e.name?.toLowerCase().includes(search.value.toLowerCase())
    const matchMuscle = !muscleFilters.value.length ||
      muscleFilters.value.some(m => e.primaryMuscle?.toLowerCase() === m.toLowerCase())
    return matchSearch && matchMuscle
  })
)

const total = computed(() => exerciseStore.exercises.length)
const isFiltered = computed(() => muscleFilters.value.length > 0 || !!search.value)

function pick(ex: ExcerciseOut) {
  emit('select', ex)
  emit('close')
}

function toggleMuscle(muscle: string) {
  const idx = muscleFilters.value.findIndex(m => m.toLowerCase() === muscle.toLowerCase())
  if (idx === -1) muscleFilters.value = [...muscleFilters.value, muscle]
  else muscleFilters.value = muscleFilters.value.filter((_, i) => i !== idx)
}

function removeMuscle(muscle: string) {
  muscleFilters.value = muscleFilters.value.filter(m => m.toLowerCase() !== muscle.toLowerCase())
}

function clearAll() {
  muscleFilters.value = []
  filterDialogOpen.value = false
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
        <BaseInput v-model="search" placeholder="Search exercises..." autofocus class="flex-1" />
        <button
          type="button"
          class="flex-shrink-0 relative flex items-center justify-center w-11 h-11 rounded-xl border transition-colors"
          :class="muscleFilters.length
            ? 'bg-primary border-primary text-white'
            : 'border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-text-secondary hover:text-text-primary dark:hover:text-white'"
          @click="filterDialogOpen = true"
        >
          <SlidersHorizontal class="w-4 h-4" />
          <span
            v-if="muscleFilters.length"
            class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center"
          >
            {{ muscleFilters.length }}
          </span>
        </button>
      </div>

      <!-- Selected muscle pills -->
      <div v-if="muscleFilters.length" class="flex flex-wrap gap-1.5">
        <button
          v-for="muscle in muscleFilters"
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
          <span class="font-semibold text-text-primary dark:text-white">{{ filtered.length }}</span>
          of {{ total }} exercises
        </template>
        <template v-else>
          {{ total }} exercises
        </template>
      </p>

      <!-- Exercise list -->
      <ul class="flex flex-col gap-0.5 max-h-72 overflow-y-auto custom-scrollbar -mx-1 px-1">
        <li v-for="ex in filtered" :key="ex.id">
          <button
            type="button"
            class="w-full flex items-center gap-3 px-2 py-1.5 rounded-xl text-sm text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-colors"
            @click="pick(ex)"
          >
            <img
              :src="exerciseImageSrc(ex)"
              :alt="ex.name ?? ''"
              class="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100 dark:bg-white/10"
              @error="($event.target as HTMLImageElement).src = FALLBACK"
            />
            <span class="flex-1 truncate font-medium">{{ ex.name }}</span>
            <BaseBadge v-if="ex.primaryMuscle" :label="ex.primaryMuscle" />
          </button>
        </li>
        <li v-if="!filtered.length">
          <EmptyState :icon="Dumbbell" title="No exercises found" description="Try a different search term" />
        </li>
      </ul>
    </div>
  </BaseModal>

  <!-- Muscle filter sheet -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="filterDialogOpen"
        class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40"
        @click.self="filterDialogOpen = false"
      >
        <div class="w-full max-w-sm bg-surface-card rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[70vh]">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-white/10 flex-shrink-0">
            <p class="text-sm font-bold text-text-primary dark:text-white">Filter by muscle</p>
            <div class="flex items-center gap-2">
              <button
                v-if="muscleFilters.length"
                type="button"
                class="text-xs text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors"
                @click="clearAll"
              >
                Clear all
              </button>
              <button
                type="button"
                class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                @click="filterDialogOpen = false"
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
                <!-- Checkbox -->
                <span
                  class="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors"
                  :class="muscleFilters.some(m => m.toLowerCase() === muscle.toLowerCase())
                    ? 'bg-primary border-primary'
                    : 'border-gray-300 dark:border-white/20'"
                >
                  <svg v-if="muscleFilters.some(m => m.toLowerCase() === muscle.toLowerCase())" class="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  	              </svg>
                </span>
                <span
                  class="flex-1 text-left"
                  :class="muscleFilters.some(m => m.toLowerCase() === muscle.toLowerCase())
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
              @click="filterDialogOpen = false"
            >
              {{ muscleFilters.length ? `Show ${filtered.length} exercises` : 'Done' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
