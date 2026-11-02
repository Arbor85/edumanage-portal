<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { WizardAnswers, PrimaryGoal } from '../../../../utils/calorieCalc'

const props = defineProps<{
  initial?: WizardAnswers['goal']
}>()

const primary = ref<PrimaryGoal | null>(props.initial?.primary ?? null)
const desiredRateKgPerWeek = ref<number | null>(props.initial?.desiredRateKgPerWeek ?? null)

const isValid = computed<boolean>(() => primary.value !== null)

function getData(): WizardAnswers['goal'] {
  return {
    primary: primary.value!,
    ...(desiredRateKgPerWeek.value !== null ? { desiredRateKgPerWeek: desiredRateKgPerWeek.value } : {}),
  }
}

const emit = defineEmits<{ valid: [boolean] }>()
watch(isValid, (v) => emit('valid', v))
onMounted(() => emit('valid', isValid.value))

defineExpose({ isValid, getData })

const goalOptions: { value: PrimaryGoal; label: string; sub: string; description: string }[] = [
  {
    value: 'loss',
    label: 'Weight Loss',
    sub: 'Lose body fat',
    description: 'Moderate calorie deficit',
  },
  {
    value: 'maintenance',
    label: 'Maintenance',
    sub: 'Maintain current weight',
    description: 'Eat around your TDEE',
  },
  {
    value: 'gain',
    label: 'Muscle Gain',
    sub: 'Gain weight & muscle',
    description: 'Modest calorie surplus',
  },
  {
    value: 'recomp',
    label: 'Recomposition',
    sub: 'Body recomposition',
    description: 'Build muscle, reduce fat',
  },
]
</script>

<template>
  <div class="bg-surface-card border border-white/8 rounded-2xl p-6 space-y-6">
    <div>
      <h2 class="text-lg font-bold text-text-primary dark:text-white mb-1">Your Primary Goal</h2>
      <p class="text-sm text-text-muted">Choose the goal that best matches what you want to achieve right now.</p>
    </div>

    <!-- Goal cards -->
    <div class="space-y-2">
      <button
        v-for="opt in goalOptions"
        :key="opt.value"
        type="button"
        class="w-full text-left px-4 py-4 rounded-xl border transition-all"
        :class="
          primary === opt.value
            ? 'bg-primary/10 border-primary/40 text-primary'
            : 'bg-surface-input border-white/8 text-text-secondary hover:border-white/20 hover:text-text-primary'
        "
        @click="primary = opt.value"
      >
        <div class="text-sm font-bold">{{ opt.label }}</div>
        <div class="text-xs font-medium mt-0.5 opacity-80">{{ opt.sub }}</div>
        <div class="text-xs mt-1 opacity-60">{{ opt.description }}</div>
      </button>
    </div>

    <!-- Target rate -->
    <div v-if="primary !== null" class="border-t border-white/8 pt-5">
      <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-2">
        What's your target rate of change? (optional)
      </label>
      <input
        v-model.number="desiredRateKgPerWeek"
        type="number"
        step="0.1"
        min="0"
        max="2"
        placeholder="kg / week"
        class="w-full h-12 px-4 bg-surface-input border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
      />
      <p class="text-xs text-text-muted mt-2">
        We'll adjust this if it seems too aggressive.
      </p>
    </div>
  </div>
</template>
