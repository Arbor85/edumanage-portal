<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePageTitle } from '../../../composables/usePageTitle'
import type { ClientOut, ClientCreate, ClientUpdate } from '../../../types'
import { useClientStore } from '../../../stores/clientStore'
import { useToast } from '../../../composables/useToast'
import BaseModal from '../../../components/BaseModal.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseButton from '../../../components/BaseButton.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'

const props = defineProps<{ open: boolean; client: ClientOut | null }>()
const emit = defineEmits<{ close: [] }>()

usePageTitle(() => props.client ? 'Edit Client' : 'New Client', () => props.open)

const clientStore = useClientStore()
const toast = useToast()

const form = ref({ name: '', email: '', note: '' })
const saving = ref(false)
const confirmDelete = ref(false)
const createdCode = ref<string | null>(null)
const copied = ref(false)

watch(() => props.open, (val) => {
  if (val) {
    createdCode.value = null
    copied.value = false
    if (props.client) {
      form.value = { name: props.client.name ?? '', email: props.client.email ?? '', note: props.client.note ?? '' }
    } else {
      form.value = { name: '', email: '', note: '' }
    }
  }
})

async function save() {
  saving.value = true
  try {
    if (props.client?.invitationCode) {
      await clientStore.update(props.client.invitationCode, form.value as ClientUpdate)
      toast.success('Client updated')
      emit('close')
    } else {
      const created = await clientStore.create(form.value as ClientCreate)
      if (created?.invitationCode) {
        createdCode.value = created.invitationCode
        toast.success('Client created')
      }
    }
  } catch {
    toast.error('Failed to save client')
  } finally {
    saving.value = false
  }
}

async function copyCode() {
  if (!createdCode.value) return
  await navigator.clipboard.writeText(createdCode.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

async function doDelete() {
  if (!props.client?.invitationCode) return
  try {
    await clientStore.remove(props.client.invitationCode)
    toast.success('Client removed')
    confirmDelete.value = false
    emit('close')
  } catch {
    toast.error('Failed to remove client')
  }
}
</script>

<template>
  <BaseModal :open="open" :title="client ? 'Edit Client' : 'New Client'" size="md" @close="emit('close')">
    <div v-if="createdCode" class="flex flex-col gap-3 items-center py-4">
      <p class="text-sm text-text-secondary">Share this invitation code with your client:</p>
      <code class="text-2xl font-mono font-bold tracking-widest text-primary bg-primary-light rounded-xl px-6 py-3">{{ createdCode }}</code>
      <BaseButton variant="primary" @click="copyCode">{{ copied ? '✓ Copied!' : 'Copy Code' }}</BaseButton>
      <BaseButton variant="ghost" @click="emit('close')">Done</BaseButton>
    </div>

    <form v-else class="flex flex-col gap-4" @submit.prevent="save">
      <BaseInput v-model="form.name" label="Name" placeholder="Client name" />
      <BaseInput v-model="form.email" label="Email" type="email" placeholder="client@email.com" />
      <BaseInput v-model="form.note" label="Notes" placeholder="Optional notes" />
    </form>

    <template #footer>
      <div v-if="!createdCode" class="flex items-center gap-2">
        <BaseButton v-if="client" variant="danger" @click="confirmDelete = true">Remove</BaseButton>
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">{{ client ? 'Save' : 'Invite' }}</BaseButton>
      </div>
    </template>
  </BaseModal>

  <ConfirmDialog
    :open="confirmDelete"
    title="Remove Client"
    message="Remove this client?"
    confirm-label="Remove"
    variant="danger"
    @confirm="doDelete"
    @cancel="confirmDelete = false"
  />
</template>
