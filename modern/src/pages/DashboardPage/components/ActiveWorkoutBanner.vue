<script setup lang="ts">
import { useWorkoutStore } from '../../../stores/workoutStore'
import { useRouter } from 'vue-router'
import BaseButton from '../../../components/BaseButton.vue'
import { Dumbbell } from 'lucide-vue-next'

const store = useWorkoutStore()
const router = useRouter()
</script>

<template>
  <div
    v-if="store.activeWorkout"
    class="bg-primary rounded-2xl p-4 flex items-center gap-4 text-white cursor-pointer hover:bg-primary-dark transition-colors"
    @click="router.push('/workout/active')"
  >
    <Dumbbell class="w-8 h-8" />
    <div class="flex-1">
      <p class="font-semibold">Active Workout</p>
      <p class="text-sm opacity-80">{{ store.activeWorkout.routineName ?? 'Workout' }} in progress</p>
    </div>
    <BaseButton size="sm" variant="ghost" class="!text-white !border-white/40 hover:!bg-white/10" @click.stop="router.push('/workout/active')">Continue →</BaseButton>
  </div>
</template>
