import { ref, watch } from 'vue'
import type { Ref } from 'vue'

export function useCountUp(target: Ref<number>, duration = 700) {
  const displayValue = ref(0)
  let rafId: number | null = null

  function animate(from: number, to: number) {
    if (rafId) cancelAnimationFrame(rafId)
    const startTime = performance.now()

    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      displayValue.value = Math.round(from + (to - from) * eased)
      if (progress < 1) rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
  }

  watch(target, (newVal) => animate(displayValue.value, newVal))

  return { displayValue, trigger: () => animate(0, target.value) }
}
