<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RadioGroup, RadioGroupOption, Switch } from '@headlessui/vue'
import { Check } from '@lucide/vue'
import type { WizardAnswers, WeightTrend } from '../../../../utils/calorieCalc'

const props = defineProps<{
  initial?: WizardAnswers['history']
}>()

const weightTrend = ref<WeightTrend | null>(props.initial?.weightTrend ?? null)
const recentWeightChangeKg = ref<number | null>(props.initial?.recentWeightChangeKg ?? null)
const tracksCalories = ref<boolean>(props.initial?.tracksCalories ?? false)
const avgDailyKcal = ref<number | null>(props.initial?.avgDailyKcal ?? null)
const trackingDurationWeeks = ref<number | null>(props.initial?.trackingDurationWeeks ?? null)
const weighFrequency = ref<'daily' | 'few_per_week' | 'weekly' | 'rarely' | null>(
  props.initial?.weighFrequency ?? null,
)
const consistentConditions = ref<boolean>(props.initial?.consistentConditions ?? false)

const isValid = computed<boolean>(() => weightTrend.value !== null)

function getData(): WizardAnswers['history'] {
  return {
    weightTrend: weightTrend.value!,
    ...(recentWeightChangeKg.value !== null ? { recentWeightChangeKg: recentWeightChangeKg.value } : {}),
    tracksCalories: tracksCalories.value,
    ...(tracksCalories.value && avgDailyKcal.value !== null ? { avgDailyKcal: avgDailyKcal.value } : {}),
    ...(tracksCalories.value && trackingDurationWeeks.value !== null
      ? { trackingDurationWeeks: trackingDurationWeeks.value }
      : {}),
    ...(tracksCalories.value && weighFrequency.value !== null
      ? { weighFrequency: weighFrequency.value }
      : {}),
    ...(tracksCalories.value ? { consistentConditions: consistentConditions.value } : {}),
  }
}

const emit = defineEmits<{ valid: [boolean] }>()
watch(isValid, (v) => emit('valid', v))
onMounted(() => emit('valid', isValid.value))

defineExpose({ isValid, getData })

const trendOptions: { value: WeightTrend; label: string; description: string }[] = [
  { value: 'stable', label: 'Stable', description: 'Weight has not changed much' },
  { value: 'increasing', label: 'Increasing', description: 'Generally trending upward' },
  { value: 'decreasing', label: 'Decreasing', description: 'Generally trending downward' },
]

const weighFrequencyOptions: { value: 'daily' | 'few_per_week' | 'weekly' | 'rarely'; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'few_per_week', label: 'A few times a week' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'rarely', label: 'Rarely' },
]
</script>

<template>
  <div class="bg-surface-card border border-white/8 rounded-2xl p-6 space-y-8">
    <div>
      <h2 class="text-lg font-bold text-text-primary dark:text-white mb-1">Weight History</h2>
      <p class="text-sm text-text-muted">Sharing your recent history helps us calibrate your TDEE estimate.</p>
    </div>

    <!-- Weight trend -->
    <div>
      <label class="block text-sm font-semibold text-text-primary dark:text-white mb-1">Weight trend over the last 4–8 weeks</label>
      <p class="text-xs text-text-muted mb-3">How has your weight been moving recently?</p>
      <RadioGroup v-model="weightTrend">
        <div class="space-y-2">
          <RadioGroupOption
            v-for="opt in trendOptions"
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

    <!-- Recent weight change -->
    <div>
      <label class="block text-sm font-semibold text-text-primary dark:text-white mb-1">Weight change in past 4 weeks <span class="font-normal text-text-muted">(optional)</span></label>
      <p class="text-xs text-text-muted mb-2">Negative = loss, positive = gain</p>
      <div class="relative">
        <input
          v-model.number="recentWeightChangeKg"
          type="number"
          step="0.1"
          min="-20"
          max="20"
          placeholder="e.g. -1.5"
          class="w-full h-12 px-4 pr-16 bg-surface-input border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
        />
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">kg</span>
      </div>
    </div>

    <!-- Tracks calories switch -->
    <div class="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
      <div>
        <p class="text-sm font-semibold text-text-primary dark:text-white">Do you track calories?</p>
        <p class="text-xs text-text-muted mt-0.5">Logging food intake in an app or manually</p>
      </div>
      <Switch
        v-model="tracksCalories"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :class="tracksCalories ? 'bg-primary' : 'bg-white/10'"
      >
        <span
          class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
          :class="tracksCalories ? 'translate-x-6' : 'translate-x-1'"
        />
      </Switch>
    </div>

    <!-- Calorie tracking details -->
    <div v-if="tracksCalories" class="bg-white/[0.03] border border-white/8 rounded-xl p-4 space-y-5">
      <p class="text-xs font-semibold text-text-muted">Tracking details</p>

      <!-- Avg daily kcal -->
      <div>
        <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Average daily intake</label>
        <div class="relative">
          <input
            v-model.number="avgDailyKcal"
            type="number"
            min="500"
            max="10000"
            placeholder="e.g. 2200"
            class="w-full h-12 px-4 pr-16 bg-surface-input border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">kcal</span>
        </div>
      </div>

      <!-- How long tracking -->
      <div>
        <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">How long have you been tracking?</label>
        <div class="relative">
          <input
            v-model.number="trackingDurationWeeks"
            type="number"
            min="1"
            max="520"
            placeholder="e.g. 4"
            class="w-full h-12 px-4 pr-16 bg-surface-input border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">wks</span>
        </div>
      </div>

      <!-- Weigh frequency -->
      <div>
        <label class="block text-sm font-semibold text-text-primary dark:text-white mb-1">How often do you weigh yourself?</label>
        <p class="text-xs text-text-muted mb-3">Helps us assess the quality of your tracking data</p>
        <RadioGroup v-model="weighFrequency">
          <div class="grid grid-cols-2 gap-2">
            <RadioGroupOption
              v-for="opt in weighFrequencyOptions"
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

      <!-- Consistent conditions switch -->
      <div class="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
        <div>
          <p class="text-sm font-semibold text-text-primary dark:text-white">Consistent conditions?</p>
          <p class="text-xs text-text-muted mt-0.5">Same time of day, same state (e.g. fasted)</p>
        </div>
        <Switch
          v-model="consistentConditions"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :class="consistentConditions ? 'bg-primary' : 'bg-white/10'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
            :class="consistentConditions ? 'translate-x-6' : 'translate-x-1'"
          />
        </Switch>
      </div>
    </div>
  </div>
</template>
