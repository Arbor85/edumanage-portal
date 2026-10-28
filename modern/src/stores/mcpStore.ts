import { defineStore } from 'pinia'
import { ref } from 'vue'
import { connectToServer, callTool, fetchToolUiHtml } from '../services/mcpService'
import type { Tool, CallToolResult } from '../services/mcpService'
import type { Client } from '@modelcontextprotocol/client'

export interface McpServerMeta {
  id: string
  url: string
  name: string
  tools: Tool[]
}

export interface McpToolCall {
  id: string
  serverId: string
  toolName: string
  input: Record<string, unknown>
  result?: CallToolResult
  html?: string
  status: 'pending' | 'running' | 'done' | 'error'
  error?: string
}

// Store raw Client instances outside Vue reactivity to avoid Proxy wrapping
const clientRegistry = new Map<string, Client>()

export const useMcpStore = defineStore('mcp', () => {
  const servers = ref<McpServerMeta[]>([])
  const toolCalls = ref<McpToolCall[]>([])
  const activeCallId = ref<string | null>(null)
  const isConnecting = ref(false)
  const connectError = ref<string | null>(null)

  function getClient(serverId: string): Client | undefined {
    return clientRegistry.get(serverId)
  }

  async function connectServer(url: string) {
    isConnecting.value = true
    connectError.value = null
    try {
      const info = await connectToServer(url)
      const id = crypto.randomUUID()
      clientRegistry.set(id, info.client)
      servers.value.push({ id, url, name: info.name, tools: info.tools })
      return id
    } catch (err) {
      connectError.value = err instanceof Error ? err.message : String(err)
      throw err
    } finally {
      isConnecting.value = false
    }
  }

  async function disconnectServer(id: string) {
    const client = clientRegistry.get(id)
    if (client) {
      try { await client.close() } catch { /* ignore */ }
      clientRegistry.delete(id)
    }
    servers.value = servers.value.filter((s) => s.id !== id)
    toolCalls.value = toolCalls.value.filter((c) => c.serverId !== id)
    if (activeCallId.value && toolCalls.value.every((c) => c.id !== activeCallId.value)) {
      activeCallId.value = null
    }
  }

  async function invokeTool(serverId: string, toolName: string, input: Record<string, unknown>) {
    const server = servers.value.find((s) => s.id === serverId)
    if (!server) throw new Error('Server not found')
    const client = clientRegistry.get(serverId)
    if (!client) throw new Error('Client not connected')

    const tool: Tool | undefined = server.tools.find((t) => t.name === toolName)
    if (!tool) throw new Error(`Tool ${toolName} not found`)

    const id = crypto.randomUUID()
    const call: McpToolCall = { id, serverId, toolName, input, status: 'running' }
    toolCalls.value.unshift(call)
    activeCallId.value = id

    const [result, html] = await Promise.allSettled([
      callTool(client, toolName, input),
      fetchToolUiHtml(client, tool),
    ])

    const idx = toolCalls.value.findIndex((c) => c.id === id)
    if (idx === -1) return

    if (result.status === 'rejected') {
      toolCalls.value[idx].status = 'error'
      toolCalls.value[idx].error = String(result.reason)
    } else {
      toolCalls.value[idx].status = 'done'
      toolCalls.value[idx].result = result.value
    }

    if (html.status === 'fulfilled' && html.value) {
      toolCalls.value[idx].html = html.value
    }

    return id
  }

  function setActiveCall(id: string | null) {
    activeCallId.value = id
  }

  function clearCalls() {
    toolCalls.value = []
    activeCallId.value = null
  }

  return {
    servers,
    toolCalls,
    activeCallId,
    isConnecting,
    connectError,
    getClient,
    connectServer,
    disconnectServer,
    invokeTool,
    setActiveCall,
    clearCalls,
  }
})
