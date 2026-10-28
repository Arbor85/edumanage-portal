<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge'
import type { Client, CallToolResult } from '@modelcontextprotocol/client'
import { IMPLEMENTATION } from '../services/mcpService'

const props = defineProps<{
  client: Client
  html: string
  toolInput?: Record<string, unknown>
  toolResult?: CallToolResult
}>()

const SANDBOX_URL = `${window.location.origin}/mcp-sandbox.html`
const SANDBOX_TIMEOUT_MS = 10_000

const containerRef = ref<HTMLDivElement | null>(null)
const iframeHeight = ref(300)
const error = ref<string | null>(null)
const isReady = ref(false)

let currentBridge: AppBridge | null = null
let currentIframe: HTMLIFrameElement | null = null

async function setup() {
  error.value = null
  isReady.value = false
  teardown()

  const container = containerRef.value
  if (!container) return

  const iframe = document.createElement('iframe')
  iframe.style.cssText = `width:100%;height:${iframeHeight.value}px;border:none;background:transparent;`
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms')
  currentIframe = iframe
  container.appendChild(iframe)

  try {
    await waitForSandboxReady(iframe)
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    container.removeChild(iframe)
    currentIframe = null
    return
  }

  const serverCapabilities = props.client.getServerCapabilities?.()
  const bridge = new AppBridge(
    props.client,
    IMPLEMENTATION,
    {
      openLinks: {},
      serverTools: serverCapabilities?.tools,
      serverResources: serverCapabilities?.resources,
    },
  )
  currentBridge = bridge

  bridge.onopenlink = async ({ url }) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    return {}
  }

  bridge.onsizechange = async ({ height, width }) => {
    if (height !== undefined) {
      iframeHeight.value = height
      iframe.style.height = `${height}px`
    }
    if (width !== undefined) {
      iframe.style.minWidth = `min(${width}px, 100%)`
    }
  }

  bridge.onloggingmessage = ({ level, data }) => {
    console.log(`[MCP App ${level}]`, data)
  }

  bridge.oninitialized = () => {
    isReady.value = true
    if (props.toolInput) bridge.sendToolInput({ arguments: props.toolInput })
    if (props.toolResult) bridge.sendToolResult(props.toolResult)
  }

  try {
    await bridge.connect(new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!))
    await bridge.sendSandboxResourceReady({ html: props.html })
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
}

function waitForSandboxReady(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const PROXY_READY = 'ui/notifications/sandbox-proxy-ready'
    let settled = false

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true
        window.removeEventListener('message', onMessage)
        reject(new Error('Timed out waiting for MCP sandbox proxy'))
      }
    }, SANDBOX_TIMEOUT_MS)

    function onMessage(event: MessageEvent) {
      if (event.source === iframe.contentWindow && event.data?.method === PROXY_READY) {
        if (!settled) {
          settled = true
          clearTimeout(timeout)
          window.removeEventListener('message', onMessage)
          resolve()
        }
      }
    }

    window.addEventListener('message', onMessage)
    iframe.src = SANDBOX_URL
  })
}

function teardown() {
  if (currentBridge) {
    currentBridge.close().catch(() => {})
    currentBridge = null
  }
  if (currentIframe && containerRef.value?.contains(currentIframe)) {
    containerRef.value.removeChild(currentIframe)
  }
  currentIframe = null
  isReady.value = false
}

watch(() => props.html, (html) => {
  if (html) setup()
}, { immediate: true })

watch(() => props.toolResult, (result) => {
  if (result && currentBridge && isReady.value) {
    currentBridge.sendToolResult(result)
  }
})

watch(() => props.toolInput, (input) => {
  if (input && currentBridge && isReady.value) {
    currentBridge.sendToolInput({ arguments: input })
  }
})

onBeforeUnmount(teardown)
</script>

<template>
  <div class="relative">
    <div v-if="error" class="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400">
      {{ error }}
    </div>
    <div
      v-else
      ref="containerRef"
      class="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-white/10"
    />
  </div>
</template>
