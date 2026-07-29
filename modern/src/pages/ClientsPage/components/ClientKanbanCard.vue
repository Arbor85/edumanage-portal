<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ClientOut } from '../../../types'
import NudgeButton from '../../../components/NudgeButton.vue'
import { Pencil, Trash2 } from 'lucide-vue-next'

const props = defineProps<{ client: ClientOut }>()
const emit = defineEmits<{ edit: []; delete: [] }>()

const router = useRouter()

function initials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
}

function ringClass(): string {
  return props.client.status === 'Active'
    ? 'ring-2 ring-primary/50'
    : 'ring-2 ring-amber-400/50'
}
</script>

<template>
  <div
    class="bg-surface-card border border-white/5 rounded-xl p-3 flex items-center gap-3 group
           hover:border-white/10 cursor-pointer transition-all active:scale-[0.98]"
    @click="router.push(`/coach/clients/${client.invitationCode}`)"
  >
    <!-- Avatar with engagement ring -->
    <div
      class="w-8 h-8 rounded-full flex items-center justify-center
             bg-primary/20 text-primary font-bold text-xs flex-shrink-0"
      :class="ringClass()"
    >
      {{ initials(client.name) }}
    </div>

    <!-- Name -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-white truncate">{{ client.name }}</p>
    </div>

    <!-- Actions (visible on hover) -->
    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <NudgeButton :client-id="client.invitationCode ?? ''" />
      <button
        class="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-white transition-colors"
        @click.stop="emit('edit')"
      >
        <Pencil class="w-3.5 h-3.5" />
      </button>
      <button
        class="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-red-400 transition-colors"
        @click.stop="emit('delete')"
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>
