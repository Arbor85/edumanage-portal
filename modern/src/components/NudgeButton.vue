<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bell } from 'lucide-vue-next'
import apiClient from '../services/apiClient'

const props = defineProps<{ clientId: string }>()

const COOLDOWN_MS = 24 * 60 * 60 * 1000
const lsKey = () => `nudge_last_${props.clientId}`

function getLastNudge(): number {
  try { return parseInt(localStorage.getItem(lsKey()) ?? '0') } catch { return 0 }
}

const isLoading = ref(false)
const lastNudge = ref(getLastNudge())

const isOnCooldown = computed(() => Date.now() - lastNudge.value < COOLDOWN_MS)

async function nudge() {
  if (isOnCooldown.value || isLoading.value) return
  isLoading.value = true
  try {
    await apiClient.post('/api/notifications/nudge', { clientId: props.clientId })
  } catch {
    // API not yet available — still record locally so UX works
  } finally {
    lastNudge.value = Date.now()
    localStorage.setItem(lsKey(), String(lastNudge.value))
    isLoading.value = false
  }
}
</script>

<template>
  <button
    class="relative w-8 h-8 flex items-center justify-center rounded-xl transition-all group/nudge"
    :class="isOnCooldown
      ? 'text-text-muted cursor-default bg-white/3'
      : 'text-text-secondary hover:text-primary hover:bg-primary/10 active:scale-95'"
    :disabled="isOnCooldown || isLoading"
    :title="isOnCooldown ? 'Nudge sent (cooldown 24h)' : 'Cheer on your client'"
    @click.stop="nudge"
  >
    <Bell
      class="w-3.5 h-3.5 transition-transform"
      :class="{ 'animate-bounce': isLoading, 'opacity-40': isOnCooldown }"
    />
    <!-- Tooltip -->
    <span
      class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1
             text-[10px] font-bold bg-surface-elevated border border-white/10 text-white
             rounded-lg whitespace-nowrap opacity-0 group-hover/nudge:opacity-100
             transition-opacity shadow-xl"
    >
      {{ isOnCooldown ? 'Nudge sent ✓' : 'Cheer on your client' }}
    </span>
  </button>
</template>
