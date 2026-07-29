<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Search, Plus } from 'lucide-vue-next'
import AppLayout from '../components/layout/AppLayout.vue'
import ExerciseGrid from './ExercisesPage/components/ExerciseGrid.vue'
import ExerciseFormModal from './ExercisesPage/components/ExerciseFormModal.vue'
import ExerciseDetailModal from './ExercisesPage/components/ExerciseDetailModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useExerciseStore } from '../stores/exerciseStore'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import type { ExcerciseOut, ActivityType } from '../types'

const exerciseStore = useExerciseStore()
const authStore = useAuthStore()
const toast = useToast()

const search = ref('')
const activityFilter = ref<ActivityType | ''>('')
const displayCount = ref(12)
const isCreateOpen = ref(false)
const editTarget = ref<ExcerciseOut | null>(null)
const detailTarget = ref<ExcerciseOut | null>(null)
const confirmDeleteTarget = ref<ExcerciseOut | null>(null)

onMounted(() => {
  exerciseStore.fetch()
  // Pre-select filter based on user equipment
  const equip = authStore.userProfile?.equipment ?? []
  if (equip.includes('none') && !equip.some((e) => e !== 'none')) {
    activityFilter.value = 'bodyweight'
  }
})

const ACTIVITY_TYPES: { value: ActivityType | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'weighted', label: 'Weighted' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'machine', label: 'Machine' },
]

const filteredExercises = computed(() => {
  let base = exerciseStore.filtered(search.value, '', '')
  if (activityFilter.value) {
    base = base.filter((e) => e.activityType === activityFilter.value)
  }
  return base
})

const visibleExercises = computed(() => filteredExercises.value.slice(0, displayCount.value))
const hasMore = computed(() => displayCount.value < filteredExercises.value.length)

watch([search, activityFilter], () => { displayCount.value = 12 })

function openEdit(ex: ExcerciseOut) {
  editTarget.value = ex
  detailTarget.value = null
}

async function handleDelete(ex: ExcerciseOut) {
  try {
    await exerciseStore.remove(ex.id)
    toast.success('Exercise deleted')
    confirmDeleteTarget.value = null
  } catch {
    toast.error('Failed to delete exercise')
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <!-- Page header -->
      <div class="pt-2 pb-4 flex items-end justify-between">
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-1">Exercise library</p>
          <h1 class="text-3xl font-black text-white">Explore</h1>
        </div>
        <button
          class="flex items-center gap-1.5 px-4 h-10 bg-primary/10 border border-primary/30 text-primary
                 font-bold text-sm rounded-xl hover:bg-primary/20 active:scale-[0.97] transition-all"
          @click="isCreateOpen = true"
        >
          <Plus class="w-4 h-4" />
          Add Exercise
        </button>
      </div>

      <!-- Search bar -->
      <div class="relative mb-4">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          <Search class="w-4 h-4" />
        </span>
        <input
          v-model="search"
          placeholder="Search by name, muscle or tag…"
          class="w-full pl-10 pr-4 h-11 bg-surface-input border border-white/5 rounded-xl
                 text-sm text-white placeholder:text-text-muted outline-none
                 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
        />
      </div>

      <!-- Activity type filter pills -->
      <div class="flex gap-2 flex-wrap mb-6">
        <button
          v-for="type in ACTIVITY_TYPES"
          :key="type.value"
          class="px-4 h-8 rounded-full text-xs font-bold transition-all"
          :class="activityFilter === type.value
            ? 'bg-primary text-white shadow-glow'
            : 'bg-surface-card border border-white/10 text-text-secondary hover:border-white/20 hover:text-white'"
          @click="activityFilter = type.value"
        >
          {{ type.label }}
        </button>
      </div>

      <!-- Results count -->
      <p class="text-xs text-text-muted font-semibold mb-3">
        {{ filteredExercises.length }} exercise{{ filteredExercises.length !== 1 ? 's' : '' }}
      </p>

      <!-- Exercise grid -->
      <ExerciseGrid
        :exercises="visibleExercises"
        :loading="exerciseStore.isLoading"
        @edit="openEdit"
        @delete="(ex) => (confirmDeleteTarget = ex)"
      />

      <!-- Load more -->
      <div v-if="hasMore && !exerciseStore.isLoading" class="flex justify-center mt-8">
        <button
          class="px-6 h-11 bg-surface-card border border-white/10 text-white font-semibold text-sm
                 rounded-xl hover:border-white/20 active:scale-[0.97] transition-all"
          @click="displayCount += 12"
        >
          Load more
        </button>
      </div>
    </div>

    <!-- Modals -->
    <ExerciseFormModal
      :open="isCreateOpen || editTarget !== null"
      :exercise="editTarget"
      @close="isCreateOpen = false; editTarget = null"
    />

    <ExerciseDetailModal
      :open="detailTarget !== null"
      :exercise="detailTarget"
      @close="detailTarget = null"
      @edit="openEdit(detailTarget!)"
    />

    <ConfirmDialog
      :open="confirmDeleteTarget !== null"
      title="Delete Exercise"
      message="Are you sure you want to delete this exercise?"
      confirm-label="Delete"
      variant="danger"
      @confirm="handleDelete(confirmDeleteTarget!)"
      @cancel="confirmDeleteTarget = null"
    />
  </AppLayout>
</template>
