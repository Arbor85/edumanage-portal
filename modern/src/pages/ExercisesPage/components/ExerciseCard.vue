<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ExcerciseOut, ActivityType } from '../../../types'
import DifficultyBadge from '../../../components/DifficultyBadge.vue'
import { Trash2, Dumbbell, Activity } from 'lucide-vue-next'
import { exerciseImageMap } from '../../../data/exerciseImageMap'

const ACTIVITY_TYPE_BADGE: Record<ActivityType, { label: string; classes: string }> = {
  weighted:   { label: 'Weighted',   classes: 'bg-blue-500/80 text-white' },
  machine:    { label: 'Machine',    classes: 'bg-purple-500/80 text-white' },
  bodyweight: { label: 'Bodyweight', classes: 'bg-emerald-500/80 text-white' },
  cardio:     { label: 'Cardio',     classes: 'bg-orange-500/80 text-white' },
}

const props = defineProps<{ exercise: ExcerciseOut; index?: number }>()
defineEmits<{ edit: []; delete: []; 'open-muscle-dialog': [] }>()

const difficultyLevel = computed(() => {
  const level = props.exercise.level?.toLowerCase()
  if (level === 'expert' || level === 'advanced') return 'Advanced' as const
  if (level === 'intermediate') return 'Intermediate' as const
  if (level === 'beginner') return 'Beginner' as const
  const tags = props.exercise.tags ?? []
  for (const tag of tags) {
    const lower = tag.toLowerCase()
    if (/advanced|expert/.test(lower)) return 'Advanced' as const
    if (/intermediate/.test(lower)) return 'Intermediate' as const
    if (/beginner/.test(lower)) return 'Beginner' as const
  }
  return null
})

const badge = computed(() => ACTIVITY_TYPE_BADGE[props.exercise.activityType ?? 'weighted'])

const FALLBACK = '/images/benchpress.png'
const imgError = ref(false)

const mapEntry = computed(() => exerciseImageMap[(props.exercise.name ?? '').toLowerCase()])
const resolvedImagePath = computed(() => props.exercise.imagePath ?? mapEntry.value?.imagePath ?? null)
const resolvedGifPath = computed(() => props.exercise.gifPath ?? mapEntry.value?.gifPath ?? null)

const staticSrc = computed(() => imgError.value ? null : (resolvedImagePath.value ?? FALLBACK))

function onImgError() { imgError.value = true }

const staggerDelay = computed(() => `${(props.index ?? 0) * 40}ms`)
</script>

<template>
  <div
    class="exercise-card relative rounded-2xl overflow-hidden cursor-pointer group bg-gray-900 shadow-md"
    :style="{ '--stagger-delay': staggerDelay }"
    @click="$emit('edit')"
  >
    <!-- Image layer: static JPEG -->
    <div class="aspect-[4/3] relative overflow-hidden">
      <img
        v-if="staticSrc"
        :src="staticSrc"
        :alt="exercise.name ?? ''"
        class="w-full h-full object-cover will-change-transform transition-transform duration-[500ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
        loading="lazy"
        @error="onImgError"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gray-800">
        <Dumbbell class="w-12 h-12 text-gray-600" />
      </div>

      <!-- GIF crossfade on hover -->
      <img
        v-if="resolvedGifPath && !imgError"
        :src="resolvedGifPath"
        :alt="exercise.name ?? ''"
        aria-hidden="true"
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out opacity-0 group-hover:opacity-100"
      />

      <!-- Gradient: strong at bottom for text legibility -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      <!-- Top row: difficulty badge + action buttons -->
      <div class="absolute top-3 left-3 right-3 flex items-start justify-between">
        <DifficultyBadge :level="difficultyLevel" />

        <!-- Action buttons: fade in on hover, not teleport -->
        <div class="flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150 ease-out">
          <button
            class="action-btn"
            aria-label="Muscle distribution"
            @click.stop="$emit('open-muscle-dialog')"
          >
            <Activity class="w-3.5 h-3.5 text-primary" />
          </button>
          <button
            class="action-btn hover:bg-red-500/90 hover:text-white"
            aria-label="Delete exercise"
            @click.stop="$emit('delete')"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Bottom overlay: name + meta -->
      <div class="absolute bottom-0 left-0 right-0 p-3 pt-8">
        <p class="text-sm font-semibold text-white leading-snug truncate mb-1">
          {{ exercise.name }}
        </p>
        <div class="flex items-center justify-between gap-2 min-w-0">
          <span class="text-[11px] text-white/55 truncate leading-none capitalize">
            {{ exercise.primaryMuscle }}
            <span v-if="exercise.equipment" class="text-white/35"> · {{ exercise.equipment }}</span>
          </span>
          <span
            class="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm"
            :class="badge.classes"
          >
            {{ badge.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercise-card {
  animation: card-in 280ms cubic-bezier(0.23, 1, 0.32, 1) both;
  animation-delay: var(--stagger-delay);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.exercise-card:active {
  transform: scale(0.97);
  transition: transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(6px);
  color: #374151;
  transition: background 150ms ease-out, transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
}

.action-btn:active {
  transform: scale(0.93);
}

@media (hover: hover) and (pointer: fine) {
  .action-btn:hover {
    background: rgba(255, 255, 255, 0.98);
  }
}

@media (prefers-reduced-motion: reduce) {
  .exercise-card { animation: none; }
  .exercise-card:active { transform: none; }
}
</style>
