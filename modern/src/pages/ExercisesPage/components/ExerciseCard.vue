<script setup lang="ts">
import { computed } from 'vue'
import type { ExcerciseOut } from '../../../types'
import DifficultyBadge from '../../../components/DifficultyBadge.vue'

const props = defineProps<{ exercise: ExcerciseOut }>()
defineEmits<{ edit: []; delete: [] }>()

const difficultyLevel = computed(() => {
  const tags = props.exercise.tags ?? []
  for (const tag of tags) {
    const lower = tag.toLowerCase()
    if (/advanced/.test(lower)) return 'Advanced' as const
    if (/intermediate/.test(lower)) return 'Intermediate' as const
    if (/beginner/.test(lower)) return 'Beginner' as const
  }
  return null
})

// Deterministic placeholder image from primaryMuscle
const imageUrl = computed(() => {
  const muscle = (props.exercise.primaryMuscle ?? 'fitness').replace(/\s+/g, '+')
  return `https://source.unsplash.com/400x300/?${muscle},workout`
})
</script>

<template>
  <div class="rounded-2xl overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform bg-surface dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/10">
    <!-- Image area -->
    <div class="relative aspect-[4/3] bg-gray-200 dark:bg-gray-700">
      <img :src="imageUrl" :alt="exercise.name ?? ''" class="w-full h-full object-cover" loading="lazy" />
      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

      <!-- Difficulty badge: top-left -->
      <DifficultyBadge :level="difficultyLevel" class="absolute top-3 left-3" />

      <!-- Muscle tags: bottom-left -->
      <div class="absolute bottom-3 left-3 flex gap-1 flex-wrap">
        <span v-if="exercise.primaryMuscle" class="text-xs font-semibold uppercase tracking-wider text-white/80">
          {{ exercise.primaryMuscle }}
        </span>
        <span
          v-for="m in (exercise.secondaryMuscles ?? []).slice(0, 1)"
          :key="m"
          class="text-xs uppercase tracking-wider text-white/60"
        >
          {{ m }}
        </span>
      </div>

      <!-- Edit / Delete icons: top-right, hover only -->
      <div class="absolute top-3 right-3 hidden group-hover:flex gap-1">
        <button
          class="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center text-xs hover:bg-white transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Edit exercise"
          @click.stop="$emit('edit')"
        >✏️</button>
        <button
          class="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center text-xs hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Delete exercise"
          @click.stop="$emit('delete')"
        >🗑️</button>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-3">
      <p class="font-semibold text-text-primary dark:text-white truncate text-sm">{{ exercise.name }}</p>
      <button class="text-xs text-primary font-medium mt-1 hover:underline focus-visible:ring-1 focus-visible:ring-primary rounded" @click.stop>
        View Details +
      </button>
    </div>
  </div>
</template>
