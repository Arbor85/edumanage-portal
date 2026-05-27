<script setup lang="ts">
import { ref, watch } from 'vue'
import type { DefaultWorkoutOut } from '../../types'
import { listDefaultWorkouts } from '../../services/defaultWorkoutsApi'
import BaseModal from '../BaseModal.vue'
import BaseInput from '../BaseInput.vue'
import EmptyState from '../EmptyState.vue'
import { Dumbbell } from 'lucide-vue-next'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; select: [workout: DefaultWorkoutOut] }>()

const workouts = ref<DefaultWorkoutOut[]>([])
const search = ref('')
const loading = ref(false)

watch(() => props.open, async (val) => {
  if (!val) return
  search.value = ''
  if (workouts.value.length) return
  loading.value = true
  try {
    workouts.value = await listDefaultWorkouts()
  } finally {
    loading.value = false
  }
})

const filtered = () =>
  workouts.value.filter((w) =>
    !search.value || w.name?.toLowerCase().includes(search.value.toLowerCase())
  )

function pick(w: DefaultWorkoutOut) {
  emit('select', w)
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" title="Select Default Workout" size="md" @close="emit('close')">
    <div class="flex flex-col gap-3">
      <BaseInput v-model="search" placeholder="Search workouts..." autofocus />
      <div v-if="loading" class="py-8 text-center text-sm text-text-secondary">Loading…</div>
      <ul v-else class="flex flex-col gap-0.5 max-h-80 overflow-y-auto custom-scrollbar -mx-1 px-1">
        <li v-for="w in filtered()" :key="w.id ?? w.name ?? ''">
          <button
            type="button"
            class="w-full flex flex-col gap-0.5 px-3 py-2.5 rounded-xl text-sm text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-colors"
            @click="pick(w)"
          >
            <span class="font-medium truncate">{{ w.name }}</span>
            <span v-if="w.excercises?.length" class="text-xs text-text-secondary">
              {{ w.excercises.length }} exercise{{ w.excercises.length === 1 ? '' : 's' }}
            </span>
          </button>
        </li>
        <li v-if="!filtered().length && !loading">
          <EmptyState :icon="Dumbbell" title="No default workouts found" description="Try a different search term" />
        </li>
      </ul>
    </div>
  </BaseModal>
</template>
