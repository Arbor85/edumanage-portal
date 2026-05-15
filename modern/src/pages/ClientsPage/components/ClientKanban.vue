<script setup lang="ts">
import type { ClientOut } from '../../../types'
import SkeletonBlock from '../../../components/SkeletonBlock.vue'
import ClientKanbanCard from './ClientKanbanCard.vue'

const props = defineProps<{ clients: ClientOut[]; loading: boolean }>()
const emit = defineEmits<{ edit: [c: ClientOut]; delete: [c: ClientOut] }>()

const columns = [
  { key: false, label: 'Pending' },
  { key: true, label: 'Active' },
]

function byStatus(accepted: boolean) {
  return props.clients.filter((c) => c.invitationAccepted === accepted)
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div
      v-for="col in columns"
      :key="String(col.key)"
      class="bg-gray-50 dark:bg-white/5 rounded-2xl p-3 min-h-[200px]"
    >
      <p class="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">{{ col.label }} ({{ byStatus(col.key).length }})</p>
      <div v-if="loading" class="flex flex-col gap-2">
        <SkeletonBlock v-for="i in 3" :key="i" height="3.5rem" />
      </div>
      <div class="flex flex-col gap-2">
        <ClientKanbanCard
          v-for="client in byStatus(col.key)"
          :key="client.invitationCode ?? ''"
          :client="client"
          @edit="emit('edit', client)"
          @delete="emit('delete', client)"
        />
      </div>
    </div>
  </div>
</template>
