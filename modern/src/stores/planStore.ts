import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PlanOut, PlanCreate, PlanUpdate } from '../types'
import * as plansApi from '../services/plansApi'

export const usePlanStore = defineStore('plan', () => {
  const plans = ref<PlanOut[]>([])
  const isLoading = ref(false)

  async function fetch() {
    isLoading.value = true
    try {
      plans.value = await plansApi.listPlans()
    } finally {
      isLoading.value = false
    }
  }

  async function get(id: string) {
    return plansApi.getPlan(id)
  }

  async function create(d: PlanCreate) {
    const created = await plansApi.createPlan(d)
    plans.value.push(created)
    return created
  }

  async function update(id: string, d: PlanUpdate) {
    const updated = await plansApi.updatePlan(id, d)
    const idx = plans.value.findIndex((p) => p.id === id)
    if (idx !== -1) plans.value[idx] = updated
    return updated
  }

  async function remove(id: string) {
    await plansApi.deletePlan(id)
    plans.value = plans.value.filter((p) => p.id !== id)
  }

  async function updateStatus(id: string, status: string) {
    const updated = await plansApi.updatePlanStatus(id, status)
    const idx = plans.value.findIndex((p) => p.id === id)
    if (idx !== -1) plans.value[idx] = updated
    return updated
  }

  const byStatus = computed(() => (status: string) =>
    plans.value.filter((p) => p.status === status)
  )

  return { plans, isLoading, fetch, get, create, update, remove, updateStatus, byStatus }
})
