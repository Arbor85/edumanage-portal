import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  BuildingCreate,
  BuildingUpdate,
  BuildingOut,
  BuildingAvailabilityCreate,
  BuildingAvailabilityOut,
  SchedulePlanCreate,
  SchedulePlanUpdate,
  SchedulePlanOut,
  ScheduleEntryCreate,
  ScheduleEntryOut,
  AutoScheduleRequest,
  AutoScheduleResult,
} from '../types'
import * as api from '../services/schedulePlanApi'

export const useSchedulePlanStore = defineStore('schedulePlan', () => {
  const buildings = ref<BuildingOut[]>([])
  const buildingAvailabilities = ref<Record<string, BuildingAvailabilityOut[]>>({})
  const plans = ref<SchedulePlanOut[]>([])
  const entries = ref<ScheduleEntryOut[]>([])
  const autoScheduleProposal = ref<AutoScheduleResult | null>(null)
  const isLoading = ref(false)

  async function fetchBuildings() {
    buildings.value = await api.listBuildings()
  }

  async function addBuilding(d: BuildingCreate) {
    const created = await api.addBuilding(d)
    buildings.value.push(created)
    return created
  }

  async function updateBuilding(id: string, d: BuildingUpdate) {
    const updated = await api.updateBuilding(id, d)
    const idx = buildings.value.findIndex((b) => b.id === id)
    if (idx !== -1) buildings.value[idx] = updated
    return updated
  }

  async function removeBuilding(id: string) {
    await api.deleteBuilding(id)
    buildings.value = buildings.value.filter((b) => b.id !== id)
  }

  async function fetchBuildingAvailability(buildingId: string) {
    buildingAvailabilities.value[buildingId] = await api.listBuildingAvailability(buildingId)
  }

  async function addBuildingAvailability(buildingId: string, d: BuildingAvailabilityCreate) {
    const created = await api.addBuildingAvailability(buildingId, d)
    if (!buildingAvailabilities.value[buildingId]) buildingAvailabilities.value[buildingId] = []
    buildingAvailabilities.value[buildingId].push(created)
  }

  async function updateBuildingAvailability(buildingId: string, id: string, d: BuildingAvailabilityCreate) {
    const updated = await api.updateBuildingAvailability(buildingId, id, d)
    const list = buildingAvailabilities.value[buildingId] ?? []
    const idx = list.findIndex((a) => a.id === id)
    if (idx !== -1) list[idx] = updated
  }

  async function deleteBuildingAvailability(buildingId: string, id: string) {
    await api.deleteBuildingAvailability(buildingId, id)
    if (buildingAvailabilities.value[buildingId]) {
      buildingAvailabilities.value[buildingId] = buildingAvailabilities.value[buildingId].filter((a) => a.id !== id)
    }
  }

  async function fetchPlans() {
    isLoading.value = true
    try {
      plans.value = await api.listSchedulePlans()
    } finally {
      isLoading.value = false
    }
  }

  async function createPlan(d: SchedulePlanCreate) {
    const created = await api.createSchedulePlan(d)
    plans.value.push(created)
    return created
  }

  async function updatePlan(id: string, d: SchedulePlanUpdate) {
    const updated = await api.updateSchedulePlan(id, d)
    const idx = plans.value.findIndex((p) => p.id === id)
    if (idx !== -1) plans.value[idx] = updated
    return updated
  }

  async function removePlan(id: string) {
    await api.deleteSchedulePlan(id)
    plans.value = plans.value.filter((p) => p.id !== id)
  }

  async function publishPlan(id: string) {
    const updated = await api.publishSchedulePlan(id)
    const idx = plans.value.findIndex((p) => p.id === id)
    if (idx !== -1) plans.value[idx] = updated
    return updated
  }

  async function unpublishPlan(id: string) {
    const updated = await api.unpublishSchedulePlan(id)
    const idx = plans.value.findIndex((p) => p.id === id)
    if (idx !== -1) plans.value[idx] = updated
    return updated
  }

  async function fetchEntries(planId: string) {
    entries.value = await api.listScheduleEntries(planId)
  }

  async function addEntry(planId: string, d: ScheduleEntryCreate) {
    const created = await api.addScheduleEntry(planId, d)
    entries.value.push(created)
    return created
  }

  async function updateEntry(planId: string, entryId: string, d: ScheduleEntryCreate) {
    const updated = await api.updateScheduleEntry(planId, entryId, d)
    const idx = entries.value.findIndex((e) => e.id === entryId)
    if (idx !== -1) entries.value[idx] = updated
    return updated
  }

  async function removeEntry(planId: string, entryId: string) {
    await api.deleteScheduleEntry(planId, entryId)
    entries.value = entries.value.filter((e) => e.id !== entryId)
  }

  async function runAutoSchedule(planId: string, d: AutoScheduleRequest) {
    autoScheduleProposal.value = await api.autoSchedule(planId, d)
    return autoScheduleProposal.value
  }

  async function confirmAutoSchedule(planId: string) {
    if (!autoScheduleProposal.value) return
    const payload = autoScheduleProposal.value.scheduled.map((e) => ({
      trainerUserId: e.trainerUserId,
      buildingId: e.buildingId,
      courseId: e.courseId,
      isRecurring: e.isRecurring,
      daysOfWeek: e.daysOfWeek,
      validFrom: e.validFrom,
      validTo: e.validTo,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
    }))
    entries.value = await api.confirmAutoSchedule(planId, { entries: payload })
    autoScheduleProposal.value = null
  }

  return {
    buildings, buildingAvailabilities, plans, entries, autoScheduleProposal, isLoading,
    fetchBuildings, addBuilding, updateBuilding, removeBuilding,
    fetchBuildingAvailability, addBuildingAvailability, updateBuildingAvailability, deleteBuildingAvailability,
    fetchPlans, createPlan, updatePlan, removePlan, publishPlan, unpublishPlan,
    fetchEntries, addEntry, updateEntry, removeEntry,
    runAutoSchedule, confirmAutoSchedule,
  }
})
