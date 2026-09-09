import Dexie, { type Table } from 'dexie'
import type { RoutineOut, ExcerciseOut, PlanOut, CompleteRoutineCreate } from '../types'

export interface WorkoutQueueEntry {
  localId?: number
  payload: CompleteRoutineCreate
  queuedAt: string
  attempts: number
}

export interface SyncMetaEntry {
  entity: 'routines' | 'exercises' | 'plans'
  lastSyncedAt: string
}

class OfflineDb extends Dexie {
  routines!: Table<RoutineOut, string>
  exercises!: Table<ExcerciseOut, number>
  plans!: Table<PlanOut, string>
  workoutQueue!: Table<WorkoutQueueEntry, number>
  syncMeta!: Table<SyncMetaEntry, string>

  constructor() {
    super('EduManageOfflineDb')
    this.version(1).stores({
      routines: 'id',
      exercises: 'id',
      plans: 'id',
      workoutQueue: '++localId',
      syncMeta: 'entity',
    })
  }
}

export const db = new OfflineDb()
