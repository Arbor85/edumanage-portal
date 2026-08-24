<script setup lang="ts">
import type { ExcerciseOut } from '../../../types'
import SkeletonBlock from '../../../components/SkeletonBlock.vue'
import EmptyState from '../../../components/EmptyState.vue'
import ExerciseCard from './ExerciseCard.vue'

defineProps<{
  exercises: ExcerciseOut[]
  loading: boolean
}>()
defineEmits<{ edit: [ex: ExcerciseOut]; delete: [ex: ExcerciseOut]; 'open-muscle-dialog': [ex: ExcerciseOut] }>()
</script>

<template>
  <div>
    <!-- Loading: skeleton grid -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      <div v-for="i in 8" :key="i" class="rounded-2xl overflow-hidden">
        <SkeletonBlock height="0" class="aspect-[4/3]" />
      </div>
    </div>

    <!-- Empty state (never shown while loading) -->
    <EmptyState
      v-else-if="!exercises.length"
      icon="🏋️"
      title="No exercises found"
      description="Try adjusting your search or filters."
    />

    <!-- Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      <ExerciseCard
        v-for="(ex, i) in exercises"
        :key="ex.id"
        :exercise="ex"
        :index="i"
        @edit="$emit('edit', ex)"
        @delete="$emit('delete', ex)"
        @open-muscle-dialog="$emit('open-muscle-dialog', ex)"
      />
    </div>
  </div>
</template>
