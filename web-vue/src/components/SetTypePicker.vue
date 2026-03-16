<template>
  <button
    type="button"
    class="w-8 rounded-md border px-2 py-1 text-center text-xs font-medium transition-colors"
    :class="triggerClass"
    @click="isOpen = true"
  >
    {{ currentLabel }}
  </button>

  <div
    v-if="isOpen"
    class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4"
    @click.self="isOpen = false"
  >
    <div class="w-full max-w-xs rounded-lg border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Select set type</h3>
        <button
          type="button"
          class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          @click="isOpen = false"
        >
          ✕
        </button>
      </div>

      <div class="space-y-2">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          class="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-medium transition-colors"
          :class="optionClass(option.value)"
          @click="selectType(option.value)"
        >
          <span>{{ option.label }}</span>
          <span v-if="modelValue === option.value" class="text-xs">Selected</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type SetType = 'warmup' | 'normal' | 'fail'

const props = defineProps<{
  modelValue: SetType
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: SetType): void
}>()

const isOpen = ref(false)

const options: { value: SetType; label: string }[] = [
  { value: 'warmup', label: 'Warmup' },
  { value: 'normal', label: 'Normal' },
  { value: 'fail', label: 'Fail' },
]

const currentLabel = computed(() => {
  if (props.modelValue === 'warmup') return 'W'
  if (props.modelValue === 'normal') return 'N'
  if (props.modelValue === 'fail') return 'F'
  return 'N'
})

const triggerClass = computed(() => {
  if (props.modelValue === 'warmup') {
    return 'border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60'
  }

  if (props.modelValue === 'fail') {
    return 'border-rose-300 bg-rose-100 text-rose-800 hover:bg-rose-200 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/60'
  }

  return 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
})

const optionClass = (type: SetType) => {
  if (type === props.modelValue) {
    if (type === 'warmup') {
      return 'border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200'
    }

    if (type === 'fail') {
      return 'border-rose-400 bg-rose-100 text-rose-900 dark:border-rose-700 dark:bg-rose-900/50 dark:text-rose-200'
    }

    return 'border-slate-400 bg-slate-100 text-slate-900 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100'
  }

  return 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
}

const selectType = (type: SetType) => {
  emit('update:modelValue', type)
  isOpen.value = false
}
</script>
