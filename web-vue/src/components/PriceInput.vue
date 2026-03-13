<template>
  <div class="relative">
    <input
      :id="id"
      :value="inputValue"
      type="number"
      :min="min"
      :step="step"
      :placeholder="placeholder"
      class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-12 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      @input="onInput"
    />
    <span
      aria-hidden="true"
      class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500"
    >
      {{ currency }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    id?: string
    min?: number
    step?: string
    placeholder?: string
    currency?: string
  }>(),
  {
    id: undefined,
    min: 0,
    step: '0.01',
    placeholder: '0.00',
    currency: '$',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void
}>()

const inputValue = computed(() => (Number.isFinite(props.modelValue) ? props.modelValue : ''))

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (target.value === '') {
    emit('update:modelValue', Number.NaN)
    return
  }

  emit('update:modelValue', Number(target.value))
}
</script>
