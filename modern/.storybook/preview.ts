import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createAuth0 } from '@auth0/auth0-vue'
import '../src/style.css'

const pinia = createPinia()
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:pathMatch(.*)*', name: 'Catch', component: { template: '<div />' } }],
})

const auth0 = createAuth0({
  domain: 'storybook.example.com',
  clientId: 'storybook-client-id',
  authorizationParams: { redirect_uri: 'http://localhost:6006' },
})

setup((app) => {
  app.use(pinia)
  app.use(router)
  app.use(auth0)
})

const preview: Preview = {
  parameters: {
    darkMode: {
      dark: { class: 'dark' },
      stylePreview: true,
    },
    backgrounds: { disable: true },
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview