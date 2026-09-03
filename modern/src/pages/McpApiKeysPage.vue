<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('MCP API Keys')
import type { ApiKeyOut, ApiKeyCreatedOut } from '../types'
import { listApiKeys, createApiKey, deleteApiKey } from '../services/mcpApiKeysApi'
import { useToast } from '../composables/useToast'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import BaseButton from '../components/BaseButton.vue'
import { Key, Copy, Trash2, Plus, Check } from 'lucide-vue-next'

const toast = useToast()

const keys = ref<ApiKeyOut[]>([])
const isLoading = ref(false)
const isCreating = ref(false)

const showCreateModal = ref(false)
const newKeyName = ref('')
const createdKey = ref<ApiKeyCreatedOut | null>(null)
const copied = ref(false)

const deleteTargetId = ref<string | null>(null)
const isDeleting = ref(false)

async function load() {
  isLoading.value = true
  try {
    keys.value = await listApiKeys()
  } catch {
    toast.error('Failed to load API keys')
  } finally {
    isLoading.value = false
  }
}

onMounted(load)

function openCreate() {
  newKeyName.value = ''
  createdKey.value = null
  copied.value = false
  showCreateModal.value = true
}

function closeCreate() {
  if (createdKey.value) load()
  showCreateModal.value = false
  createdKey.value = null
}

async function submitCreate() {
  if (!newKeyName.value.trim()) return
  isCreating.value = true
  try {
    createdKey.value = await createApiKey({ name: newKeyName.value.trim() })
    keys.value.unshift({
      id: createdKey.value.id,
      name: createdKey.value.name,
      createdAt: createdKey.value.createdAt,
    })
  } catch {
    toast.error('Failed to create API key')
  } finally {
    isCreating.value = false
  }
}

async function copyKey() {
  if (!createdKey.value) return
  await navigator.clipboard.writeText(createdKey.value.key)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

async function confirmDelete() {
  if (!deleteTargetId.value) return
  isDeleting.value = true
  try {
    await deleteApiKey(deleteTargetId.value)
    keys.value = keys.value.filter((k) => k.id !== deleteTargetId.value)
    toast.success('API key deleted')
  } catch {
    toast.error('Failed to delete API key')
  } finally {
    isDeleting.value = false
    deleteTargetId.value = null
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <AppLayout>
    <PageHeader
      title="MCP API Keys"
      subtitle="Manage API keys for AI agent access via the MCP server."
    >
      <BaseButton variant="primary" @click="openCreate">
        <Plus class="w-4 h-4 mr-1.5 -ml-0.5" />
        New Key
      </BaseButton>
    </PageHeader>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-24 text-text-muted">
      <div class="animate-spin w-6 h-6 rounded-full border-2 border-primary border-t-transparent" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="keys.length === 0"
      class="flex flex-col items-center justify-center py-24 gap-3 text-center"
    >
      <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Key class="w-6 h-6 text-primary" />
      </div>
      <p class="text-base font-semibold text-text-primary dark:text-white">No API keys yet</p>
      <p class="text-sm text-text-muted max-w-xs">Create an API key to allow AI agents to access your training data via the MCP server.</p>
      <BaseButton variant="primary" class="mt-2" @click="openCreate">Create your first key</BaseButton>
    </div>

    <!-- Keys table -->
    <div v-else class="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
            <th class="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Name</th>
            <th class="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Created</th>
            <th class="px-5 py-3 w-16" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="key in keys"
            :key="key.id"
            class="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <td class="px-5 py-4 font-medium text-text-primary dark:text-white">
              <div class="flex items-center gap-2.5">
                <Key class="w-4 h-4 text-primary flex-shrink-0" />
                {{ key.name }}
              </div>
            </td>
            <td class="px-5 py-4 text-text-muted">{{ formatDate(key.createdAt) }}</td>
            <td class="px-5 py-4 text-right">
              <button
                class="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                title="Delete key"
                @click="deleteTargetId = key.id"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showCreateModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="closeCreate"
        >
          <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 class="text-lg font-bold text-text-primary dark:text-white mb-1">
              {{ createdKey ? 'Key created' : 'New API Key' }}
            </h2>

            <!-- After creation: show the key -->
            <template v-if="createdKey">
              <p class="text-sm text-text-muted mb-4">Copy your API key now — it will not be shown again.</p>
              <div class="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 mb-4">
                <p class="text-xs font-mono break-all text-text-primary dark:text-white select-all">{{ createdKey.key }}</p>
              </div>
              <BaseButton variant="secondary" class="w-full mb-3" @click="copyKey">
                <component :is="copied ? Check : Copy" class="w-4 h-4 mr-1.5 -ml-0.5" />
                {{ copied ? 'Copied!' : 'Copy to clipboard' }}
              </BaseButton>
              <BaseButton variant="ghost" class="w-full" @click="closeCreate">Done</BaseButton>
            </template>

            <!-- Before creation: name form -->
            <template v-else>
              <p class="text-sm text-text-muted mb-4">Give the key a descriptive name so you can identify it later.</p>
              <label class="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Key Name</label>
              <input
                v-model="newKeyName"
                placeholder="e.g. My AI Agent"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-sm text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary mb-5"
                autofocus
                @keydown.enter="submitCreate"
              />
              <div class="flex gap-3">
                <BaseButton variant="ghost" class="flex-1" @click="closeCreate">Cancel</BaseButton>
                <BaseButton
                  variant="primary"
                  class="flex-1"
                  :loading="isCreating"
                  :disabled="!newKeyName.trim()"
                  @click="submitCreate"
                >
                  Create Key
                </BaseButton>
              </div>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="deleteTargetId"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="deleteTargetId = null"
        >
          <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 class="text-lg font-bold text-text-primary dark:text-white mb-2">Delete API Key</h2>
            <p class="text-sm text-text-muted mb-6">
              This key will stop working immediately. Any agents using it will lose access.
            </p>
            <div class="flex gap-3">
              <BaseButton variant="ghost" class="flex-1" @click="deleteTargetId = null">Cancel</BaseButton>
              <BaseButton variant="danger" class="flex-1" :loading="isDeleting" @click="confirmDelete">
                Delete
              </BaseButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AppLayout>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
