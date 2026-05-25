<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExerciseStore } from '../../stores/exerciseStore'
import BaseBadge from '../BaseBadge.vue'
import BaseModal from '../BaseModal.vue'

const props = defineProps<{
  modelValue: number | null
  label?: string
  error?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [val: number | null] }>()

const exerciseStore = useExerciseStore()
const search = ref('')
const open = ref(false)

const filtered = computed(() =>
  exerciseStore.exercises.filter((e) =>
    !search.value || e.name?.toLowerCase().includes(search.value.toLowerCase())
  )
)

const selected = computed(() =>
  exerciseStore.exercises.find((e) => e.id === props.modelValue) ?? null
)

function pick(id: number | null) {
  emit('update:modelValue', id)
  open.value = false
  search.value = ''
}

function close() {
  open.value = false
  search.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-text-primary dark:text-white">{{ label }}</label>

    <button
      type="button"
      class="flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl border text-sm text-left bg-white dark:bg-surface-dark text-text-primary dark:text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary"
      :class="error ? 'border-red-400' : 'border-gray-200 dark:border-white/10'"
      @click="open = true"
    >
      <span class="flex-1 truncate">{{ selected?.name ?? 'Select exercise...' }}</span>
      <BaseBadge v-if="selected?.primaryMuscle" :label="selected.primaryMuscle" />
    </button>

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

    <BaseModal :open="open" title="Select Exercise" size="sm" @close="close">
      <div class="flex flex-col gap-3">
        <input
          v-model="search"
          placeholder="Search exercises..."
          class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 outline-none text-text-primary dark:text-white placeholder:text-text-secondary focus-visible:ring-2 focus-visible:ring-primary"
        />
        <ul class="flex flex-col gap-0.5 max-h-72 overflow-y-auto custom-scrollbar">
          <li v-for="ex in filtered" :key="ex.id">
            <button
              type="button"
              class="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-text-primary dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 min-h-[44px]"
              :class="modelValue === ex.id ? 'bg-primary/10' : ''"
              @click="pick(ex.id)"
            >
              <span class="flex-1 text-left truncate">{{ ex.name }}</span>
              <BaseBadge v-if="ex.primaryMuscle" :label="ex.primaryMuscle" />
            </button>
          </li>
          <li v-if="!filtered.length" class="px-3 py-4 text-sm text-center text-text-secondary">No exercises found</li>
        </ul>
      </div>
    </BaseModal>
  </div>
</template>
