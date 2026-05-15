import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ClientOut, ClientCreate, ClientUpdate } from '../types'
import * as clientsApi from '../services/clientsApi'

export const useClientStore = defineStore('client', () => {
  const clients = ref<ClientOut[]>([])
  const isLoading = ref(false)

  async function fetch() {
    isLoading.value = true
    try {
      clients.value = await clientsApi.listClients()
    } finally {
      isLoading.value = false
    }
  }

  async function create(d: ClientCreate) {
    const created = await clientsApi.createClient(d)
    clients.value.push(created)
    return created
  }

  async function update(code: string, d: ClientUpdate) {
    const updated = await clientsApi.updateClient(code, d)
    const idx = clients.value.findIndex((c) => c.invitationCode === code)
    if (idx !== -1) clients.value[idx] = updated
    return updated
  }

  async function remove(code: string) {
    await clientsApi.deleteClient(code)
    clients.value = clients.value.filter((c) => c.invitationCode !== code)
  }

  const active = computed(() => clients.value.filter((c) => c.status === 'active'))
  const pending = computed(() => clients.value.filter((c) => c.status === 'pending'))

  return { clients, isLoading, fetch, create, update, remove, active, pending }
})
