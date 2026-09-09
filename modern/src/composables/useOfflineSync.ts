import { ref } from 'vue'
import { db } from '../db/offlineDb'
import * as routinesApi from '../services/routinesApi'
import { useToast } from './useToast'

const { success, error } = useToast()
const pendingCount = ref(0)
const isSyncing = ref(false)

async function flush() {
  const entries = await db.workoutQueue.orderBy('queuedAt').toArray()
  if (entries.length === 0) {
    isSyncing.value = false
    return
  }

  isSyncing.value = true

  for (const entry of entries) {
    try {
      await routinesApi.completeRoutine(entry.payload)
      await db.workoutQueue.delete(entry.localId!)
      pendingCount.value = Math.max(0, pendingCount.value - 1)
      success('Workout synced')
    } catch {
      const newAttempts = entry.attempts + 1
      await db.workoutQueue.update(entry.localId!, { attempts: newAttempts })
      if (newAttempts >= 3) {
        error('Failed to sync workout — will retry when online')
      }
      break
    }
  }

  isSyncing.value = false
}

export function useOfflineSync() {
  function notifyQueued() {
    pendingCount.value++
  }

  async function start() {
    pendingCount.value = await db.workoutQueue.count()

    if (navigator.onLine && pendingCount.value > 0) {
      await flush()
      pendingCount.value = await db.workoutQueue.count()
    }

    window.addEventListener('online', async () => {
      pendingCount.value = await db.workoutQueue.count()
      if (pendingCount.value > 0) {
        await flush()
        pendingCount.value = await db.workoutQueue.count()
      }
    })
  }

  return { start, notifyQueued, pendingCount, isSyncing }
}
