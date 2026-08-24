<script setup lang="ts">
import { X } from 'lucide-vue-next'
import ExerciseMuscleView from './ExerciseMuscleView.vue'
import type { ExcerciseOut } from '../types'

defineProps<{
  exercise: ExcerciseOut
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="bg-surface rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div>
            <p class="text-[10px] uppercase tracking-widest text-text-muted mb-0.5">Muscle Distribution</p>
            <h3 class="text-sm font-semibold text-text-primary capitalize">{{ exercise.name }}</h3>
          </div>
          <button
            class="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/8 transition-colors"
            @click="$emit('close')"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 overflow-y-auto">
          <ExerciseMuscleView
            :primary-muscle="exercise.primaryMuscle ?? ''"
            :secondary-muscles="exercise.secondaryMuscles as string[]"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
