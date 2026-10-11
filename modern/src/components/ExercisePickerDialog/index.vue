<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ExcerciseOut } from '../../types'
import { useExerciseStore } from '../../stores/exerciseStore'
import BaseModal from '../BaseModal.vue'
import ExerciseBrowser from '../ExerciseBrowser/index.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  close: []
  add: [exercises: ExcerciseOut[]]
  addAsSuperset: [exercises: ExcerciseOut[]]
}>()

const exerciseStore = useExerciseStore()
const selectedIds = ref<number[]>([])

watch(
  () => props.open,
  (val) => {
    if (val) selectedIds.value = []
  },
)

// Keeps selection order and includes exercises hidden by the current filters.
const selectedExercises = computed(() =>
  selectedIds.value.flatMap((id) => exerciseStore.exercises.find((e) => e.id === id) ?? []),
)

function onSelect(id: number) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((i) => i !== id)
    : [...selectedIds.value, id]
}

function submit(event: 'add' | 'addAsSuperset') {
  const exercises = selectedExercises.value
  if (event === 'add') emit('add', exercises)
  else emit('addAsSuperset', exercises)
  selectedIds.value = []
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" title="Add Exercise" size="xl" mobile-fullscreen @close="emit('close')">
    <ExerciseBrowser :selected-ids="selectedIds" multiple @select="onSelect" />
    <template #footer>
      <div class="flex items-center gap-2">
        <span class="flex-1 text-sm text-text-secondary">
          {{ selectedIds.length ? `${selectedIds.length} selected` : 'Nothing selected' }}
        </span>
        <button
          v-if="selectedIds.length >= 2"
          type="button"
          class="px-3 h-10 rounded-xl text-sm font-semibold border border-primary text-primary hover:bg-primary/5 transition-colors"
          @click="submit('addAsSuperset')"
        >
          Add as Superset
        </button>
        <button
          type="button"
          class="px-5 h-10 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!selectedIds.length"
          @click="submit('add')"
        >
          Add
        </button>
      </div>
    </template>
  </BaseModal>
</template>
