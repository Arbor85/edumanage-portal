<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'

const props = defineProps<{
  modelValue: string | null
  label?: string
  placeholder?: string
  mode?: 'date' | 'datetime'
  error?: string
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [val: string | null] }>()

// Reactively follow the html.dark class set by Tailwind dark mode
const isDark = ref(document.documentElement.classList.contains('dark'))
let observer: MutationObserver
onMounted(() => {
  observer = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
onUnmounted(() => observer?.disconnect())

const isDatetime = computed(() => props.mode === 'datetime')

// Model type: what v-model returns (ISO-compatible strings matching native input formats)
const modelType = computed(() => isDatetime.value ? "yyyy-MM-dd'T'HH:mm" : 'yyyy-MM-dd')

// Display format: what the user sees inside the trigger input
const displayFormat = computed(() => 'MM/dd/yyyy')

const placeholder = computed(() =>
  props.placeholder ?? (isDatetime.value ? 'Select date & time' : 'Select date'),
)
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-text-primary dark:text-white">{{ label }}</label>

    <VueDatePicker :model-value="modelValue" :format="displayFormat" :model-type="modelType"
      :enable-time-picker="isDatetime" :time-picker-inline="false" :dark="isDark" :disabled="disabled"
      :placeholder="placeholder" :auto-apply="true" :clearable="true" teleport
      @update:model-value="emit('update:modelValue', $event as string | null)" />

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
