import { Client, SSEClientTransport, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'
import type { Tool, Resource, CallToolResult } from '@modelcontextprotocol/client'
import { getToolUiResourceUri, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/app-bridge'

export const IMPLEMENTATION = { name: 'EduManage MCP Host', version: '1.0.0' }

export type { Tool, Resource, CallToolResult }

export interface McpServerInfo {
  name: string
  client: Client
  tools: Tool[]
  resources: Resource[]
}

export async function connectToServer(serverUrl: string): Promise<McpServerInfo> {
  const url = new URL(serverUrl)
  const client = await connectWithFallback(url)

  const name = client.getServerVersion()?.name ?? serverUrl

  const toolsList = await client.listTools()
  const tools = toolsList.tools

  const resourcesList = await client.listResources().catch(() => ({ resources: [] }))
  const resources = resourcesList.resources

  return { name, client, tools, resources }
}

async function connectWithFallback(url: URL): Promise<Client> {
  try {
    const client = new Client(IMPLEMENTATION)
    await client.connect(new StreamableHTTPClientTransport(url))
    return client
  } catch {
    // fall through to SSE
  }

  try {
    const client = new Client(IMPLEMENTATION)
    await client.connect(new SSEClientTransport(url))
    return client
  } catch (sseError) {
    throw new Error(`Cannot connect to MCP server at ${url.href}. SSE error: ${sseError}`)
  }
}

export async function fetchToolUiHtml(client: Client, tool: Tool): Promise<string | null> {
  const uri = getToolUiResourceUri(tool)
  if (!uri) return null

  const result = await client.readResource({ uri })
  if (!result.contents || result.contents.length === 0) return null

  const content = result.contents[0]
  if (content.mimeType !== RESOURCE_MIME_TYPE) return null

  if ('blob' in content && typeof content.blob === 'string') return atob(content.blob)
  if ('text' in content && typeof content.text === 'string') return content.text
  return null
}

export async function callTool(
  client: Client,
  toolName: string,
  input: Record<string, unknown>,
): Promise<CallToolResult> {
  return client.callTool({ name: toolName, arguments: input }) as Promise<CallToolResult>
}
