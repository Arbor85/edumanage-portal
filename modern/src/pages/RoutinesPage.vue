<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Pencil, Dumbbell } from 'lucide-vue-next'
import AppLayout from '../components/layout/AppLayout.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import RoutineFormModal from './RoutinesPage/components/RoutineFormModal.vue'
import { useRoutineStore } from '../stores/routineStore'
import { useExerciseStore } from '../stores/exerciseStore'
import type { RoutineOut } from '../types'

const routineStore = useRoutineStore()
const exerciseStore = useExerciseStore()

const search = ref('')
const isCreateOpen = ref(false)
const editTarget = ref<RoutineOut | null>(null)

onMounted(() => {
  routineStore.fetch()
  exerciseStore.fetch()
})

const filtered = computed(() =>
  routineStore.routines.filter((r) =>
    !search.value || r.name?.toLowerCase().includes(search.value.toLowerCase())
  )
)
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <!-- Page header -->
      <div class="pt-2 pb-4 flex items-end justify-between">
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-1">Your workouts</p>
          <h1 class="text-3xl font-black text-white">Routines</h1>
        </div>
        <button
          class="flex items-center gap-1.5 px-4 h-10 bg-primary text-white font-bold text-sm rounded-xl
                 shadow-glow hover:bg-primary-dark active:scale-[0.97] transition-all"
          @click="isCreateOpen = true"
        >
          <Plus class="w-4 h-4" />
          New Routine
        </button>
      </div>

      <!-- Search -->
      <div class="relative mb-4">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke-width="2" />
            <path d="M21 21l-4.35-4.35" stroke-width="2" stroke-linecap="round" />
          </svg>
        </span>
        <input
          v-model="search"
          placeholder="Search routines…"
          class="w-full pl-10 pr-4 h-11 bg-surface-input border border-white/5 rounded-xl
                 text-sm text-white placeholder:text-text-muted outline-none
                 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
        />
      </div>

      <!-- Loading -->
      <div v-if="routineStore.isLoading" class="flex flex-col gap-3">
        <SkeletonLoader v-for="i in 4" :key="i" height="80px" rounded="rounded-2xl" />
      </div>

      <!-- Empty state -->
      <div v-else-if="!filtered.length" class="text-center py-16">
        <Dumbbell class="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p class="text-lg font-bold text-white mb-1">
          {{ routineStore.routines.length === 0 ? 'No routines yet' : 'No matches' }}
        </p>
        <p class="text-sm text-text-secondary mb-6">
          {{ routineStore.routines.length === 0
            ? 'Create your first workout routine to get started.'
            : 'Try a different search term.' }}
        </p>
        <button
          v-if="routineStore.routines.length === 0"
          class="px-5 py-2.5 bg-primary/10 border border-primary/30 text-primary font-semibold rounded-xl
                 hover:bg-primary/20 active:scale-[0.97] transition-all text-sm"
          @click="isCreateOpen = true"
        >
          Create Routine
        </button>
      </div>

      <!-- Routine cards -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="routine in filtered"
          :key="routine.id ?? ''"
          class="bg-surface-card border border-white/5 rounded-2xl p-4 flex items-center gap-4
                 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-lg
                 active:scale-[0.99] transition-all"
        >
          <div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Dumbbell class="w-5 h-5 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-white truncate">{{ routine.name }}</p>
            <p class="text-xs text-text-muted mt-0.5">
              {{ routine.excercises?.length ?? 0 }}
              exercise{{ (routine.excercises?.length ?? 0) !== 1 ? 's' : '' }}
              <span v-if="routine.note"> · {{ routine.note }}</span>
            </p>
          </div>
          <button
            class="w-8 h-8 rounded-lg text-text-muted hover:text-white hover:bg-white/10
                   flex items-center justify-center transition-all flex-shrink-0"
            @click="editTarget = routine"
          >
            <Pencil class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <RoutineFormModal
      :open="isCreateOpen || editTarget !== null"
      :routine="editTarget"
      @close="isCreateOpen = false; editTarget = null"
    />
  </AppLayout>
</template>
