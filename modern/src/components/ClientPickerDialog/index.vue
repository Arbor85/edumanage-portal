<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ClientOut } from '../../types'
import { useClientStore } from '../../stores/clientStore'
import BaseModal from '../BaseModal.vue'
import BaseInput from '../BaseInput.vue'
import BaseAvatar from '../BaseAvatar.vue'
import EmptyState from '../EmptyState.vue'
import { Users } from 'lucide-vue-next'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; select: [client: ClientOut] }>()

const clientStore = useClientStore()
const search = ref('')

watch(() => props.open, (val) => {
  if (val) {
    search.value = ''
    if (!clientStore.clients.length) clientStore.fetch()
  }
})

const filtered = computed(() =>
  clientStore.clients.filter((c) =>
    !search.value || c.name?.toLowerCase().includes(search.value.toLowerCase()),
  ),
)

function pick(client: ClientOut) {
  emit('select', client)
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" title="Select Client" size="md" @close="emit('close')">
    <div class="flex flex-col gap-3">
      <BaseInput v-model="search" placeholder="Search clients..." autofocus />
      <ul class="flex flex-col gap-0.5 max-h-80 overflow-y-auto custom-scrollbar -mx-1 px-1">
        <li v-for="client in filtered" :key="client.invitationCode ?? ''">
          <button
            type="button"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-colors"
            @click="pick(client)"
          >
            <BaseAvatar :name="client.name ?? '?'" size="sm" />
            <div class="flex-1 min-w-0">
              <p class="font-medium truncate">{{ client.name }}</p>
              <p v-if="client.email" class="text-xs text-text-secondary truncate">{{ client.email }}</p>
            </div>
          </button>
        </li>
        <li v-if="!filtered.length">
          <EmptyState :icon="Users" title="No clients found" description="Try a different search term" />
        </li>
      </ul>
    </div>
  </BaseModal>
</template>
