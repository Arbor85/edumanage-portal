<script setup lang="ts">
import { Star, Check, Plus } from '@lucide/vue'
import type { ExcerciseOut } from '../../types'
import { exerciseImageSrc, EXERCISE_IMAGE_FALLBACK } from '../../utils/exerciseImage'
import BaseBadge from '../BaseBadge.vue'
import DifficultyBadge from '../DifficultyBadge.vue'

defineProps<{
  exercise: ExcerciseOut
  selected: boolean
  previewed: boolean
  multiple: boolean
}>()
const emit = defineEmits<{ preview: []; select: []; favourite: [] }>()
</script>

<template>
  <article
    class="relative flex flex-col rounded-xl border overflow-hidden bg-white dark:bg-surface-dark transition-colors"
    :class="selected
      ? 'border-primary ring-1 ring-primary'
      : previewed
        ? 'border-primary/60'
        : 'border-gray-200 dark:border-white/10 hover:border-primary/40'"
  >
    <button type="button" class="flex flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl" @click="emit('preview')">
      <div class="aspect-[4/3] bg-gray-100 dark:bg-white/5">
        <img
          :src="exerciseImageSrc(exercise)"
          :alt="exercise.name ?? ''"
          loading="lazy"
          class="w-full h-full object-cover"
          @error="($event.target as HTMLImageElement).src = EXERCISE_IMAGE_FALLBACK"
        />
      </div>
      <div class="flex flex-col gap-1.5 p-2.5">
        <span class="text-sm font-semibold leading-tight text-text-primary dark:text-white line-clamp-2 min-h-[2.25rem]">
          {{ exercise.name }}
        </span>
        <div class="flex flex-wrap gap-1">
          <BaseBadge v-if="exercise.primaryMuscle" :label="exercise.primaryMuscle" variant="primary" />
          <DifficultyBadge :level="exercise.level as any" />
        </div>
        <span v-if="exercise.equipment" class="text-xs text-text-secondary capitalize truncate">{{ exercise.equipment }}</span>
      </div>
    </button>

    <button
      type="button"
      class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/45 backdrop-blur-sm transition-colors hover:bg-black/65 focus-visible:ring-2 focus-visible:ring-primary outline-none"
      :class="exercise.isDirectFavourite ? 'text-amber-400' : 'text-white/80'"
      :aria-label="exercise.isDirectFavourite ? 'Remove from favourites' : 'Add to favourites'"
      :aria-pressed="exercise.isDirectFavourite"
      @click="emit('favourite')"
    >
      <Star class="w-4 h-4" :fill="exercise.isDirectFavourite ? 'currentColor' : 'none'" />
    </button>

    <button
      type="button"
      class="absolute top-2 left-2 h-8 min-w-8 px-2 flex items-center justify-center gap-1 rounded-full text-xs font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
      :class="selected ? 'bg-primary text-white' : 'bg-black/45 backdrop-blur-sm text-white hover:bg-primary'"
      :aria-label="selected ? 'Deselect exercise' : multiple ? 'Add exercise to selection' : 'Select exercise'"
      :aria-pressed="selected"
      @click="emit('select')"
    >
      <Check v-if="selected" class="w-4 h-4" />
      <template v-else>
        <Plus class="w-4 h-4" />
        <span v-if="!multiple">Select</span>
      </template>
    </button>
  </article>
</template>
