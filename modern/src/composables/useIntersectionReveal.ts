import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export function useIntersectionReveal(el: Ref<HTMLElement | null>) {
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer?.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    if (el.value) observer.observe(el.value)
  })

  onUnmounted(() => observer?.disconnect())

  return { isVisible }
}
