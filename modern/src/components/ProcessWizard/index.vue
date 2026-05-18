<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  steps: { id: string | number; label: string }[]
  modelValue: number
}>()
const emit = defineEmits<{ 'update:modelValue': [val: number] }>()

const direction = ref<'forward' | 'back'>('forward')

watch(() => props.modelValue, (newVal, oldVal) => {
  direction.value = newVal >= oldVal ? 'forward' : 'back'
})

function goTo(idx: number) {
  emit('update:modelValue', idx)
}
</script>

<template>
  <div class="flex h-full">
    <!-- Left: step list -->
    <div class="w-56 flex-shrink-0 border-r border-gray-100 dark:border-white/10 flex flex-col overflow-y-auto custom-scrollbar">
      <button
        v-for="(step, idx) in steps"
        :key="step.id"
        type="button"
        class="w-full text-left px-4 py-3 text-sm truncate transition-colors border-l-2 flex items-center gap-2"
        :class="modelValue === idx
          ? 'bg-primary/10 text-primary font-semibold border-primary'
          : 'text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'"
        @click="goTo(idx)"
      >
        <span class="text-xs text-text-secondary flex-shrink-0">{{ idx + 1 }}.</span>
        <span class="truncate">{{ step.label || 'New exercise' }}</span>
      </button>
      <div class="p-2 mt-auto">
        <slot name="add-step" />
      </div>
    </div>

    <!-- Right: animated content -->
    <div class="flex-1 min-w-0 relative overflow-hidden">
      <Transition :name="direction === 'forward' ? 'slide-left' : 'slide-right'">
        <div :key="modelValue" class="absolute inset-0 overflow-y-auto custom-scrollbar p-6">
          <slot name="step-content" :step="steps[modelValue]" :index="modelValue" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.slide-left-enter-from  { transform: translateX(40px);  opacity: 0; }
.slide-left-leave-to    { transform: translateX(-40px); opacity: 0; }
.slide-right-enter-from { transform: translateX(-40px); opacity: 0; }
.slide-right-leave-to   { transform: translateX(40px);  opacity: 0; }
</style>
