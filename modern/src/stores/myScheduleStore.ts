import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ScheduleEntryOut } from '../types'
import { getMySchedule } from '../services/myScheduleApi'

export const useMyScheduleStore = defineStore('mySchedule', () => {
  const entries = ref<ScheduleEntryOut[]>([])
  const isLoading = ref(false)

  async function fetch() {
    isLoading.value = true
    try {
      entries.value = await getMySchedule()
    } finally {
      isLoading.value = false
    }
  }

  return { entries, isLoading, fetch }
})
