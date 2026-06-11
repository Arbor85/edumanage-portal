import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EquipmentOut, EquipmentCreate, EquipmentUpdate, UserEquipmentOut, UserEquipmentSave } from '../types'
import * as equipmentApi from '../services/equipmentApi'

export const useEquipmentStore = defineStore('equipment', () => {
  const equipment = ref<EquipmentOut[]>([])
  const userEquipment = ref<UserEquipmentOut[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)

  async function fetch() {
    isLoading.value = true
    try {
      ;[equipment.value, userEquipment.value] = await Promise.all([
        equipmentApi.listEquipment(),
        equipmentApi.getUserEquipment(),
      ])
    } finally {
      isLoading.value = false
    }
  }

  async function create(d: EquipmentCreate) {
    const created = await equipmentApi.createEquipment(d)
    equipment.value.push(created)
    return created
  }

  async function update(id: string, d: EquipmentUpdate) {
    const updated = await equipmentApi.updateEquipment(id, d)
    const idx = equipment.value.findIndex((e) => e.id === id)
    if (idx !== -1) equipment.value[idx] = updated
    return updated
  }

  async function remove(id: string) {
    await equipmentApi.deleteEquipment(id)
    equipment.value = equipment.value.filter((e) => e.id !== id)
    userEquipment.value = userEquipment.value.filter((e) => e.equipmentId !== id)
  }

  async function saveUserEquipment(items: UserEquipmentSave[]) {
    isSaving.value = true
    try {
      userEquipment.value = await equipmentApi.saveUserEquipment({ equipment: items })
    } finally {
      isSaving.value = false
    }
  }

  const userEquipmentMap = computed(() =>
    new Map(userEquipment.value.map((e) => [e.equipmentId, e]))
  )

  return {
    equipment, userEquipment, userEquipmentMap,
    isLoading, isSaving,
    fetch, create, update, remove, saveUserEquipment,
  }
})
