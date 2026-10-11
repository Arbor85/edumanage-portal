<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Check, Plus, Star } from '@lucide/vue'
import type { ExcerciseOut } from '../../types'
import { exerciseGifSrc, exerciseImageSrc, EXERCISE_IMAGE_FALLBACK } from '../../utils/exerciseImage'
import ExerciseMuscleView from '../ExerciseMuscleView.vue'
import BaseBadge from '../BaseBadge.vue'
import DifficultyBadge from '../DifficultyBadge.vue'

const props = defineProps<{
  exercise: ExcerciseOut
  selected: boolean
  multiple: boolean
}>()
const emit = defineEmits<{ select: []; favourite: []; back: [] }>()

const media = computed(() => exerciseGifSrc(props.exercise) ?? exerciseImageSrc(props.exercise))
</script>

<template>
  <div class="flex flex-col gap-4">
    <button
      type="button"
      class="lg:hidden self-start flex items-center gap-1 text-sm font-semibold text-primary"
      @click="emit('back')"
    >
      <ArrowLeft class="w-4 h-4" /> Back to list
    </button>

    <div class="rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 aspect-[4/3]">
      <img
        :src="media"
        :alt="exercise.name ?? ''"
        class="w-full h-full object-cover"
        @error="($event.target as HTMLImageElement).src = EXERCISE_IMAGE_FALLBACK"
      />
    </div>

    <div class="flex items-start gap-2">
      <h3 class="flex-1 text-base font-bold text-text-primary dark:text-white leading-tight">{{ exercise.name }}</h3>
      <button
        type="button"
        class="p-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
        :class="exercise.isDirectFavourite ? 'text-amber-400' : 'text-gray-400'"
        :aria-label="exercise.isDirectFavourite ? 'Remove from favourites' : 'Add to favourites'"
        @click="emit('favourite')"
      >
        <Star class="w-5 h-5" :fill="exercise.isDirectFavourite ? 'currentColor' : 'none'" />
      </button>
    </div>

    <div class="flex flex-wrap gap-1.5">
      <DifficultyBadge :level="exercise.level as any" />
      <BaseBadge v-if="exercise.equipment" :label="exercise.equipment" />
      <BaseBadge v-if="exercise.category" :label="exercise.category" />
    </div>

    <p v-if="exercise.shortDescription" class="text-sm text-text-secondary">{{ exercise.shortDescription }}</p>

    <section v-if="exercise.primaryMuscle" class="flex flex-col gap-2">
      <h4 class="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Muscles worked</h4>
      <ExerciseMuscleView :primary-muscle="exercise.primaryMuscle" :secondary-muscles="exercise.secondaryMuscles ?? []" />
    </section>

    <section v-if="exercise.instructions?.length" class="flex flex-col gap-2">
      <h4 class="text-[10px] font-bold uppercase tracking-wider text-text-secondary">How to</h4>
      <ol class="flex flex-col gap-1.5 list-decimal pl-5 text-sm text-text-primary dark:text-white">
        <li v-for="(step, i) in exercise.instructions" :key="i">{{ step }}</li>
      </ol>
    </section>

    <button
      type="button"
      class="sticky bottom-0 h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors"
      :class="selected ? 'bg-primary/15 text-primary' : 'bg-primary text-white hover:bg-primary-dark'"
      @click="emit('select')"
    >
      <Check v-if="selected" class="w-4 h-4" />
      <Plus v-else class="w-4 h-4" />
      {{ selected ? (multiple ? 'Selected - tap to remove' : 'Selected') : multiple ? 'Add to selection' : 'Select this exercise' }}
    </button>
  </div>
</template>
