import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BodyMeasurementOut, BodyMeasurementCreate } from '../types'
import * as api from '../services/bodyMeasurementsApi'

export const useBodyMeasurementStore = defineStore('bodyMeasurement', () => {
  const measurements = ref<BodyMeasurementOut[]>([])
  const isLoading = ref(false)

  async function fetch() {
    isLoading.value = true
    try {
      measurements.value = await api.listMeasurements()
    } finally {
      isLoading.value = false
    }
  }

  async function log(data: BodyMeasurementCreate) {
    const created = await api.logMeasurement(data)
    measurements.value.unshift(created)
    measurements.value.sort((a, b) => b.date.localeCompare(a.date))
    return created
  }

  async function remove(id: string) {
    await api.deleteMeasurement(id)
    measurements.value = measurements.value.filter(m => m.id !== id)
  }

  return { measurements, isLoading, fetch, log, remove }
})
