<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: number | null
  unit: string
  step?: number
  min?: number
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
  close: []
}>()

const local = ref(props.modelValue ?? 0)
watch(() => props.modelValue, (v) => { if (v !== null) local.value = v })

const step = props.step ?? 1

function increment() {
  local.value = Math.round((local.value + step) * 100) / 100
}

function decrement() {
  local.value = Math.max(props.min ?? 0, Math.round((local.value - step) * 100) / 100)
}

function confirm() {
  emit('update:modelValue', local.value)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-end">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />

      <!-- Sheet -->
      <div
        class="relative w-full bg-surface-elevated rounded-t-3xl px-6 pb-10 pt-4 shadow-2xl
               animate-[slideUp_0.25s_cubic-bezier(0.32,0.72,0,1)]"
      >
        <!-- Handle bar -->
        <div class="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />

        <!-- Label -->
        <p class="text-xs font-bold tracking-widest uppercase text-text-muted text-center mb-6">
          {{ label ?? unit }}
        </p>

        <!-- Controls -->
        <div class="flex items-center justify-center gap-8 mb-8">
          <button
            class="w-16 h-16 rounded-full bg-surface-input text-3xl font-light text-white
                   active:scale-95 transition-transform select-none"
            @click="decrement"
          >−</button>

          <div class="text-center min-w-[120px]">
            <span class="text-6xl font-black tabular-nums text-white">{{ local }}</span>
            <span class="text-lg text-text-secondary ml-1.5">{{ unit }}</span>
          </div>

          <button
            class="w-16 h-16 rounded-full bg-primary text-3xl font-light text-white shadow-glow
                   active:scale-95 transition-transform select-none"
            @click="increment"
          >+</button>
        </div>

        <button
          class="w-full h-14 bg-primary text-white font-bold text-base rounded-xl
                 shadow-glow hover:bg-primary-dark active:scale-[0.97] transition-all"
          @click="confirm"
        >Confirm</button>
      </div>
    </div>
  </Teleport>
</template>
