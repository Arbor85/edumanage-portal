<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useExerciseStore } from '../stores/exerciseStore'
import type { ExcerciseOut } from '../types'
import BaseSelect from '../components/BaseSelect.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import AppLayout from '../components/layout/AppLayout.vue'
import BaseButton from '../components/BaseButton.vue'
import ExerciseGrid from './ExercisesPage/components/ExerciseGrid.vue'
import ExerciseFormModal from './ExercisesPage/components/ExerciseFormModal.vue'
import ExerciseDetailModal from './ExercisesPage/components/ExerciseDetailModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useToast } from '../composables/useToast'

const exerciseStore = useExerciseStore()
const toast = useToast()

const search = ref('')
const muscleFilter = ref('')
const tagFilter = ref('')
const displayCount = ref(8)
const isCreateOpen = ref(false)
const editTarget = ref<ExcerciseOut | null>(null)
const detailTarget = ref<ExcerciseOut | null>(null)
const confirmDeleteTarget = ref<ExcerciseOut | null>(null)

onMounted(() => exerciseStore.fetch())

const filteredExercises = computed(() =>
  exerciseStore.filtered(search.value, muscleFilter.value, tagFilter.value)
)

const visibleExercises = computed(() =>
  filteredExercises.value.slice(0, displayCount.value)
)

const hasMore = computed(() => displayCount.value < filteredExercises.value.length)

// Reset displayCount when filters change
watch([search, muscleFilter, tagFilter], () => { displayCount.value = 8 })

const muscleOptions = computed(() => {
  const muscles = new Set(exerciseStore.exercises.flatMap((e) => e.primaryMuscle ? [e.primaryMuscle] : []))
  return [{ value: '', label: 'All Muscle Groups' }, ...[...muscles].map((m) => ({ value: m, label: m }))]
})

async function handleDelete(ex: ExcerciseOut) {
  try {
    await exerciseStore.remove(ex.id)
    toast.success('Exercise deleted')
    confirmDeleteTarget.value = null
  } catch {
    toast.error('Failed to delete exercise')
  }
}

function openEdit(ex: ExcerciseOut) {
  editTarget.value = ex
  detailTarget.value = null
}
</script>

<template>
  <AppLayout>
    <PageHeader title="Exercise Library" subtitle="Discover and manage exercises.">
      <BaseButton variant="primary" @click="isCreateOpen = true">+ New Exercise</BaseButton>
    </PageHeader>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="relative flex-1">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">🔍</span>
        <input
          v-model="search"
          placeholder="Search by name, muscle or tag..."
          class="w-full pl-9 pr-4 py-2.5 min-h-[44px] rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-sm text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>
      <BaseSelect v-model="muscleFilter" :options="muscleOptions" class="sm:w-48" />
    </div>

    <!-- Grid -->
    <ExerciseGrid
      :exercises="visibleExercises"
      :loading="exerciseStore.isLoading"
      @edit="openEdit"
      @delete="(ex) => (confirmDeleteTarget = ex)"
    />

    <!-- Load More -->
    <div v-if="hasMore && !exerciseStore.isLoading" class="flex justify-center mt-8">
      <BaseButton variant="secondary" @click="displayCount += 8">Load More Exercises</BaseButton>
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
