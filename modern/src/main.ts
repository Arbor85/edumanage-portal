import { createApp } from 'vue'
import { createAuth0 } from '@auth0/auth0-vue'
import { createPinia } from 'pinia'
import './style.css'
import '@vuepic/vue-datepicker/dist/main.css'
import App from './App.vue'
import router from './router'
import { useWorkoutStore } from './stores/workoutStore'
import { initApiAuth } from './services/apiClient'

console.log('[env]', {
  VITE_AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN,
  VITE_AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID,
  VITE_AUTH0_AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(
  createAuth0({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin + '/auth/callback',
      scope: 'openid profile email',
      ...(import.meta.env.VITE_AUTH0_AUDIENCE ? { audience: import.meta.env.VITE_AUTH0_AUDIENCE } : {}),
    },
  })
)

initApiAuth(() => (app.config.globalProperties.$auth0 as ReturnType<typeof createAuth0>).getAccessTokenSilently())

const workoutStore = useWorkoutStore()
workoutStore.restoreFromLocalStorage()

app.mount('#app')
