<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePageTitle } from '../../../composables/usePageTitle'
import type { ClientOut, ClientCreate, ClientUpdate } from '../../../types'
import { useClientStore } from '../../../stores/clientStore'
import { useToast } from '../../../composables/useToast'
import BaseModal from '../../../components/BaseModal.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseButton from '../../../components/BaseButton.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import { X } from 'lucide-vue-next'
import QRCode from 'qrcode'

const props = defineProps<{ open: boolean; client: ClientOut | null }>()
const emit = defineEmits<{ close: [] }>()

usePageTitle(() => props.client ? 'Edit Client' : 'New Client', () => props.open)

const clientStore = useClientStore()
const toast = useToast()

const form = ref<{ name: string; tags: string[] }>({ name: '', tags: [] })
const tagInput = ref('')
const saving = ref(false)
const confirmDelete = ref(false)
// Set after a fresh create — triggers the full-screen invite panel
const createdCode = ref<string | null>(null)
const copied = ref(false)

// The invite code to display: freshly created OR existing invited client
const inviteCode = computed(() => {
  if (createdCode.value) return createdCode.value
  if (props.client?.status === 'Invited' && props.client.invitationCode) return props.client.invitationCode
  return null
})

const joinUrl = computed(() =>
  inviteCode.value ? `${window.location.origin}/join/${inviteCode.value}` : '',
)

const qrDataUrl = ref<string | null>(null)
watch(inviteCode, async (code) => {
  qrDataUrl.value = code
    ? await QRCode.toDataURL(`${window.location.origin}/join/${code}`, { width: 192, margin: 1 })
    : null
}, { immediate: true })

watch(() => props.open, (val) => {
  if (val) {
    createdCode.value = null
    copied.value = false
    tagInput.value = ''
    form.value = props.client
      ? { name: props.client.name ?? '', tags: [...(props.client.tags ?? [])] }
      : { name: '', tags: [] }
  }
})

function commitTag() {
  const tag = tagInput.value.trim().replace(/,+$/, '')
  if (tag && !form.value.tags.includes(tag)) form.value.tags.push(tag)
  tagInput.value = ''
}

function onTagKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    commitTag()
  } else if (e.key === 'Backspace' && !tagInput.value && form.value.tags.length) {
    form.value.tags.pop()
  }
}

function removeTag(i: number) {
  form.value.tags.splice(i, 1)
}

async function save() {
  commitTag()
  saving.value = true
  try {
    const payload = { name: form.value.name || null, tags: form.value.tags.length ? form.value.tags : null }
    if (props.client?.invitationCode) {
      await clientStore.update(props.client.invitationCode, payload as ClientUpdate)
      toast.success('Client updated')
      emit('close')
    } else {
      const created = await clientStore.create(payload as ClientCreate)
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

async function copyLink() {
  if (!joinUrl.value) return
  await navigator.clipboard.writeText(joinUrl.value)
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

    <!-- Post-create: full-screen invite panel -->
    <div v-if="createdCode" class="flex flex-col gap-4 items-center py-2">
      <p class="text-sm text-text-secondary">Share this invitation with your client:</p>
      <img v-if="qrDataUrl" :src="qrDataUrl" alt="Invitation QR code"
        class="w-48 h-48 rounded-xl border border-gray-100 dark:border-white/10" />
      <code class="text-2xl font-mono font-bold tracking-widest text-primary bg-primary/10 rounded-xl px-6 py-3">
        {{ createdCode }}
      </code>
      <p class="text-xs text-text-secondary break-all text-center">{{ joinUrl }}</p>
      <div class="flex gap-2">
        <BaseButton variant="primary" @click="copyLink">{{ copied ? '✓ Copied!' : 'Copy Link' }}</BaseButton>
        <BaseButton variant="ghost" @click="emit('close')">Done</BaseButton>
      </div>
    </div>

    <!-- Form (create or edit) -->
    <form v-else class="flex flex-col gap-4" @submit.prevent="save">
      <BaseInput v-model="form.name" label="Name" placeholder="Client name" />

      <!-- Tags -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-text-primary dark:text-white">Tags</label>
        <div
          class="flex flex-wrap gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark focus-within:ring-2 focus-within:ring-primary min-h-[42px] cursor-text"
          @click="($refs.tagInputEl as HTMLInputElement)?.focus()">
          <span v-for="(tag, i) in form.tags" :key="tag"
            class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
            {{ tag }}
            <button type="button" class="hover:text-primary/60" @click.stop="removeTag(i)">
              <X class="w-3 h-3" />
            </button>
          </span>
          <input ref="tagInputEl" v-model="tagInput" type="text" placeholder="Add tag…"
            class="flex-1 min-w-[80px] bg-transparent outline-none text-sm text-text-primary dark:text-white placeholder:text-text-secondary"
            @keydown="onTagKeydown" @blur="commitTag" />
        </div>
        <p class="text-xs text-text-secondary">Press Enter or comma to add a tag</p>
      </div>

      <!-- Profile — read-only, shown when client has filled in their details -->
      <div v-if="client && (client.firstName || client.lastName || client.email || client.gender)"
        class="flex flex-col gap-3 pt-2 border-t border-gray-100 dark:border-white/10">
        <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Profile</p>
        <div class="grid grid-cols-2 gap-x-4 gap-y-2">
          <div v-if="client.firstName" class="flex flex-col gap-0.5">
            <span class="text-xs text-text-secondary">First name</span>
            <span class="text-sm text-text-primary dark:text-white">{{ client.firstName }}</span>
          </div>
          <div v-if="client.lastName" class="flex flex-col gap-0.5">
            <span class="text-xs text-text-secondary">Last name</span>
            <span class="text-sm text-text-primary dark:text-white">{{ client.lastName }}</span>
          </div>
          <div v-if="client.email" class="flex flex-col gap-0.5 col-span-2">
            <span class="text-xs text-text-secondary">Email</span>
            <span class="text-sm text-text-primary dark:text-white">{{ client.email }}</span>
          </div>
          <div v-if="client.gender" class="flex flex-col gap-0.5">
            <span class="text-xs text-text-secondary">Gender</span>
            <span class="text-sm text-text-primary dark:text-white capitalize">{{ client.gender }}</span>
          </div>
        </div>
      </div>

      <!-- Invite section — edit mode, invited status only -->
      <div v-if="inviteCode" class="flex flex-col gap-3 items-center pt-2 border-t border-gray-100 dark:border-white/10">
        <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary self-start">Invitation</p>
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="Invitation QR code"
          class="w-40 h-40 rounded-xl border border-gray-100 dark:border-white/10" />
        <p class="text-xs text-text-secondary break-all text-center">{{ joinUrl }}</p>
        <BaseButton variant="ghost" size="sm" @click.prevent="copyLink">
          {{ copied ? '✓ Copied!' : 'Copy Link' }}
        </BaseButton>
      </div>
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
