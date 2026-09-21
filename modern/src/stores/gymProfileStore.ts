import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserExerciseMax, UserExerciseMaxUpsert } from '../types'
import * as gymProfileApi from '../services/gymProfileApi'

export const useGymProfileStore = defineStore('gymProfile', () => {
  const maxes = ref<UserExerciseMax[]>([])
  const isLoading = ref(false)
  let fetched = false

  async function fetch() {
    if (fetched) return
    isLoading.value = true
    try {
      maxes.value = await gymProfileApi.listGymProfile()
      fetched = true
    } finally {
      isLoading.value = false
    }
  }

  async function fetchForClient(userId: string): Promise<UserExerciseMax[]> {
    return gymProfileApi.getClientGymProfile(userId)
  }

  async function upsert(exerciseId: number, data: UserExerciseMaxUpsert) {
    const result = await gymProfileApi.upsertMax(exerciseId, data)
    const idx = maxes.value.findIndex((m) => m.exerciseId === exerciseId)
    if (idx !== -1) {
      maxes.value[idx] = result
    } else {
      maxes.value.push(result)
    }
  }

  async function remove(exerciseId: number) {
    await gymProfileApi.deleteMax(exerciseId)
    maxes.value = maxes.value.filter((m) => m.exerciseId !== exerciseId)
  }

  function getByExerciseId(id: number): UserExerciseMax | undefined {
    return maxes.value.find((m) => m.exerciseId === id)
  }

  return { maxes, isLoading, fetch, fetchForClient, upsert, remove, getByExerciseId }
})
