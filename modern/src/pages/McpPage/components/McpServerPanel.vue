<script setup lang="ts">
import { ref } from 'vue'
import { useMcpStore } from '../../../stores/mcpStore'
import BaseButton from '../../../components/BaseButton.vue'
import { Plus, Unplug, Server, Loader2 } from '@lucide/vue'

const store = useMcpStore()
const serverUrl = ref('')
const showAdd = ref(false)

async function connect() {
  if (!serverUrl.value.trim()) return
  try {
    await store.connectServer(serverUrl.value.trim())
    serverUrl.value = ''
    showAdd.value = false
  } catch {
    // error shown via store.connectError
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Connected servers -->
    <div
      v-for="server in store.servers"
      :key="server.id"
      class="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/20"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <Server class="w-4 h-4 text-primary flex-shrink-0" />
        <div class="min-w-0">
          <p class="text-sm font-semibold text-text-primary dark:text-white truncate">{{ server.name }}</p>
          <p class="text-xs text-text-muted truncate">{{ server.url }}</p>
        </div>
      </div>
      <button
        class="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0"
        title="Disconnect"
        @click="store.disconnectServer(server.id)"
      >
        <Unplug class="w-4 h-4" />
      </button>
    </div>

    <!-- Add server -->
    <div v-if="showAdd" class="flex flex-col gap-2">
      <input
        v-model="serverUrl"
        placeholder="https://your-mcp-server.com/mcp"
        class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-sm text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary"
        autofocus
        @keydown.enter="connect"
        @keydown.escape="showAdd = false"
      />
      <p v-if="store.connectError" class="text-xs text-red-500">{{ store.connectError }}</p>
      <div class="flex gap-2">
        <BaseButton variant="ghost" size="sm" class="flex-1" @click="showAdd = false">Cancel</BaseButton>
        <BaseButton variant="primary" size="sm" class="flex-1" :disabled="store.isConnecting || !serverUrl.trim()" @click="connect">
          <Loader2 v-if="store.isConnecting" class="w-3.5 h-3.5 mr-1 animate-spin" />
          Connect
        </BaseButton>
      </div>
    </div>

    <BaseButton v-else variant="ghost" size="sm" @click="showAdd = true">
      <Plus class="w-4 h-4 mr-1.5 -ml-0.5" />
      Add MCP Server
    </BaseButton>
  </div>
</template>
