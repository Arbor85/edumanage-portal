<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useIntersectionReveal } from '../composables/useIntersectionReveal'
import { useCountUp } from '../composables/useCountUp'

const props = defineProps<{
  label: string
  value: number
  unit: string
  linkTo: string
}>()

const router = useRouter()
const el = ref<HTMLElement | null>(null)
const { isVisible } = useIntersectionReveal(el)
const target = computed(() => props.value)
const { displayValue, trigger } = useCountUp(target)

watch(isVisible, (visible) => { if (visible) trigger() })
</script>

<template>
  <button
    ref="el"
    class="flex-1 bg-surface-card border border-white/5 rounded-2xl p-4 text-left
           transition-all hover:-translate-y-0.5 hover:border-white/10 hover:shadow-lg active:scale-[0.97]"
    @click="router.push(linkTo)"
  >
    <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-2">{{ label }}</p>
    <p class="text-3xl font-bold tabular-nums text-white leading-none mb-1">
      {{ displayValue.toLocaleString() }}
    </p>
    <p class="text-xs text-text-secondary">{{ unit }}</p>
  </button>
</template>
