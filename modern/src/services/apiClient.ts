import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-vue'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

apiClient.interceptors.request.use(async (config) => {
  try {
    const { getAccessTokenSilently } = useAuth0()
    const token = await getAccessTokenSilently()
    config.headers.Authorization = `Bearer ${token}`
  } catch {
    // Not authenticated — let the request proceed, response interceptor handles 401
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
