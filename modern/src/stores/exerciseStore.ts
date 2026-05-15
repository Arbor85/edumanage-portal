import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ExcerciseOut, ExcerciseWriteRequest } from '../types'
import * as exercisesApi from '../services/exercisesApi'

export const useExerciseStore = defineStore('exercise', () => {
  const exercises = ref<ExcerciseOut[]>([])
  const isLoading = ref(false)

  async function fetch() {
    isLoading.value = true
    try {
      exercises.value = await exercisesApi.listExercises()
    } finally {
      isLoading.value = false
    }
  }

  async function create(d: ExcerciseWriteRequest) {
    const created = await exercisesApi.createExercise(d)
    exercises.value.push(created)
    return created
  }

  async function update(id: number, d: ExcerciseWriteRequest) {
    const updated = await exercisesApi.updateExercise(id, d)
    const idx = exercises.value.findIndex((e) => e.id === id)
    if (idx !== -1) exercises.value[idx] = updated
    return updated
  }

  async function remove(id: number) {
    await exercisesApi.deleteExercise(id)
    exercises.value = exercises.value.filter((e) => e.id !== id)
  }

  const filtered = computed(() => (search: string, muscle: string, tag: string) => {
    const s = search.toLowerCase()
    return exercises.value.filter((e) => {
      const matchSearch =
        !s ||
        (e.name?.toLowerCase().includes(s) ?? false) ||
        (e.primaryMuscle?.toLowerCase().includes(s) ?? false) ||
        (e.tags?.some((t) => t.toLowerCase().includes(s)) ?? false)
      const matchMuscle = !muscle || e.primaryMuscle?.toLowerCase() === muscle.toLowerCase()
      const matchTag = !tag || (e.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()) ?? false)
      return matchSearch && matchMuscle && matchTag
    })
  })

  return { exercises, isLoading, fetch, create, update, remove, filtered }
})
