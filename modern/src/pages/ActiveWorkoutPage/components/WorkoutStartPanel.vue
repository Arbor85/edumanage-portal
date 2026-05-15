<script setup lang="ts">
import { useWorkoutStore } from '../../../stores/workoutStore'
import { useRoutineStore } from '../../../stores/routineStore'
import { useExerciseStore } from '../../../stores/exerciseStore'
import BaseButton from '../../../components/BaseButton.vue'
import SelectRoutine from '../../../components/SelectRoutine/index.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Dumbbell } from 'lucide-vue-next'

const workoutStore = useWorkoutStore()
const routineStore = useRoutineStore()
const exerciseStore = useExerciseStore()
const router = useRouter()

const selectedRoutineId = ref<string | null>(null)

onMounted(() => {
  routineStore.fetch()
  exerciseStore.fetch()
})

function start() {
  const routine = routineStore.routines.find((r) => r.id === selectedRoutineId.value)
  if (!routine) return
  workoutStore.startFromRoutine(routine)
}

function startBlank() {
  workoutStore.startFromRoutine({ id: null, userId: null, name: 'Ad-hoc Workout', note: null, excercises: [] })
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-6 bg-surface dark:bg-gray-900">
    <div class="w-full max-w-sm flex flex-col gap-6">
      <div class="text-center">
        <Dumbbell class="w-10 h-10 text-primary mb-2" />
        <h1 class="text-2xl font-bold text-text-primary dark:text-white">Start Workout</h1>
        <p class="text-text-secondary mt-1">Choose a routine or start free</p>
      </div>

      <SelectRoutine v-model="selectedRoutineId" label="Select Routine" />

      <div class="flex flex-col gap-2">
        <BaseButton variant="primary" :disabled="!selectedRoutineId" full-width @click="start">Start Routine</BaseButton>
        <BaseButton variant="secondary" full-width @click="startBlank">Start Blank Workout</BaseButton>
        <BaseButton variant="ghost" full-width @click="router.back()">Cancel</BaseButton>
      </div>
    </div>
  </div>
</template>
