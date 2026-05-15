<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ClientOut } from '../types'
import { useClientStore } from '../stores/clientStore'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import ListSearchBar from '../components/ListSearchBar.vue'
import BaseButton from '../components/BaseButton.vue'
import ViewToggle from '../components/ViewToggle.vue'
import ClientList from './ClientsPage/components/ClientList.vue'
import ClientKanban from './ClientsPage/components/ClientKanban.vue'
import ClientFormModal from './ClientsPage/components/ClientFormModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useToast } from '../composables/useToast'

const clientStore = useClientStore()
const toast = useToast()

const search = ref('')
const view = ref<'list' | 'kanban'>('list')
const isCreateOpen = ref(false)
const editTarget = ref<ClientOut | null>(null)
const deleteTarget = ref<ClientOut | null>(null)

onMounted(() => clientStore.fetch())

const filtered = computed(() =>
  clientStore.clients.filter((c) =>
    !search.value || c.name?.toLowerCase().includes(search.value.toLowerCase()) || c.email?.toLowerCase().includes(search.value.toLowerCase())
  )
)

async function handleDelete() {
  if (!deleteTarget.value?.invitationCode) return
  try {
    await clientStore.remove(deleteTarget.value.invitationCode)
    toast.success('Client removed')
    deleteTarget.value = null
  } catch {
    toast.error('Failed to remove client')
  }
}
</script>

<template>
  <AppLayout>
    <PageHeader title="Clients" subtitle="Manage your training clients.">
      <BaseButton variant="primary" @click="isCreateOpen = true">+ Invite Client</BaseButton>
    </PageHeader>

    <div class="mb-4 flex items-center gap-3">
      <div class="flex-1">
        <ListSearchBar v-model="search" placeholder="Search clients..." :loading="clientStore.isLoading" @refresh="clientStore.fetch()" />
      </div>
      <ViewToggle
        v-model="view"
        :options="[{ value: 'list', label: 'List' }, { value: 'kanban', label: 'Kanban' }]"
        storage-key="clients-view"
      />
    </div>

    <ClientList v-if="view === 'list'" :clients="filtered" :loading="clientStore.isLoading" @edit="editTarget = $event" />
    <ClientKanban v-else :clients="filtered" :loading="clientStore.isLoading" @edit="editTarget = $event" @delete="deleteTarget = $event" />

    <ClientFormModal
      :open="isCreateOpen || editTarget !== null"
      :client="editTarget"
      @close="isCreateOpen = false; editTarget = null"
    />

    <ConfirmDialog
      :open="deleteTarget !== null"
      title="Remove Client"
      message="Remove this client?"
      confirm-label="Remove"
      variant="danger"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />
  </AppLayout>
</template>
