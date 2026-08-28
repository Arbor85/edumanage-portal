import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  OrganizationOut,
  OrganizationCreate,
  OrganizationMemberOut,
  AvailabilityCreate,
  AvailabilityOut,
  TrainerCourseAssociationCreate,
  TrainerCourseAssociationOut,
} from '../types'
import * as api from '../services/organizerApi'

export const useOrganizerStore = defineStore('organizer', () => {
  const org = ref<OrganizationOut | null>(null)
  const trainers = ref<OrganizationMemberOut[]>([])
  const trainerAvailabilities = ref<Record<string, AvailabilityOut[]>>({})
  const trainerCourses = ref<TrainerCourseAssociationOut[]>([])
  const isLoading = ref(false)

  async function fetchOrg() {
    isLoading.value = true
    try {
      org.value = await api.getMyOrganization()
    } finally {
      isLoading.value = false
    }
  }

  async function createOrg(d: OrganizationCreate) {
    org.value = await api.createOrganization(d)
    return org.value
  }

  async function generateInvite() {
    org.value = await api.generateInvite()
    return org.value
  }

  async function fetchTrainers() {
    trainers.value = await api.listTrainers()
  }

  async function removeTrainer(trainerId: string) {
    await api.removeTrainer(trainerId)
    trainers.value = trainers.value.filter((t) => t.trainerUserId !== trainerId)
  }

  async function fetchTrainerAvailability(trainerId: string) {
    const items = await api.listTrainerAvailability(trainerId)
    trainerAvailabilities.value[trainerId] = items
  }

  async function addTrainerAvailability(trainerId: string, d: AvailabilityCreate) {
    const created = await api.addTrainerAvailability(trainerId, d)
    if (!trainerAvailabilities.value[trainerId]) trainerAvailabilities.value[trainerId] = []
    trainerAvailabilities.value[trainerId].push(created)
  }

  async function updateTrainerAvailability(trainerId: string, id: string, d: AvailabilityCreate) {
    const updated = await api.updateTrainerAvailability(trainerId, id, d)
    const list = trainerAvailabilities.value[trainerId] ?? []
    const idx = list.findIndex((a) => a.id === id)
    if (idx !== -1) list[idx] = updated
  }

  async function deleteTrainerAvailability(trainerId: string, id: string) {
    await api.deleteTrainerAvailability(trainerId, id)
    if (trainerAvailabilities.value[trainerId]) {
      trainerAvailabilities.value[trainerId] = trainerAvailabilities.value[trainerId].filter((a) => a.id !== id)
    }
  }

  async function fetchTrainerCourses() {
    trainerCourses.value = await api.listTrainerCourses()
  }

  async function addTrainerCourse(d: TrainerCourseAssociationCreate) {
    const created = await api.addTrainerCourse(d)
    trainerCourses.value.push(created)
  }

  async function deleteTrainerCourse(id: string) {
    await api.deleteTrainerCourse(id)
    trainerCourses.value = trainerCourses.value.filter((a) => a.id !== id)
  }

  return {
    org, trainers, trainerAvailabilities, trainerCourses, isLoading,
    fetchOrg, createOrg, generateInvite,
    fetchTrainers, removeTrainer,
    fetchTrainerAvailability, addTrainerAvailability, updateTrainerAvailability, deleteTrainerAvailability,
    fetchTrainerCourses, addTrainerCourse, deleteTrainerCourse,
  }
})
