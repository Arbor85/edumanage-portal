<template>
  <div class="w-full max-w-5xl pb-24">
    <div class="mb-5">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Clients</h1>
    </div>

    <div v-if="!isAuthenticated" class="rounded-md border border-slate-300 bg-white p-4 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
      This page is available only for logged in users.
    </div>

    <div v-else class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        v-model.trim="searchQuery"
        type="text"
        placeholder="Search by name, status or tag"
        class="w-full sm:flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
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
    </div>

    <div v-if="isAuthenticated">
      <div v-if="viewMode === 'tile'" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="client in filteredClients"
          :key="client.invitationCode"
          class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div class="mb-3 flex items-center gap-3">
            <img
              :src="client.imageUrl"
              :alt="`${client.name} image`"
              class="h-12 w-12 rounded-full object-cover border border-slate-200 dark:border-slate-600"
            />
            <div>
              <div class="flex items-center gap-2">
                <p class="font-semibold text-slate-900 dark:text-slate-100">{{ client.name }}</p>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  :class="getStatusBadgeClass(client.status)"
                >
                  {{ client.status }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in client.tags"
              :key="`${client.invitationCode}-${tag}`"
              class="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200"
            >
              {{ tag }}
            </span>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              @click="openEditDialog(client)"
              class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            >
              Edit
            </button>
          </div>
        </article>

        <div
          v-if="filteredClients.length === 0"
          class="md:col-span-2 lg:col-span-3 rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          No clients found for "{{ searchQuery }}".
        </div>
      </div>

      <div v-else class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              <tr>
                <th class="px-4 py-3 font-semibold">Client</th>
                <th class="px-4 py-3 font-semibold">Tags</th>
                <th class="px-4 py-3 font-semibold">Status</th>
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
                    <img
                      :src="client.imageUrl"
                      :alt="`${client.name} image`"
                      class="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                    />
                    <p class="font-medium text-slate-900 dark:text-slate-100">{{ client.name }}</p>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="tag in client.tags"
                      :key="`${client.invitationCode}-${tag}`"
                      class="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="rounded-full px-2 py-0.5 text-[10px] font-medium" :class="getStatusBadgeClass(client.status)">
                    {{ client.status }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    type="button"
                    @click="openEditDialog(client)"
                    class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="filteredClients.length === 0"
          class="border-t border-slate-200 px-4 py-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
        >
          No clients found for "{{ searchQuery }}".
        </div>
      </div>

      <div class="fixed bottom-0 left-56 right-0 z-30 px-6 pb-3">
        <div class="mx-auto w-full max-w-5xl">
          <DialogActionPanel
            primary-label="Create invitation"
            @primary-click="openDialog"
          />
        </div>
      </div>
    </div>

    <div
      v-if="showDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {{ dialogMode === 'edit' ? 'Edit client' : 'Create invitation' }}
          </h2>
          <button
            type="button"
            @click="closeDialog"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div class="space-y-4">
          <template v-if="dialogMode === 'edit' || !generatedInvitationUrl">
          <div>
            <label for="client-name" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
            <input
              id="client-name"
              v-model.trim="formName"
              type="text"
              class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Client name"
            />
          </div>

          <div>
            <p class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Tags</p>
            <div class="flex flex-wrap items-center gap-2">
              <div v-for="group in tagGroups" :key="group.name">
                <div class="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-600">
                  <button
                    v-for="tag in group.tags"
                    :key="tag"
                    type="button"
                    @click="toggleTag(tag)"
                    class="px-3 py-1 text-xs font-medium transition border-r border-slate-300 last:border-r-0 dark:border-slate-600"
                    :class="formTags.includes(tag)
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'"
                  >
                    {{ tag }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <DialogActionPanel
            :primary-label="dialogMode === 'edit' ? 'Save changes' : 'Create invitation'"
            :primary-disabled="!canCreate"
            :secondary-label="secondaryActionLabel"
            :secondary-variant="secondaryActionVariant"
            @primary-click="submitDialog"
            @secondary-click="runSecondaryDialogAction"
          />
          </template>

          <div v-if="generatedInvitationUrl" class="rounded-md border border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-700 dark:bg-emerald-900/30">
            <div class="mb-2 flex items-center justify-between gap-2">
              <p class="text-sm font-medium text-emerald-800 dark:text-emerald-300">Invitation URL</p>
              <button
                type="button"
                @click="copyInvitationUrl"
                class="inline-flex items-center rounded-md border border-emerald-400 bg-white px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
              >
                {{ isInvitationUrlCopied ? 'Copied' : 'Copy URL' }}
              </button>
            </div>
            <p class="break-all text-sm text-emerald-900 dark:text-emerald-200">{{ generatedInvitationUrl }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import type { Client, ClientStatus, ClientTag } from '../types/client'
import DialogActionPanel from '../components/DialogActionPanel.vue'
import { usePageTitle } from '../composables/usePageTitle'

usePageTitle('Clients')

const { isAuthenticated } = useAuth0()

const tagGroups: Array<{ name: string; tags: ClientTag[] }> = [
  { name: 'Session Type', tags: ['Online', 'Inperson', 'Group'] },
  { name: 'Gender', tags: ['Female', 'Male'] },
  { name: 'Training', tags: ['Gym', 'CrossFit', 'Mix'] },
]

const clients = ref<Client[]>([
  {
    name: 'Alex Turner',
    tags: ['Online', 'Male', 'Gym'],
    imageUrl: 'https://i.pravatar.cc/160?img=11',
    status: 'Active',
    invitationCode: 'ALEX-4F9K2P',
  },
  {
    name: 'Marta Lewis',
    tags: ['Inperson', 'Female', 'CrossFit'],
    imageUrl: 'https://i.pravatar.cc/160?img=32',
    status: 'Pending',
    invitationCode: 'MARTA-2J7VQX',
  },
])
const searchQuery = ref('')
const viewMode = ref<'tile' | 'list'>('tile')

const showDialog = ref(false)
const formName = ref('')
const defaultFormTags: ClientTag[] = ['Inperson', 'Gym']
const formTags = ref<ClientTag[]>([...defaultFormTags])
const generatedInvitationUrl = ref('')
const isInvitationUrlCopied = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingClientCode = ref<string | null>(null)

const canCreate = computed(() => formName.value.length > 0)

const secondaryActionLabel = computed(() => {
  if (dialogMode.value !== 'edit' || !editingClient.value) {
    return ''
  }

  if (editingClient.value.status === 'Active') {
    return 'Suspend'
  }

  if (editingClient.value.status === 'Suspended') {
    return 'Resume'
  }

  return ''
})

const secondaryActionVariant = computed<'default' | 'success' | 'danger'>(() => {
  if (secondaryActionLabel.value === 'Suspend') {
    return 'danger'
  }

  if (secondaryActionLabel.value === 'Resume') {
    return 'success'
  }

  return 'default'
})

const editingClient = computed(() => {
  if (!editingClientCode.value) {
    return null
  }

  return clients.value.find((client) => client.invitationCode === editingClientCode.value) || null
})

const filteredClients = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()

  if (!normalizedQuery) {
    return clients.value
  }

  return clients.value.filter((client) => {
    const tagsText = client.tags.join(' ').toLowerCase()

    return (
      client.name.toLowerCase().includes(normalizedQuery) ||
      client.invitationCode.toLowerCase().includes(normalizedQuery) ||
      client.status.toLowerCase().includes(normalizedQuery) ||
      tagsText.includes(normalizedQuery)
    )
  })
})

const toggleTag = (tag: ClientTag) => {
  const group = tagGroups.find(currentGroup => currentGroup.tags.includes(tag))

  if (!group) {
    return
  }

  if (formTags.value.includes(tag)) {
    formTags.value = formTags.value.filter(item => item !== tag)
    return
  }

  const selectedFromOtherGroups = formTags.value.filter(item => !group.tags.includes(item))
  formTags.value = [...selectedFromOtherGroups, tag]
}

const openDialog = () => {
  dialogMode.value = 'create'
  editingClientCode.value = null
  showDialog.value = true
}

const openEditDialog = (client: Client) => {
  dialogMode.value = 'edit'
  editingClientCode.value = client.invitationCode
  showDialog.value = true
  formName.value = client.name
  formTags.value = [...client.tags]
  generatedInvitationUrl.value = `${window.location.origin}/invite/${client.invitationCode}`
  isInvitationUrlCopied.value = false
}

const closeDialog = () => {
  showDialog.value = false
  formName.value = ''
  formTags.value = [...defaultFormTags]
  generatedInvitationUrl.value = ''
  isInvitationUrlCopied.value = false
  dialogMode.value = 'create'
  editingClientCode.value = null
}

const generateInvitationCode = () => {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  const namePrefix = formName.value.replace(/\s+/g, '').slice(0, 5).toUpperCase() || 'CLNT'
  return `${namePrefix}-${random}`
}

const createInvitation = () => {
  if (!canCreate.value) {
    return
  }

  const invitationCode = generateInvitationCode()
  generatedInvitationUrl.value = `${window.location.origin}/invite/${invitationCode}`

  const newClient: Client = {
    name: formName.value,
    tags: [...formTags.value],
    imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formName.value)}&background=E2E8F0&color=0F172A`,
    status: 'Pending',
    invitationCode,
  }

  clients.value = [newClient, ...clients.value]
}

const saveClientChanges = () => {
  if (!canCreate.value || !editingClientCode.value) {
    return
  }

  clients.value = clients.value.map((client) => {
    if (client.invitationCode !== editingClientCode.value) {
      return client
    }

    return {
      ...client,
      name: formName.value,
      tags: [...formTags.value],
      imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formName.value)}&background=E2E8F0&color=0F172A`,
    }
  })
}

const submitDialog = () => {
  if (dialogMode.value === 'edit') {
    saveClientChanges()
    closeDialog()
    return
  }

  createInvitation()
}

const runSecondaryDialogAction = () => {
  if (secondaryActionLabel.value === 'Suspend') {
    toggleEditingClientProgress('Suspended')
    return
  }

  if (secondaryActionLabel.value === 'Resume') {
    toggleEditingClientProgress('Active')
  }
}

const updateClientProgressStatus = (
  invitationCode: string,
  nextStatus: Extract<ClientStatus, 'Active' | 'Suspended'>,
) => {
  clients.value = clients.value.map((client) => {
    if (client.invitationCode !== invitationCode) {
      return client
    }

    const canSuspend = client.status === 'Active' && nextStatus === 'Suspended'
    const canResume = client.status === 'Suspended' && nextStatus === 'Active'

    if (!canSuspend && !canResume) {
      return client
    }

    return {
      ...client,
      status: nextStatus,
    }
  })
}

const toggleEditingClientProgress = (nextStatus: Extract<ClientStatus, 'Active' | 'Suspended'>) => {
  if (!editingClientCode.value) {
    return
  }

  updateClientProgressStatus(editingClientCode.value, nextStatus)
}

const copyInvitationUrl = async () => {
  if (!generatedInvitationUrl.value) {
    return
  }

  await navigator.clipboard.writeText(generatedInvitationUrl.value)
  isInvitationUrlCopied.value = true
  window.setTimeout(() => {
    isInvitationUrlCopied.value = false
  }, 1500)
}

const getStatusBadgeClass = (status: ClientStatus) => {
  if (status === 'Active') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  }

  if (status === 'Pending') {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
  }

  return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
}
</script>
