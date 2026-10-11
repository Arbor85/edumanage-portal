import { ref, computed } from 'vue'
import { useExerciseStore } from '../stores/exerciseStore'
import { muscleGroupOf } from '../utils/muscleGroups'
import type { ExcerciseOut } from '../types'

export type QuickFilter = 'all' | 'favourites' | 'recent'

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced']

export interface FilterOption {
  value: string
  count: number
}

function countBy(items: ExcerciseOut[], pick: (e: ExcerciseOut) => string | null | undefined): FilterOption[] {
  const counts = new Map<string, number>()
  for (const e of items) {
    const v = pick(e)?.trim()
    if (v) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return [...counts].map(([value, count]) => ({ value, count }))
}

export function useExercisePicker() {
  const exerciseStore = useExerciseStore()

  const searchQuery = ref('')
  const muscleGroups = ref<string[]>([])
  const equipment = ref<string[]>([])
  const categories = ref<string[]>([])
  const levels = ref<string[]>([])
  const quick = ref<QuickFilter>('all')

  const sortedExercises = computed<ExcerciseOut[]>(() =>
    [...exerciseStore.exercises].sort((a, b) => {
      if (a.isDirectFavourite !== b.isDirectFavourite) return a.isDirectFavourite ? -1 : 1
      if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount
      return (a.name ?? '').localeCompare(b.name ?? '')
    }),
  )

  type Facet = 'muscle' | 'equipment' | 'category' | 'level'

  // Facet counts ignore their own filter so options stay selectable within a group.
  function matches(e: ExcerciseOut, skip?: Facet): boolean {
    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      const hit =
        (e.name?.toLowerCase().includes(q) ?? false) ||
        (e.primaryMuscle?.toLowerCase().includes(q) ?? false) ||
        (e.secondaryMuscles?.some((m) => m.toLowerCase().includes(q)) ?? false) ||
        (e.equipment?.toLowerCase().includes(q) ?? false)
      if (!hit) return false
    }
    if (quick.value === 'favourites' && !e.isDirectFavourite) return false
    if (quick.value === 'recent' && e.usageCount <= 0) return false
    if (skip !== 'muscle' && muscleGroups.value.length && !muscleGroups.value.includes(muscleGroupOf(e.primaryMuscle))) return false
    if (skip !== 'equipment' && equipment.value.length && !equipment.value.includes(e.equipment ?? '')) return false
    if (skip !== 'category' && categories.value.length && !categories.value.includes(e.category ?? '')) return false
    if (skip !== 'level' && levels.value.length && !levels.value.includes(e.level ?? '')) return false
    return true
  }

  const filteredExercises = computed(() => sortedExercises.value.filter((e) => matches(e)))

  const muscleCounts = computed(() => {
    const counts: Record<string, number> = {}
    for (const e of sortedExercises.value) {
      if (!matches(e, 'muscle')) continue
      const key = muscleGroupOf(e.primaryMuscle)
      counts[key] = (counts[key] ?? 0) + 1
    }
    return counts
  })

  const byCountThenName = (a: FilterOption, b: FilterOption) => b.count - a.count || a.value.localeCompare(b.value)

  const equipmentOptions = computed(() =>
    countBy(sortedExercises.value.filter((e) => matches(e, 'equipment')), (e) => e.equipment).sort(byCountThenName),
  )
  const categoryOptions = computed(() =>
    countBy(sortedExercises.value.filter((e) => matches(e, 'category')), (e) => e.category).sort(byCountThenName),
  )
  const levelOptions = computed(() =>
    countBy(sortedExercises.value.filter((e) => matches(e, 'level')), (e) => e.level)
      .sort((a, b) => LEVEL_ORDER.indexOf(a.value.toLowerCase()) - LEVEL_ORDER.indexOf(b.value.toLowerCase())),
  )

  const favouriteCount = computed(() => exerciseStore.exercises.filter((e) => e.isDirectFavourite).length)
  const recentCount = computed(() => exerciseStore.exercises.filter((e) => e.usageCount > 0).length)

  const activeFilterCount = computed(
    () =>
      muscleGroups.value.length +
      equipment.value.length +
      categories.value.length +
      levels.value.length +
      (quick.value === 'all' ? 0 : 1),
  )

  function toggleIn(list: { value: string[] }, item: string) {
    list.value = list.value.includes(item) ? list.value.filter((i) => i !== item) : [...list.value, item]
  }

  const toggleMuscleGroup = (key: string) => toggleIn(muscleGroups, key)
  const toggleEquipment = (v: string) => toggleIn(equipment, v)
  const toggleCategory = (v: string) => toggleIn(categories, v)
  const toggleLevel = (v: string) => toggleIn(levels, v)

  function clearFilters() {
    muscleGroups.value = []
    equipment.value = []
    categories.value = []
    levels.value = []
    quick.value = 'all'
  }

  function reset() {
    searchQuery.value = ''
    clearFilters()
  }

  return {
    searchQuery,
    muscleGroups,
    equipment,
    categories,
    levels,
    quick,
    sortedExercises,
    filteredExercises,
    muscleCounts,
    equipmentOptions,
    categoryOptions,
    levelOptions,
    favouriteCount,
    recentCount,
    activeFilterCount,
    toggleMuscleGroup,
    toggleEquipment,
    toggleCategory,
    toggleLevel,
    clearFilters,
    reset,
  }
}
