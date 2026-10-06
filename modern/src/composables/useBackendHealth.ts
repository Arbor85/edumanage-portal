import { ref } from 'vue'
import axios from 'axios'

const isReady = ref(false)
const isChecking = ref(false)

/**
 * Polls the backend `/health` endpoint every second until it responds with 200,
 * so the app can show an "Initializing app..." state while the backend is unavailable.
 */
export function useBackendHealth() {
  async function waitUntilHealthy(intervalMs = 1000) {
    if (isReady.value) return
    isChecking.value = true
    const baseURL = import.meta.env.VITE_API_BASE_URL
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const response = await axios.get(`${baseURL}/health`)
        if (response.status === 200) break
      } catch {
        // Backend unavailable — keep polling
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
    isChecking.value = false
    isReady.value = true
  }

  return { isReady, isChecking, waitUntilHealthy }
}
