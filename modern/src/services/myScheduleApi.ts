import apiClient from './apiClient'
import type { ScheduleEntryOut } from '../types'

export const getMySchedule = (): Promise<ScheduleEntryOut[]> =>
  apiClient.get<ScheduleEntryOut[]>('/api/my-schedule').then((r) => r.data)
