<template>
  <div>
    <button
      type="button"
      @click="openDialog"
      class="inline-flex w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      <span>{{ displayValue }}</span>
      <span class="text-xs text-slate-500 dark:text-slate-400">Pick hour</span>
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">Select time</h3>
          <button
            type="button"
            @click="closeDialog"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div class="custom-scrollbar max-h-80 space-y-2 overflow-auto rounded-md border border-slate-300 p-2 dark:border-slate-600">
          <button
            v-for="slot in timeSlots"
            :key="slot.value"
            type="button"
            @click="selectTime(slot.value)"
            class="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors"
            :class="selectedTime === slot.value
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
          >
            <span>{{ slot.label }}</span>
            <span v-if="selectedTime === slot.value">✓</span>
          </button>
        </div>

        <div class="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="closeDialog"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
  }>(),
  {
    modelValue: '',
    placeholder: 'Select time',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const selectedTime = ref('')

const toLabel = (hour: number) => {
  const normalizedHour = hour % 12 || 12
  const suffix = hour < 12 ? 'AM' : 'PM'
  return `${normalizedHour}:00 ${suffix}`
}

const timeSlots = Array.from({ length: 15 }, (_, index) => {
  const hour = 7 + index
  return {
    value: `${String(hour).padStart(2, '0')}:00`,
    label: toLabel(hour),
  }
})

const displayValue = computed(() => {
  if (!props.modelValue) {
    return props.placeholder
  }

  return timeSlots.find((slot) => slot.value === props.modelValue)?.label ?? props.modelValue
})

const openDialog = () => {
  selectedTime.value = props.modelValue ?? ''
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

const selectTime = (value: string) => {
  selectedTime.value = value
  emit('update:modelValue', value)
  closeDialog()
}
</script>
