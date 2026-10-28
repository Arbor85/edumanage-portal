<script setup lang="ts">
import { usePageTitle } from '../../composables/usePageTitle'
import AppLayout from '../../components/layout/AppLayout.vue'
import PageHeader from '../../components/layout/PageHeader.vue'
import McpServerPanel from './components/McpServerPanel.vue'
import McpToolCallForm from './components/McpToolCallForm.vue'
import McpResultPanel from './components/McpResultPanel.vue'
import { useMcpStore } from '../../stores/mcpStore'
import BaseButton from '../../components/BaseButton.vue'
import { Trash2 } from '@lucide/vue'

usePageTitle('MCP Tools')
const store = useMcpStore()
</script>

<template>
  <AppLayout>
    <PageHeader
      title="MCP Tools"
      subtitle="Connect to MCP servers and invoke tools with interactive UI."
    >
      <BaseButton
        v-if="store.toolCalls.length > 0"
        variant="ghost"
        size="sm"
        @click="store.clearCalls()"
      >
        <Trash2 class="w-4 h-4 mr-1.5 -ml-0.5" />
        Clear history
      </BaseButton>
    </PageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
      <!-- Left panel: servers + tool form -->
      <div class="flex flex-col gap-6">
        <section class="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark p-5">
          <h2 class="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">Servers</h2>
          <McpServerPanel />
        </section>

        <section
          v-if="store.servers.length > 0"
          class="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark p-5"
        >
          <h2 class="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">Call a Tool</h2>
          <McpToolCallForm />
        </section>

        <div v-else class="rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-8 text-center text-text-muted">
          <p class="text-sm">Connect an MCP server above to get started.</p>
        </div>
      </div>

      <!-- Right panel: results -->
      <section class="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark p-5 min-h-[400px]">
        <h2 class="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">Results</h2>
        <McpResultPanel />
      </section>
    </div>
  </AppLayout>
</template>
