/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

cleanupOutdatedCaches()

// Injected by VitePWA at build time — precaches all app assets
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('message', (event) => {
  // VitePWA sends this when the user confirms the update
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }

  // EMOM timer — OS-level notification for Garmin / watch forwarding
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body } = event.data as { title: string; body: string }
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'emom-timer',
        renotify: true,
      }),
    )
  }
})
