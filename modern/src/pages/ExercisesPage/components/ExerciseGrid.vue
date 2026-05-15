<script setup lang="ts">
import type { ExcerciseOut } from '../../../types'
import SkeletonBlock from '../../../components/SkeletonBlock.vue'
import EmptyState from '../../../components/EmptyState.vue'
import ExerciseCard from './ExerciseCard.vue'

defineProps<{
  exercises: ExcerciseOut[]
  loading: boolean
}>()
defineEmits<{ edit: [ex: ExcerciseOut]; delete: [ex: ExcerciseOut] }>()
</script>

<template>
  <div>
    <!-- Loading: skeleton grid -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      <div v-for="i in 8" :key="i" class="rounded-2xl overflow-hidden">
        <SkeletonBlock height="0" class="aspect-[4/3]" />
        <div class="p-3 space-y-1.5">
          <SkeletonBlock height="1rem" width="70%" />
          <SkeletonBlock height="0.75rem" width="40%" />
        </div>
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
        v-for="ex in exercises"
        :key="ex.id"
        :exercise="ex"
        @edit="$emit('edit', ex)"
        @delete="$emit('delete', ex)"
      />
    </div>
  </div>
</template>
