<template>
  <DatePicker
    v-model="internalValue"
    mode="dateTime"
    :is24hr="true"
    :minute-increment="5"
    :popover="{ visibility: 'click', placement: 'bottom-start' }"
  >
    <template #default="{ inputValue, inputEvents }">
      <input
        :id="id"
        type="text"
        :value="inputValue"
        :placeholder="placeholder"
        class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        v-on="inputEvents"
      />
    </template>
  </DatePicker>
</template>

<script setup lang="ts">
import { DatePicker } from 'v-calendar'
import 'v-calendar/style.css'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: Date | null
    id?: string
    placeholder?: string
  }>(),
  {
    id: undefined,
    placeholder: 'Select date and time',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: Date | null): void
}>()

const internalValue = computed<Date | null>({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value ? new Date(value) : null)
  },
})
</script>
