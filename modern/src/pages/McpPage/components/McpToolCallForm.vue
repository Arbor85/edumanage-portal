<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMcpStore } from '../../../stores/mcpStore'
import BaseButton from '../../../components/BaseButton.vue'
import type { Tool } from '../../../services/mcpService'
import { Play, ChevronDown } from '@lucide/vue'

const store = useMcpStore()

const selectedServerId = ref<string | null>(null)
const selectedToolName = ref<string | null>(null)
const inputJson = ref('{}')
const isSubmitting = ref(false)
const jsonError = ref<string | null>(null)

const selectedServer = computed(() =>
  store.servers.find((s) => s.id === selectedServerId.value)
)

const selectedTool = computed<Tool | undefined>(() =>
  selectedServer.value?.tools.find((t) => t.name === selectedToolName.value)
)

watch(selectedTool, (tool) => {
  if (!tool?.inputSchema) {
    inputJson.value = '{}'
    return
  }
  const schema = tool.inputSchema as Record<string, unknown>
  const props = (schema.properties || {}) as Record<string, unknown>
  const defaults: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(props)) {
    const prop = v as Record<string, unknown>
    if ('default' in prop) defaults[k] = prop.default
    else if (prop.type === 'string') defaults[k] = ''
    else if (prop.type === 'number') defaults[k] = 0
    else if (prop.type === 'boolean') defaults[k] = false
    else defaults[k] = null
  }
  inputJson.value = JSON.stringify(defaults, null, 2)
})

async function submit() {
  if (!selectedServerId.value || !selectedToolName.value) return
  jsonError.value = null
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(inputJson.value)
  } catch {
    jsonError.value = 'Invalid JSON'
    return
  }
  isSubmitting.value = true
  try {
    await store.invokeTool(selectedServerId.value, selectedToolName.value, parsed)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Server select -->
    <div>
      <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Server</label>
      <div class="relative">
        <select
          v-model="selectedServerId"
          class="w-full appearance-none px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-sm text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary pr-8"
          @change="selectedToolName = null"
        >
          <option value="" disabled :selected="!selectedServerId">Select a server…</option>
          <option v-for="s in store.servers" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
      </div>
    </div>

    <!-- Tool select -->
    <div v-if="selectedServer">
      <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Tool</label>
      <div class="relative">
        <select
          v-model="selectedToolName"
          class="w-full appearance-none px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-sm text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary pr-8"
        >
          <option value="" disabled :selected="!selectedToolName">Select a tool…</option>
          <option v-for="t in selectedServer.tools" :key="t.name" :value="t.name">{{ t.name }}</option>
        </select>
        <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
      </div>
      <p v-if="selectedTool?.description" class="mt-1.5 text-xs text-text-muted">{{ selectedTool.description }}</p>
    </div>

    <!-- Input JSON -->
    <div v-if="selectedTool">
      <label class="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Input (JSON)</label>
      <textarea
        v-model="inputJson"
        rows="6"
        spellcheck="false"
        class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-sm font-mono text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none custom-scrollbar"
      />
      <p v-if="jsonError" class="mt-1 text-xs text-red-500">{{ jsonError }}</p>
    </div>

    <BaseButton
      variant="primary"
      :disabled="!selectedServerId || !selectedToolName || isSubmitting"
      :loading="isSubmitting"
      @click="submit"
    >
      <Play class="w-4 h-4 mr-1.5 -ml-0.5" />
      Call Tool
    </BaseButton>
  </div>
</template>
