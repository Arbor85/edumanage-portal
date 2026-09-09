import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RoutineOut, RoutineCreate, RoutineUpdate } from '../types'
import * as routinesApi from '../services/routinesApi'
import { db } from '../db/offlineDb'

export const useRoutineStore = defineStore('routine', () => {
  const routines = ref<RoutineOut[]>([])
  const isLoading = ref(false)

  async function fetch() {
    isLoading.value = true
    try {
      if (!navigator.onLine) {
        routines.value = await db.routines.toArray()
        return
      }
      const data = await routinesApi.listRoutines()
      routines.value = data
      await db.routines.bulkPut(data)
      await db.syncMeta.put({ entity: 'routines', lastSyncedAt: new Date().toISOString() })
    } finally {
      isLoading.value = false
    }
  }

  async function create(d: RoutineCreate) {
    const created = await routinesApi.createRoutine(d)
    routines.value.push(created)
    await db.routines.put(created)
    return created
  }

  async function update(id: string, d: RoutineUpdate) {
    const updated = await routinesApi.updateRoutine(id, d)
    const idx = routines.value.findIndex((r) => r.id === id)
    if (idx !== -1) routines.value[idx] = updated
    await db.routines.put(updated)
    return updated
  }

  async function remove(id: string) {
    await routinesApi.deleteRoutine(id)
    routines.value = routines.value.filter((r) => r.id !== id)
    await db.routines.delete(id)
  }

  return { routines, isLoading, fetch, create, update, remove }
})
