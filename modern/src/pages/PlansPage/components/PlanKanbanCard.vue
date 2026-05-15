<script setup lang="ts">
import type { PlanOut } from '../../../types'
import BaseBadge from '../../../components/BaseBadge.vue'
import { useClientStore } from '../../../stores/clientStore'

defineProps<{ plan: PlanOut }>()
defineEmits<{ edit: []; delete: [] }>()

const clientStore = useClientStore()
function clientName(id: string | null) {
  return clientStore.clients.find((c) => c.invitationCode === id)?.name ?? id ?? '—'
}
</script>

<template>
  <div class="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/10 p-3 group">
    <div class="flex items-start justify-between gap-2">
      <p class="font-semibold text-sm text-text-primary dark:text-white line-clamp-2">{{ plan.name }}</p>
      <div class="hidden group-hover:flex gap-1 flex-shrink-0">
        <button class="w-7 h-7 flex items-center justify-center rounded-lg text-xs text-text-secondary hover:text-primary focus-visible:ring-1 focus-visible:ring-primary" aria-label="Edit" @click="$emit('edit')">✏️</button>
        <button class="w-7 h-7 flex items-center justify-center rounded-lg text-xs text-text-secondary hover:text-red-500 focus-visible:ring-1 focus-visible:ring-primary" aria-label="Delete" @click="$emit('delete')">🗑️</button>
      </div>
    </div>
    <p class="text-xs text-text-secondary mt-1">{{ clientName(plan.clientId) }}</p>
    <div class="flex items-center justify-between mt-2">
      <span class="text-xs text-text-secondary">{{ plan.workouts?.length ?? 0 }} workouts</span>
      <BaseBadge :label="plan.status ?? 'draft'" />
    </div>
  </div>
</template>
