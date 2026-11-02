<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { Check } from '@lucide/vue'
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
  <div class="bg-surface-card border border-white/8 rounded-2xl p-6 space-y-8">
    <div>
      <h2 class="text-lg font-bold text-text-primary dark:text-white mb-1">Your Primary Goal</h2>
      <p class="text-sm text-text-muted">Choose the goal that best matches what you want to achieve right now.</p>
    </div>

    <!-- Goal selection -->
    <div>
      <label class="block text-sm font-semibold text-text-primary dark:text-white mb-1">What is your primary goal?</label>
      <p class="text-xs text-text-muted mb-3">This determines your calorie target direction</p>
      <RadioGroup v-model="primary">
        <div class="space-y-2">
          <RadioGroupOption
            v-for="opt in goalOptions"
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
                <p class="text-xs font-medium mt-0.5" :class="checked ? 'text-primary/80' : 'text-text-secondary'">{{ opt.sub }}</p>
                <p class="text-xs text-text-muted mt-0.5">{{ opt.description }}</p>
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

    <!-- Target rate -->
    <div v-if="primary !== null">
      <label class="block text-sm font-semibold text-text-primary dark:text-white mb-1">
        Target rate of change <span class="font-normal text-text-muted">(optional)</span>
      </label>
      <p class="text-xs text-text-muted mb-2">How fast do you want to change your weight?</p>
      <div class="relative">
        <input
          v-model.number="desiredRateKgPerWeek"
          type="number"
          step="0.1"
          min="0"
          max="2"
          placeholder="e.g. 0.5"
          class="w-full h-12 px-4 pr-20 bg-surface-input border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
        />
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">kg/wk</span>
      </div>
      <p class="text-xs text-text-muted mt-2">We'll cap this if it seems too aggressive.</p>
    </div>
  </div>
</template>
