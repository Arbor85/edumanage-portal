<template>
  <div class="w-full max-w-5xl pb-24">
    <div class="mb-5">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Clients</h1>
    </div>

    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput v-model="searchQuery" placeholder="Search by name, status or tag" />

      <div class="flex items-center gap-2 sm:shrink-0">
        <div class="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-600">
          <button
            type="button"
            @click="viewMode = 'tile'"
            class="px-3 py-1.5 text-xs font-medium"
            :class="viewMode === 'tile' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
          >
            Tile
          </button>
          <button
            type="button"
            @click="viewMode = 'list'"
            class="border-l border-slate-300 px-3 py-1.5 text-xs font-medium dark:border-slate-600"
            :class="viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
          >
            List
          </button>
        </div>

        <button
          type="button"
          @click="loadClients"
          :disabled="isLoading"
          aria-label="Refresh clients"
          title="Refresh clients"
          class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4" :class="isLoading ? 'animate-spin' : ''">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
        </button>
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="mb-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
    >
      {{ errorMessage }}
    </div>

    <NotificationToast
      v-model:open="notificationOpen"
      :title="notificationTitle"
      :message="notificationMessage"
    />

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="mb-3 flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-8 dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="inline-flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
        <svg class="h-5 w-5 animate-spin text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span>Loading clients...</span>
      </div>
    </div>

    <!-- Tile view -->
    <div v-else-if="viewMode === 'tile'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="client in filteredClients"
        :key="client.invitationCode"
        class="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="flex items-center gap-3">
          <img
            v-if="client.imageUrl"
            :src="client.imageUrl"
            :alt="client.name"
            class="h-10 w-10 rounded-full object-cover"
          />
          <span v-else class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
            <User :size="20" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-slate-900 dark:text-slate-100">{{ client.name }}</p>
            <span :class="statusClass(client.status)" class="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium">
              {{ client.status }}
            </span>
          </div>
        </div>

        <div v-if="client.tags.length > 0" class="flex flex-wrap gap-1">
          <span
            v-for="tag in client.tags"
            :key="tag"
            class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          >
            {{ tag }}
          </span>
        </div>

        <div class="flex justify-end gap-2">
          <button
            type="button"
            @click="requestDelete(client)"
            class="inline-flex items-center justify-center rounded-md border border-rose-300 bg-white p-2 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-700 dark:text-rose-300 dark:hover:bg-rose-900/30"
            aria-label="Delete client"
            title="Delete client"
          >
            <Trash2 :size="16" />
          </button>
          <button
            type="button"
            @click="openEditDialog(client)"
            class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            aria-label="Edit client"
            title="Edit client"
          >
            <Pencil :size="16" />
          </button>
          <button
            v-if="client.status === 'Invited'"
            type="button"
            @click="openInviteDialog(client)"
            class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            <Link :size="14" />
            Invitation
          </button>
        </div>
      </article>

      <div
        v-if="filteredClients.length === 0"
        class="sm:col-span-2 xl:col-span-3 rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        <p class="mb-2">No clients found.</p>
        <div class="flex items-center gap-2">
          <button type="button" @click="loadClients" class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
            Refresh
          </button>
          <button type="button" @click="openInviteDialog(null)" class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">
            Invite client
          </button>
        </div>
      </div>
    </div>

    <!-- List view -->
    <div
      v-else
      class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            <tr>
              <th class="px-4 py-3 font-semibold">Client</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 font-semibold">Tags</th>
              <th class="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="client in filteredClients"
              :key="client.invitationCode"
              class="border-t border-slate-200 dark:border-slate-700"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img v-if="client.imageUrl" :src="client.imageUrl" :alt="client.name" class="h-8 w-8 rounded-full object-cover" />
                  <span v-else class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    <User :size="16" />
                  </span>
                  <span class="font-medium text-slate-900 dark:text-slate-100">{{ client.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span :class="statusClass(client.status)" class="rounded-full px-2 py-0.5 text-[11px] font-medium">
                  {{ client.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in client.tags"
                    :key="tag"
                    class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    {{ tag }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    @click="requestDelete(client)"
                    class="inline-flex items-center justify-center rounded-md border border-rose-300 bg-white p-2 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-700 dark:text-rose-300 dark:hover:bg-rose-900/30"
                    aria-label="Delete client"
                    title="Delete client"
                  >
                    <Trash2 :size="16" />
                  </button>
                  <button
                    type="button"
                    @click="openEditDialog(client)"
                    class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                    aria-label="Edit client"
                    title="Edit client"
                  >
                    <Pencil :size="16" />
                  </button>
                  <button
                    v-if="client.status === 'Invited'"
                    type="button"
                    @click="openInviteDialog(client)"
                    class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  >
                    <Link :size="14" />
                    Invitation
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="filteredClients.length === 0"
        class="border-t border-slate-200 px-4 py-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
      >
        <p class="mb-2">No clients found.</p>
        <div class="flex items-center gap-2">
          <button type="button" @click="loadClients" class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
            Refresh
          </button>
          <button type="button" @click="openInviteDialog(null)" class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">
            Invite client
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom action bar -->
    <div class="fixed bottom-0 left-56 right-0 z-30 px-6 pb-3">
      <div class="mx-auto w-full max-w-5xl">
        <DialogActionPanel primary-label="Invite client" @primary-click="openInviteDialog(null)" />
      </div>
    </div>

    <InviteClientDialog
      :open="showInviteDialog"
      :client="inviteTarget"
      @cancel="closeInviteDialog"
      @invited="onClientInvited"
    />

    <EditClientDialog
      v-if="editTarget"
      :open="showEditDialog"
      :client="editTarget"
      @cancel="closeEditDialog"
      @saved="onClientSaved"
    />

    <ConfirmDialog
      :open="!!clientToDelete"
      title="Delete client"
      :message="clientToDelete ? `Are you sure you want to delete '${clientToDelete.name}'?` : ''"
      @confirm="deleteClient"
      @cancel="clientToDelete = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { Link, Pencil, Trash2, User } from 'lucide-vue-next'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import DialogActionPanel from '../../components/DialogActionPanel.vue'
import NotificationToast from '../../components/NotificationToast.vue'
import SearchInput from '../../components/SearchInput.vue'
import { useLocalStorageState } from '../../composables/useLocalStorageState'
import { usePageTitle } from '../../composables/usePageTitle'
import { useClientsApi } from '../../services/clientsApi'
import type { Client, ClientStatus } from '../../types/client'
import InviteClientDialog from './components/InviteClientDialog.vue'
import EditClientDialog from './components/EditClientDialog.vue'

usePageTitle('Clients')

const clientsApi = useClientsApi()

const clients = ref<Client[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const viewMode = useLocalStorageState<'tile' | 'list'>('clients:viewMode', 'tile')

const showInviteDialog = ref(false)
const inviteTarget = ref<Client | null>(null)
const clientToDelete = ref<Client | null>(null)
const showEditDialog = ref(false)
const editTarget = ref<Client | null>(null)
const notificationOpen = ref(false)
const notificationTitle = ref('')
const notificationMessage = ref('')

const filteredClients = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return clients.value
  return clients.value.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q)),
  )
})

const statusClass = (status: ClientStatus) => {
  if (status === 'Active') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  if (status === 'Suspended') return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
}

const openInviteDialog = (client: Client | null) => {
  inviteTarget.value = client
  showInviteDialog.value = true
}

const closeInviteDialog = () => {
  showInviteDialog.value = false
  inviteTarget.value = null
}

const showSuccessNotification = async (title: string, message: string) => {
  notificationTitle.value = title
  notificationMessage.value = message
  notificationOpen.value = false
  await nextTick()
  notificationOpen.value = true
}

const onClientInvited = async (client: Client) => {
  const existing = clients.value.findIndex((c) => c.invitationCode === client.invitationCode)
  if (existing !== -1) {
    clients.value[existing] = client
    await showSuccessNotification('Invitation refreshed', `A new invitation link for **${client.name}** is ready.`)
  } else {
    clients.value = [client, ...clients.value]
    await showSuccessNotification('Client added', `Client **${client.name}** was added successfully.`)
  }
}

const openEditDialog = (client: Client) => {
  editTarget.value = client
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editTarget.value = null
}

const onClientSaved = async (updated: Client) => {
  const idx = clients.value.findIndex((c) => c.invitationCode === updated.invitationCode)
  if (idx !== -1) clients.value[idx] = updated
  closeEditDialog()
  await showSuccessNotification('Client updated', `Changes for **${updated.name}** were saved successfully.`)
}

const requestDelete = (client: Client) => {
  clientToDelete.value = client
}

const deleteClient = async () => {
  if (!clientToDelete.value) return
  errorMessage.value = ''

  const deletedClient = clientToDelete.value

  try {
    await clientsApi.deleteClient(deletedClient.invitationCode)
    clients.value = clients.value.filter((c) => c.invitationCode !== deletedClient.invitationCode)
    clientToDelete.value = null
    await showSuccessNotification('Client deleted', `Client **${deletedClient.name}** was deleted successfully.`)
  } catch {
    errorMessage.value = 'Failed to delete client'
    clientToDelete.value = null
  }
}

const loadClients = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    clients.value = await clientsApi.listClients()
  } catch {
    errorMessage.value = 'Failed to load clients'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadClients)
</script>
