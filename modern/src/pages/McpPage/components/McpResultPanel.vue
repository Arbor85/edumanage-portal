<script setup lang="ts">
import { computed } from 'vue'
import { useMcpStore } from '../../../stores/mcpStore'
import McpAppRenderer from '../../../components/McpAppRenderer.vue'
import { Clock, CheckCircle2, XCircle, Loader2, ChevronRight } from '@lucide/vue'

const store = useMcpStore()

const activeCall = computed(() => store.toolCalls.find((c) => c.id === store.activeCallId))

function textContent(call: typeof activeCall.value): string | null {
  if (!call?.result) return null
  const parts = (call.result.content ?? []).filter((c): c is { type: 'text'; text: string } => c.type === 'text')
  return parts.map((p) => p.text).join('\n') || null
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Call history list -->
    <div class="flex flex-col gap-1 mb-4">
      <button
        v-for="call in store.toolCalls"
        :key="call.id"
        class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors w-full text-left"
        :class="call.id === store.activeCallId
          ? 'bg-primary/10 text-primary'
          : 'text-gray-600 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5'"
        @click="store.setActiveCall(call.id)"
      >
        <Loader2 v-if="call.status === 'running'" class="w-4 h-4 animate-spin flex-shrink-0" />
        <CheckCircle2 v-else-if="call.status === 'done'" class="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <XCircle v-else-if="call.status === 'error'" class="w-4 h-4 text-red-500 flex-shrink-0" />
        <Clock v-else class="w-4 h-4 flex-shrink-0" />
        <span class="truncate font-medium">{{ call.toolName }}</span>
        <ChevronRight class="w-3.5 h-3.5 ml-auto flex-shrink-0 opacity-50" />
      </button>
    </div>

    <!-- Active call result -->
    <div v-if="activeCall" class="flex-1 min-h-0">
      <!-- Running -->
      <div v-if="activeCall.status === 'running'" class="flex items-center justify-center py-12 gap-2 text-text-muted">
        <Loader2 class="w-5 h-5 animate-spin" />
        <span class="text-sm">Running {{ activeCall.toolName }}…</span>
      </div>

      <!-- Error -->
      <div v-else-if="activeCall.status === 'error'" class="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4">
        <p class="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Tool call failed</p>
        <p class="text-xs font-mono text-red-500">{{ activeCall.error }}</p>
      </div>

      <!-- Done: UI app -->
      <template v-else-if="activeCall.html">
        <McpAppRenderer
          v-if="store.getClient(activeCall.serverId)"
          :client="store.getClient(activeCall.serverId)!"
          :html="activeCall.html"
          :tool-input="activeCall.input"
          :tool-result="activeCall.result"
        />
      </template>

      <!-- Done: plain text -->
      <div v-else-if="activeCall.status === 'done'" class="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <div class="px-4 py-2.5 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
          <span class="text-xs font-semibold text-text-muted uppercase tracking-wider">Result</span>
        </div>
        <pre class="px-4 py-3 text-sm font-mono text-text-primary dark:text-white whitespace-pre-wrap overflow-auto custom-scrollbar max-h-96">{{ textContent(activeCall) ?? JSON.stringify(activeCall.result, null, 2) }}</pre>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="store.toolCalls.length === 0" class="flex items-center justify-center py-16 text-text-muted">
      <p class="text-sm">No tool calls yet. Connect a server and call a tool.</p>
    </div>
  </div>
</template>
