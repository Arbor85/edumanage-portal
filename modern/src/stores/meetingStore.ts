import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MeetingOut, MeetingCreate, MeetingUpdate } from '../types'
import * as meetingsApi from '../services/meetingsApi'

export const useMeetingStore = defineStore('meeting', () => {
  const meetings = ref<MeetingOut[]>([])
  const isLoading = ref(false)

  async function fetch() {
    isLoading.value = true
    try {
      meetings.value = await meetingsApi.listMeetings()
    } finally {
      isLoading.value = false
    }
  }

  async function create(d: MeetingCreate) {
    const created = await meetingsApi.createMeeting(d)
    meetings.value.push(created)
    return created
  }

  async function update(id: string, d: MeetingUpdate) {
    const updated = await meetingsApi.updateMeeting(id, d)
    const idx = meetings.value.findIndex((m) => m.id === id)
    if (idx !== -1) meetings.value[idx] = updated
    return updated
  }

  async function remove(id: string) {
    await meetingsApi.deleteMeeting(id)
    meetings.value = meetings.value.filter((m) => m.id !== id)
  }

  const now = new Date().toISOString()
  const upcoming = computed(() => meetings.value.filter((m) => (m.startsAt ?? '') >= now))
  const past = computed(() => meetings.value.filter((m) => (m.startsAt ?? '') < now))

  return { meetings, isLoading, fetch, create, update, remove, upcoming, past }
})
