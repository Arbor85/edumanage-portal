import apiClient from './apiClient'
import type { MeetingOut, MeetingCreate, MeetingUpdate } from '../types'

export const listMeetings = (): Promise<MeetingOut[]> =>
  apiClient.get<MeetingOut[]>('/api/meetings').then((r) => r.data)

export const createMeeting = (d: MeetingCreate): Promise<MeetingOut> =>
  apiClient.post<MeetingOut>('/api/meetings', d).then((r) => r.data)

export const updateMeeting = (id: string, d: MeetingUpdate): Promise<MeetingOut> =>
  apiClient.put<MeetingOut>(`/api/meetings/${id}`, d).then((r) => r.data)

export const deleteMeeting = (id: string): Promise<void> =>
  apiClient.delete(`/api/meetings/${id}`).then(() => undefined)
