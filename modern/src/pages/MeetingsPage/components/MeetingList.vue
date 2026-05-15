<script setup lang="ts">
import { computed } from 'vue'
import type { MeetingOut } from '../../../types'
import SkeletonBlock from '../../../components/SkeletonBlock.vue'
import EmptyState from '../../../components/EmptyState.vue'
import BaseButton from '../../../components/BaseButton.vue'
import BaseAvatar from '../../../components/BaseAvatar.vue'
import { useClientStore } from '../../../stores/clientStore'
import { Pencil, CalendarDays } from 'lucide-vue-next'

const props = defineProps<{ meetings: MeetingOut[]; loading: boolean }>()
const emit = defineEmits<{ edit: [m: MeetingOut] }>()

const clientStore = useClientStore()
function clientName(id: string | null) {
  return clientStore.clients.find((c) => c.invitationCode === id)?.name ?? id ?? '—'
}

const upcoming = computed(() => {
  const now = new Date().toISOString()
  return props.meetings.filter((m) => (m.date ?? '') >= now)
})
const past = computed(() => {
  const now = new Date().toISOString()
  return props.meetings.filter((m) => (m.date ?? '') < now)
})

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <div>
    <div v-if="loading" class="flex flex-col gap-3">
      <SkeletonBlock v-for="i in 5" :key="i" height="4rem" />
    </div>
    <EmptyState v-else-if="!meetings.length" :icon="CalendarDays" title="No meetings" description="Schedule your first session." />

    <div v-else class="flex flex-col gap-6">
      <!-- Upcoming -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Upcoming ({{ upcoming.length }})</p>
        <div class="flex flex-col gap-3">
          <div
            v-for="m in upcoming"
            :key="m.id ?? ''"
            class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-4 flex items-center gap-4"
          >
            <BaseAvatar :name="clientName(m.clientId)" size="sm" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-text-primary dark:text-white">{{ m.title }}</p>
              <p class="text-xs text-text-secondary mt-0.5">{{ clientName(m.clientId) }} · {{ formatDate(m.date) }}</p>
            </div>
            <BaseButton size="sm" variant="ghost" aria-label="Edit" @click="emit('edit', m)"><Pencil class="w-4 h-4" /></BaseButton>
          </div>
        </div>
        <EmptyState v-if="!upcoming.length" :icon="undefined" title="" description="No upcoming meetings." class="py-4" />
      </div>

      <!-- Past -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Past ({{ past.length }})</p>
        <div class="flex flex-col gap-3">
          <div
            v-for="m in past"
            :key="m.id ?? ''"
            class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-4 flex items-center gap-4 opacity-60"
          >
            <BaseAvatar :name="clientName(m.clientId)" size="sm" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-text-primary dark:text-white">{{ m.title }}</p>
              <p class="text-xs text-text-secondary mt-0.5">{{ clientName(m.clientId) }} · {{ formatDate(m.date) }}</p>
            </div>
            <BaseButton size="sm" variant="ghost" aria-label="Edit" @click="emit('edit', m)"><Pencil class="w-4 h-4" /></BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
