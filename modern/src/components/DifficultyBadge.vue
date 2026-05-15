<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  level: 'Beginner' | 'Intermediate' | 'Advanced' | null | undefined
}>()

const cls = computed(() => {
  switch (props.level) {
    case 'Beginner':     return 'bg-difficulty-beginner/20 text-difficulty-beginner'
    case 'Intermediate': return 'bg-difficulty-intermediate/20 text-difficulty-intermediate'
    case 'Advanced':     return 'bg-difficulty-advanced/20 text-difficulty-advanced'
    default:             return null
  }
})
</script>

<template>
  <span v-if="cls" :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', cls]">
    {{ level }}
  </span>
</template>
