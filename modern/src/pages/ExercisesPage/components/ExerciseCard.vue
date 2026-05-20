<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ExcerciseOut } from '../../../types'
import DifficultyBadge from '../../../components/DifficultyBadge.vue'
import { Trash2, Dumbbell } from 'lucide-vue-next'

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

const MUSCLE_IMAGES: Record<string, string> = {
  chest: '/images/benchpress.png',
  back: '/images/muscles/deadlift.jpg',
  shoulders: '/images/muscles/shoulders.jpg',
  biceps: '/images/muscles/biceps.jpg',
  triceps: '/images/muscles/triceps.jpg',
  legs: '/images/muscles/legs.jpg',
  quads: '/images/muscles/quads.jpg',
  hamstrings: '/images/muscles/hamstrings.jpg',
  glutes: '/images/muscles/glutes.jpg',
  abs: '/images/muscles/abs.jpg',
  core: '/images/muscles/core.jpg',
  calves: '/images/muscles/calves.jpg',
  forearms: '/images/muscles/forearms.jpg',
  cardio: '/images/muscles/cardio.jpg',
}

const FALLBACK = '/images/benchpress.png'

const imageUrl = computed(() => {
  const key = (props.exercise.primaryMuscle ?? '').toLowerCase().trim()
  return MUSCLE_IMAGES[key] ?? FALLBACK
})

const imgError = ref(false)

function onImgError() {
  imgError.value = true
}
</script>

<template>
  <div class="rounded-2xl overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform bg-surface dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/10" @click="$emit('edit')">
    <!-- Image area -->
    <div class="relative aspect-[4/3] bg-gray-200 dark:bg-gray-700">
      <img
        v-if="!imgError"
        :src="imageUrl"
        :alt="exercise.name ?? ''"
        class="w-full h-full object-cover"
        loading="lazy"
        @error="onImgError"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <Dumbbell class="w-12 h-12 text-gray-300 dark:text-gray-600" />
      </div>
      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

      <!-- Difficulty badge: top-left -->
      <DifficultyBadge :level="difficultyLevel" class="absolute top-3 left-3" />

      <!-- Bodyweight badge -->
      <span v-if="exercise.isBodyweight" class="absolute bottom-3 right-3 inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-semibold uppercase tracking-wide">
        Bodyweight
      </span>

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

      <!-- Delete icon: top-right, hover only -->
      <div class="absolute top-3 right-3 hidden group-hover:flex gap-1">
        <button
          class="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Delete exercise"
          @click.stop="$emit('delete')"
        ><Trash2 class="w-3.5 h-3.5" /></button>
      </div>
    </div>

    <!-- Footer -->
    <div class="p-3">
      <p class="font-semibold text-text-primary dark:text-white truncate text-sm">{{ exercise.name }}</p>
      <p class="text-xs text-primary font-medium mt-1">Edit</p>
    </div>
  </div>
</template>
