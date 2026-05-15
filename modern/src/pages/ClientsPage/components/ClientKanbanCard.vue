<script setup lang="ts">
import type { ClientOut } from '../../../types'
import BaseAvatar from '../../../components/BaseAvatar.vue'
import BaseBadge from '../../../components/BaseBadge.vue'
import { Pencil, Trash2 } from 'lucide-vue-next'

defineProps<{ client: ClientOut }>()
defineEmits<{ edit: []; delete: [] }>()
</script>

<template>
  <div class="bg-white dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-white/10 p-3 flex items-center gap-3 group">
    <BaseAvatar :name="client.name ?? ''" size="sm" />
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-text-primary dark:text-white truncate">{{ client.name }}</p>
      <p v-if="client.email" class="text-xs text-text-secondary truncate">{{ client.email }}</p>
    </div>
    <div class="flex items-center gap-1">
      <BaseBadge :label="client.invitationAccepted ? 'Active' : 'Pending'" :variant="client.invitationAccepted ? 'success' : 'warning'" />
      <div class="hidden group-hover:flex gap-1 ml-1">
        <button class="w-6 h-6 flex items-center justify-center rounded text-text-secondary hover:text-primary" aria-label="Edit" @click="$emit('edit')"><Pencil class="w-3.5 h-3.5" /></button>
        <button class="w-6 h-6 flex items-center justify-center rounded text-text-secondary hover:text-red-500" aria-label="Delete" @click="$emit('delete')"><Trash2 class="w-3.5 h-3.5" /></button>
      </div>
    </div>
  </div>
</template>
