<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExerciseStore } from '../../stores/exerciseStore'
import BaseBadge from '../BaseBadge.vue'

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
</script>

<template>
  <div class="flex flex-col gap-1 relative">
    <label v-if="label" class="text-sm font-medium text-text-primary dark:text-white">{{ label }}</label>

    <button
      type="button"
      class="flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl border text-sm text-left bg-white dark:bg-surface-dark text-text-primary dark:text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary"
      :class="error ? 'border-red-400' : 'border-gray-200 dark:border-white/10'"
      @click="open = !open"
    >
      <span class="flex-1 truncate">{{ selected?.name ?? 'Select exercise...' }}</span>
      <BaseBadge v-if="selected?.primaryMuscle" :label="selected.primaryMuscle" />
      <span class="text-text-secondary">▾</span>
    </button>

    <div
      v-if="open"
      class="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden"
    >
      <div class="p-2 border-b border-gray-100 dark:border-white/10">
        <input
          v-model="search"
          placeholder="Search exercises..."
          class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 rounded-lg outline-none text-text-primary dark:text-white placeholder:text-text-secondary"
          @click.stop
        />
      </div>
      <ul class="max-h-48 overflow-y-auto custom-scrollbar py-1">
        <li v-for="ex in filtered" :key="ex.id">
          <button
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5"
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

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
