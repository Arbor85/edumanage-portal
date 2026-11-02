import { useRegisterSW } from 'virtual:pwa-register/vue'

export function useAppUpdate() {
  const { needRefresh, updateServiceWorker } = useRegisterSW()

  function applyUpdate() {
    updateServiceWorker(true)
  }

  return { needRefresh, applyUpdate }
}
