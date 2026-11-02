// Service Worker for EMOM timer OS-level notifications.
// Runs outside the page — showNotification() here creates a real OS notification
// that Android/iOS forwards to paired devices (Garmin, Apple Watch, etc.).

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'SHOW_NOTIFICATION') return
  const { title, body } = event.data
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'emom-timer',   // replaces previous timer notification — no flood
      renotify: true,       // re-triggers vibration on watch even with same tag
    }),
  )
})
