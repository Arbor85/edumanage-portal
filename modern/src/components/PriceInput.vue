<script setup lang="ts">
import type { CoursePrice } from '../types'
import BaseInput from './BaseInput.vue'

const props = defineProps<{
  modelValue: CoursePrice | null
}>()
const emit = defineEmits<{ 'update:modelValue': [val: CoursePrice] }>()

function update(field: keyof CoursePrice, raw: string) {
  emit('update:modelValue', {
    value: field === 'value' ? (parseFloat(raw) || 0) : (props.modelValue?.value ?? 0),
    currency: field === 'currency' ? raw : (props.modelValue?.currency ?? 'USD'),
  })
}
</script>

<template>
  <div class="flex gap-3">
    <div class="flex-1">
      <BaseInput
        :model-value="modelValue?.value ?? null"
        label="Price"
        type="number"
        placeholder="0.00"
        @update:model-value="update('value', $event as string)"
      />
    </div>
    <div class="w-24">
      <BaseInput
        :model-value="modelValue?.currency ?? null"
        label="Currency"
        placeholder="USD"
        @update:model-value="update('currency', $event as string)"
      />
    </div>
  </div>
</template>
