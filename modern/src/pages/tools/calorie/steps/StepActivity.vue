<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { Check } from '@lucide/vue'
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
  { value: '3k_5k', label: '3,000–5,000' },
  { value: '5k_8k', label: '5,000–8,000' },
  { value: '8k_12k', label: '8,000–12,000' },
  { value: 'above_12k', label: 'Above 12,000' },
  { value: 'unknown', label: "I don't know" },
]
</script>

<template>
  <div class="bg-surface-card border border-white/8 rounded-2xl p-6 space-y-8">
    <div>
      <h2 class="text-lg font-bold text-text-primary dark:text-white mb-1">Daily Activity Level</h2>
      <p class="text-sm text-text-muted">How active are you during a typical day, outside of planned exercise?</p>
    </div>

    <!-- Occupation -->
    <div>
      <label class="block text-sm font-semibold text-text-primary dark:text-white mb-1">Occupation / Lifestyle</label>
      <p class="text-xs text-text-muted mb-3">Your general daily activity level outside of exercise</p>
      <RadioGroup v-model="occupationLevel">
        <div class="space-y-2">
          <RadioGroupOption
            v-for="opt in occupationOptions"
            :key="opt.value"
            :value="opt.value"
            v-slot="{ checked }"
          >
            <div
              class="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all"
              :class="checked
                ? 'bg-primary/10 border-primary/40'
                : 'bg-surface-input border-white/8 hover:border-white/20'"
            >
              <div class="flex-1">
                <p class="text-sm font-semibold" :class="checked ? 'text-primary' : 'text-text-primary dark:text-white'">{{ opt.label }}</p>
                <p v-if="opt.description" class="text-xs text-text-muted mt-0.5">{{ opt.description }}</p>
              </div>
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                :class="checked ? 'border-primary bg-primary' : 'border-white/20'"
              >
                <Check v-if="checked" class="w-3 h-3 text-white" />
              </div>
            </div>
          </RadioGroupOption>
        </div>
      </RadioGroup>
    </div>

    <!-- Daily steps -->
    <div>
      <label class="block text-sm font-semibold text-text-primary dark:text-white mb-1">Average Daily Steps</label>
      <p class="text-xs text-text-muted mb-3">Including all walking throughout the day</p>
      <RadioGroup v-model="dailySteps">
        <div class="grid grid-cols-2 gap-2">
          <RadioGroupOption
            v-for="opt in stepsOptions"
            :key="opt.value"
            :value="opt.value"
            v-slot="{ checked }"
          >
            <div
              class="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all"
              :class="checked
                ? 'bg-primary/10 border-primary/40'
                : 'bg-surface-input border-white/8 hover:border-white/20'"
            >
              <div class="flex-1">
                <p class="text-sm font-semibold" :class="checked ? 'text-primary' : 'text-text-primary dark:text-white'">{{ opt.label }}</p>
              </div>
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                :class="checked ? 'border-primary bg-primary' : 'border-white/20'"
              >
                <Check v-if="checked" class="w-3 h-3 text-white" />
              </div>
            </div>
          </RadioGroupOption>
        </div>
      </RadioGroup>
    </div>
  </div>
</template>
