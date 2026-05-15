<script setup lang="ts">
import { computed } from 'vue'
import { useRoutineStore } from '../../../stores/routineStore'
import { useWorkoutStore } from '../../../stores/workoutStore'
import { useRouter } from 'vue-router'
import BaseButton from '../../../components/BaseButton.vue'
import { Play } from 'lucide-vue-next'

const routineStore = useRoutineStore()
const workoutStore = useWorkoutStore()
const router = useRouter()

const recommended = computed(() => routineStore.routines[0] ?? null)

function start() {
  if (!recommended.value) return
  workoutStore.startFromRoutine(recommended.value)
  router.push('/workout/active')
}
</script>

<template>
  <div class="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white">
    <p class="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">Recommended</p>
    <p class="text-xl font-bold mb-1">{{ recommended?.name ?? 'No routines yet' }}</p>
    <p class="text-sm opacity-80 mb-4">{{ recommended?.excercises?.length ?? 0 }} exercises · {{ recommended?.note ?? '' }}</p>
    <BaseButton v-if="recommended" size="sm" variant="ghost" class="!text-white !border-white/40 hover:!bg-white/10" @click="start"><Play class="w-4 h-4" /> Start Workout</BaseButton>
    <BaseButton v-else size="sm" variant="ghost" class="!text-white !border-white/40 hover:!bg-white/10" @click="router.push('/routines')">+ Create Routine</BaseButton>
  </div>
</template>
