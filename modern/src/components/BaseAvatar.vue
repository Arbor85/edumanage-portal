<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>()

const initials = computed(() => {
  const parts = (props.name ?? '').trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

const bgColor = computed(() => {
  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-teal-500', 'bg-orange-500', 'bg-rose-500', 'bg-indigo-500']
  let hash = 0
  for (const c of props.name ?? '') hash = c.charCodeAt(0) + hash * 31
  return colors[Math.abs(hash) % colors.length]
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-6 h-6 text-[10px]'
    case 'sm': return 'w-8 h-8 text-xs'
    case 'lg': return 'w-14 h-14 text-xl'
    default:   return 'w-10 h-10 text-sm'
  }
})
</script>

<template>
  <div :class="['rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center', sizeClass]">
    <img v-if="src" :src="src" :alt="name" class="w-full h-full object-cover" />
    <div v-else :class="['w-full h-full flex items-center justify-center font-semibold text-white', bgColor]">
      {{ initials }}
    </div>
  </div>
</template>
