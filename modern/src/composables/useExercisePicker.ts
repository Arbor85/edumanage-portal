import { ref, computed } from 'vue'
import { useExerciseStore } from '../stores/exerciseStore'
import * as exercisesApi from '../services/exercisesApi'
import type { ExcerciseOut } from '../types'

export function useExercisePicker() {
  const exerciseStore = useExerciseStore()

  const selectedIds = ref<Set<number>>(new Set())
  const searchQuery = ref('')
  const muscleFilter = ref<string[]>([])

  const sortedExercises = computed<ExcerciseOut[]>(() =>
    [...exerciseStore.exercises].sort((a, b) => {
      if (a.isDirectFavourite !== b.isDirectFavourite)
        return a.isDirectFavourite ? -1 : 1
      if (a.usageCount !== b.usageCount)
        return b.usageCount - a.usageCount
      return (a.name ?? '').localeCompare(b.name ?? '')
    }),
  )

  const filteredExercises = computed<ExcerciseOut[]>(() => {
    const query = searchQuery.value.trim().toLowerCase()
    const muscles = muscleFilter.value
    return sortedExercises.value.filter((e) => {
      const matchSearch =
        !query ||
        (e.name?.toLowerCase().includes(query) ?? false) ||
        (e.primaryMuscle?.toLowerCase().includes(query) ?? false)
      const matchMuscle = !muscles.length || muscles.includes(e.primaryMuscle ?? '')
      return matchSearch && matchMuscle
    })
  })

  const selectedExercises = computed<ExcerciseOut[]>(() =>
    filteredExercises.value.filter((e) => selectedIds.value.has(e.id)),
  )

  const hasMultipleSelected = computed(() => selectedIds.value.size >= 2)

  const favouriteCount = computed(
    () => sortedExercises.value.filter((e) => e.isDirectFavourite).length,
  )

  function toggleSelection(id: number) {
    const next = new Set(selectedIds.value)
    next.has(id) ? next.delete(id) : next.add(id)
    selectedIds.value = next
  }

  async function toggleDirectFavourite(id: number) {
    const exercise = exerciseStore.exercises.find((e) => e.id === id)
    if (exercise) exercise.isDirectFavourite = !exercise.isDirectFavourite
    try {
      await exercisesApi.toggleFavourite(id)
    } catch {
      if (exercise) exercise.isDirectFavourite = !exercise.isDirectFavourite
    }
  }

  function clearSelection() {
    selectedIds.value = new Set()
  }

  function reset() {
    selectedIds.value = new Set()
    searchQuery.value = ''
    muscleFilter.value = []
  }

  return {
    selectedIds,
    searchQuery,
    muscleFilter,
    sortedExercises,
    filteredExercises,
    selectedExercises,
    hasMultipleSelected,
    favouriteCount,
    toggleSelection,
    toggleDirectFavourite,
    clearSelection,
    reset,
  }
}
