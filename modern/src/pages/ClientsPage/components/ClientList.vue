<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ClientOut } from '../../../types'
import { useClientStore } from '../../../stores/clientStore'
import { useToast } from '../../../composables/useToast'
import SkeletonBlock from '../../../components/SkeletonBlock.vue'
import EmptyState from '../../../components/EmptyState.vue'
import BaseBadge from '../../../components/BaseBadge.vue'
import BaseButton from '../../../components/BaseButton.vue'
import PaginationBar from '../../../components/PaginationBar.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import NudgeButton from '../../../components/NudgeButton.vue'
import { Pencil, Trash2, User } from 'lucide-vue-next'

const props = defineProps<{ clients: ClientOut[]; loading: boolean }>()
const emit = defineEmits<{ edit: [c: ClientOut] }>()

const clientStore = useClientStore()
const router = useRouter()
const toast = useToast()

function initials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
}

function ringClass(client: ClientOut): string {
  return client.status === 'Active'
    ? 'ring-2 ring-primary/50'
    : 'ring-2 ring-amber-400/50'
}

const page = ref(1)
const PAGE_SIZE = 20
const deleteTarget = ref<ClientOut | null>(null)
const copiedCode = ref<string | null>(null)

const paginated = computed(() =>
  props.clients.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)

async function copyLink(code: string) {
  await navigator.clipboard.writeText(`${window.location.origin}/join/${code}`)
  copiedCode.value = code
  setTimeout(() => { copiedCode.value = null }, 2000)
}

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
  <div>
    <div v-if="loading" class="flex flex-col gap-3">
      <SkeletonBlock v-for="i in 5" :key="i" height="4rem" />
    </div>

    <EmptyState v-else-if="!clients.length" :icon="User" title="No clients yet" description="Invite your first client." />

    <div v-else class="flex flex-col gap-3 custom-scrollbar">
      <div
        v-for="client in paginated"
        :key="client.invitationCode ?? ''"
        class="bg-surface-card border border-white/5 rounded-2xl p-4 flex items-center gap-4
               hover:border-white/10 hover:-translate-y-0.5 hover:shadow-lg
               cursor-pointer transition-all active:scale-[0.99]"
        @click="router.push(`/coach/clients/${client.invitationCode}`)"
      >
        <!-- Avatar with engagement ring -->
        <div
          class="w-11 h-11 rounded-full flex items-center justify-center
                 bg-primary/20 text-primary font-bold flex-shrink-0"
          :class="ringClass(client)"
        >
          {{ initials(client.name) }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="font-bold text-white">{{ client.name }}</p>
            <BaseBadge :label="client.status ?? 'Invited'" :variant="client.status === 'Active' ? 'success' : 'warning'" />
          </div>
          <p v-if="client.firstName || client.lastName || client.email" class="text-xs text-text-secondary mt-0.5">
            <span v-if="client.firstName || client.lastName">{{ [client.firstName, client.lastName].filter(Boolean).join(' ') }}</span>
            <span v-if="(client.firstName || client.lastName) && client.email"> · </span>
            <span v-if="client.email">{{ client.email }}</span>
          </p>
          <div v-if="client.status === 'Invited' && client.invitationCode" class="flex items-center gap-1.5 mt-1" @click.stop>
            <code class="text-xs bg-white/10 rounded px-1 py-0.5 font-mono text-text-secondary">{{ client.invitationCode }}</code>
            <button
              class="text-xs text-primary hover:underline"
              @click="copyLink(client.invitationCode!)"
            >{{ copiedCode === client.invitationCode ? '✓ Copied' : 'Copy Link' }}</button>
          </div>
        </div>

        <div class="flex gap-1 items-center" @click.stop>
          <NudgeButton :client-id="client.invitationCode ?? ''" />
          <BaseButton size="sm" variant="ghost" aria-label="Edit" @click="emit('edit', client)"><Pencil class="w-4 h-4" /></BaseButton>
          <BaseButton size="sm" variant="ghost" aria-label="Delete" @click="deleteTarget = client"><Trash2 class="w-4 h-4" /></BaseButton>
        </div>
      </div>
    </div>

    <PaginationBar :page="page" :page-size="PAGE_SIZE" :total="clients.length" @update:page="page = $event" />

    <ConfirmDialog
      :open="deleteTarget !== null"
      title="Remove Client"
      message="Remove this client from your roster?"
      confirm-label="Remove"
      variant="danger"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
