import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RoutineOut, RoutineCreate, RoutineUpdate } from '../types'
import * as routinesApi from '../services/routinesApi'

export const useRoutineStore = defineStore('routine', () => {
  const routines = ref<RoutineOut[]>([])
  const isLoading = ref(false)

  async function fetch() {
    isLoading.value = true
    try {
      routines.value = await routinesApi.listRoutines()
    } finally {
      isLoading.value = false
    }
  }

  async function create(d: RoutineCreate) {
    const created = await routinesApi.createRoutine(d)
    routines.value.push(created)
    return created
  }

  async function update(id: string, d: RoutineUpdate) {
    const updated = await routinesApi.updateRoutine(id, d)
    const idx = routines.value.findIndex((r) => r.id === id)
    if (idx !== -1) routines.value[idx] = updated
    return updated
  }

  async function remove(id: string) {
    await routinesApi.deleteRoutine(id)
    routines.value = routines.value.filter((r) => r.id !== id)
  }

  return { routines, isLoading, fetch, create, update, remove }
})
