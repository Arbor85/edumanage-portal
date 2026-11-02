<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { WizardAnswers, OccupationLevel, DailySteps } from '../../../../utils/calorieCalc'

const props = defineProps<{
  initial?: WizardAnswers['activity']
}>()

const occupationLevel = ref<OccupationLevel | null>(props.initial?.occupationLevel ?? null)
const dailySteps = ref<DailySteps | null>(props.initial?.dailySteps ?? null)

const isValid = computed<boolean>(() => occupationLevel.value !== null && dailySteps.value !== null)

function getData(): WizardAnswers['activity'] {
  return {
    occupationLevel: occupationLevel.value!,
    dailySteps: dailySteps.value!,
  }
}

const emit = defineEmits<{ valid: [boolean] }>()
watch(isValid, (v) => emit('valid', v))
onMounted(() => emit('valid', isValid.value))

defineExpose({ isValid, getData })

const occupationOptions: { value: OccupationLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Mostly desk work, minimal movement' },
  { value: 'lightly_active', label: 'Lightly Active', description: 'Occasional walking and standing' },
  { value: 'moderately_active', label: 'Moderately Active', description: 'Frequent walking throughout the day' },
  { value: 'highly_active', label: 'Highly Active', description: 'Physically demanding work' },
  { value: 'very_highly_active', label: 'Very Highly Active', description: 'Heavy physical labour' },
]

const stepsOptions: { value: DailySteps; label: string }[] = [
  { value: 'below_3k', label: 'Below 3,000' },
  { value: '3k_5k', label: '3,000â€“5,000' },
  { value: '5k_8k', label: '5,000â€“8,000' },
  { value: '8k_12k', label: '8,000â€“12,000' },
  { value: 'above_12k', label: 'Above 12,000' },
  { value: 'unknown', label: "I don't know" },
]
</script>

<template>
  <div class="bg-surface-card border border-white/8 rounded-2xl p-6 space-y-6">
    <div>
      <h2 class="text-lg font-bold text-text-primary dark:text-white mb-1">Daily Activity Level</h2>
      <p class="text-sm text-text-muted">How active are you during a typical day, outside of planned exercise?</p>
    </div>

    <!-- Occupation -->
    <div>
      <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-3">Occupation / Lifestyle</label>
      <div class="space-y-2">
        <button
          v-for="option in occupationOptions"
          :key="option.value"
          type="button"
          class="w-full text-left px-4 py-3 rounded-xl border transition-all"
          :class="
            occupationLevel === option.value
              ? 'bg-primary/10 border-primary/40 text-primary'
              : 'bg-surface-input border-white/8 text-text-secondary hover:border-white/20 hover:text-text-primary'
          "
          @click="occupationLevel = option.value"
        >
          <div class="text-sm font-semibold">{{ option.label }}</div>
          <div class="text-xs mt-0.5 opacity-70">{{ option.description }}</div>
        </button>
      </div>
    </div>

    <!-- Daily steps -->
    <div>
      <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-3">Average Daily Steps</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="option in stepsOptions"
          :key="option.value"
          type="button"
          class="w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium"
          :class="
            dailySteps === option.value
              ? 'bg-primary/10 border-primary/40 text-primary'
              : 'bg-surface-input border-white/8 text-text-secondary hover:border-white/20 hover:text-text-primary'
          "
          @click="dailySteps = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>
