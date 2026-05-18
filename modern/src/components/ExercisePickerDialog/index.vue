<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ExcerciseOut } from '../../types'
import { useExerciseStore } from '../../stores/exerciseStore'
import BaseModal from '../BaseModal.vue'
import BaseInput from '../BaseInput.vue'
import BaseBadge from '../BaseBadge.vue'
import EmptyState from '../EmptyState.vue'
import { Dumbbell } from 'lucide-vue-next'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; select: [exercise: ExcerciseOut] }>()

const exerciseStore = useExerciseStore()
const search = ref('')

watch(() => props.open, (val) => {
  if (val) {
    search.value = ''
    if (!exerciseStore.exercises.length) exerciseStore.fetch()
  }
})

const filtered = computed(() =>
  exerciseStore.exercises.filter((e) =>
    !search.value || e.name?.toLowerCase().includes(search.value.toLowerCase())
  )
)

function pick(ex: ExcerciseOut) {
  emit('select', ex)
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" title="Add Exercise" size="md" @close="emit('close')">
    <div class="flex flex-col gap-3">
      <BaseInput v-model="search" placeholder="Search exercises..." autofocus />
      <ul class="flex flex-col gap-0.5 max-h-80 overflow-y-auto custom-scrollbar -mx-1 px-1">
        <li v-for="ex in filtered" :key="ex.id">
          <button
            type="button"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-colors"
            @click="pick(ex)"
          >
            <span class="flex-1 truncate font-medium">{{ ex.name }}</span>
            <BaseBadge v-if="ex.primaryMuscle" :label="ex.primaryMuscle" />
          </button>
        </li>
        <li v-if="!filtered.length">
          <EmptyState :icon="Dumbbell" title="No exercises found" description="Try a different search term" />
        </li>
      </ul>
    </div>
  </BaseModal>
</template>
