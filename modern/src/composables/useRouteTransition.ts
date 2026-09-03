import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const NAV_ORDER = [
  '/',
  '/routines',
  '/progress',
  '/explore',
  '/profile',
  '/coach/clients',
  '/coach/plans',
  '/coach/meetings',
  '/coach/courses',
  '/coach/equipment',
]

export function useRouteTransition() {
  const transitionName = ref('')
  const router = useRouter()

  const remove = router.beforeEach((to, from) => {
    if (!from.name) {
      transitionName.value = ''
      return
    }

    const toIdx = NAV_ORDER.indexOf(to.path)
    const fromIdx = NAV_ORDER.indexOf(from.path)

    if (toIdx === -1 || fromIdx === -1) {
      transitionName.value = ''
    } else if (toIdx > fromIdx) {
      transitionName.value = 'slide-left'
    } else if (toIdx < fromIdx) {
      transitionName.value = 'slide-right'
    } else {
      transitionName.value = ''
    }
  })

  onUnmounted(remove)

  return { transitionName }
}
