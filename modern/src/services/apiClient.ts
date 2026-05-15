import axios from 'axios'

let _getToken: (() => Promise<string>) | null = null

export function initApiAuth(getToken: () => Promise<string>) {
  _getToken = getToken
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

apiClient.interceptors.request.use(async (config) => {
  if (_getToken) {
    try {
      const token = await _getToken()
      config.headers.Authorization = `Bearer ${token}`
    } catch {
      // Not authenticated — let the request proceed, response interceptor handles 401
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data ?? error)
  }
)

export default apiClient
