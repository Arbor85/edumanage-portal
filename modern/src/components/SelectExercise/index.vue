<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExerciseStore } from '../../stores/exerciseStore'
import BaseBadge from '../BaseBadge.vue'
import BaseModal from '../BaseModal.vue'
import ExerciseBrowser from '../ExerciseBrowser/index.vue'

const props = withDefaults(defineProps<{
  modelValue: number | number[] | null
  multiple?: boolean
  label?: string
  error?: string
}>(), { multiple: false })
const emit = defineEmits<{ 'update:modelValue': [val: any] }>()

const exerciseStore = useExerciseStore()
const open = ref(false)
const draft = ref<number[]>([])

const currentIds = computed<number[]>(() =>
  Array.isArray(props.modelValue) ? props.modelValue : props.modelValue === null ? [] : [props.modelValue],
)

const selected = computed(() => exerciseStore.exercises.filter((e) => currentIds.value.includes(e.id)))

const triggerText = computed(() => {
  if (!selected.value.length) return props.multiple ? 'Select exercises...' : 'Select exercise...'
  return selected.value.length === 1 ? (selected.value[0]!.name ?? '') : `${selected.value.length} exercises selected`
})

function openDialog() {
  draft.value = [...currentIds.value]
  open.value = true
}

function onSelect(id: number) {
  if (!props.multiple) {
    emit('update:modelValue', id)
    open.value = false
    return
  }
  draft.value = draft.value.includes(id) ? draft.value.filter((i) => i !== id) : [...draft.value, id]
}

function confirm() {
  emit('update:modelValue', draft.value)
  open.value = false
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-text-primary dark:text-white">{{ label }}</label>

    <button
      type="button"
      class="flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl border text-sm text-left bg-white dark:bg-surface-dark text-text-primary dark:text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary"
      :class="error ? 'border-red-400' : 'border-gray-200 dark:border-white/10'"
      @click="openDialog"
    >
      <span class="flex-1 truncate">{{ triggerText }}</span>
      <BaseBadge v-if="selected.length === 1 && selected[0]!.primaryMuscle" :label="selected[0]!.primaryMuscle!" />
    </button>

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>

    <BaseModal
      :open="open"
      :title="multiple ? 'Select Exercises' : 'Select Exercise'"
      size="xl"
      mobile-fullscreen
      @close="open = false"
    >
      <ExerciseBrowser :selected-ids="multiple ? draft : currentIds" :multiple="multiple" @select="onSelect" />
      <template v-if="multiple" #footer>
        <div class="flex items-center gap-3">
          <span class="flex-1 text-sm text-text-secondary">{{ draft.length }} selected</span>
          <button
            type="button"
            class="px-5 h-10 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-colors"
            @click="confirm"
          >
            Confirm
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
