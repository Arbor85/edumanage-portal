<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
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
  <div class="bg-surface-card border border-white/8 rounded-2xl p-6 space-y-6">
    <div>
      <h2 class="text-lg font-bold text-text-primary dark:text-white mb-1">Weight History</h2>
      <p class="text-sm text-text-muted">Sharing your recent history helps us calibrate your TDEE estimate.</p>
    </div>

    <!-- Weight trend -->
    <div>
      <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-3">
        Weight trend over the last 4â€“8 weeks
      </label>
      <div class="space-y-2">
        <button
          v-for="opt in trendOptions"
          :key="opt.value"
          type="button"
          class="w-full text-left px-4 py-3 rounded-xl border transition-all"
          :class="
            weightTrend === opt.value
              ? 'bg-primary/10 border-primary/40 text-primary'
              : 'bg-surface-input border-white/8 text-text-secondary hover:border-white/20 hover:text-text-primary'
          "
          @click="weightTrend = opt.value"
        >
          <div class="text-sm font-semibold">{{ opt.label }}</div>
          <div class="text-xs mt-0.5 opacity-70">{{ opt.description }}</div>
        </button>
      </div>
    </div>

    <!-- Recent weight change -->
    <div>
      <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-2">
        Approximate weight change in the last 4 weeks (kg, negative = loss) â€” optional
      </label>
      <input
        v-model.number="recentWeightChangeKg"
        type="number"
        step="0.1"
        min="-20"
        max="20"
        placeholder="e.g. -1.5"
        class="w-full h-12 px-4 bg-surface-input border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
      />
    </div>

    <!-- Tracks calories -->
    <div>
      <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-3">
        Do you track your daily calorie intake?
      </label>
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          class="w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium"
          :class="
            tracksCalories
              ? 'bg-primary/10 border-primary/40 text-primary'
              : 'bg-surface-input border-white/8 text-text-secondary hover:border-white/20 hover:text-text-primary'
          "
          @click="tracksCalories = true"
        >
          Yes
        </button>
        <button
          type="button"
          class="w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium"
          :class="
            !tracksCalories
              ? 'bg-primary/10 border-primary/40 text-primary'
              : 'bg-surface-input border-white/8 text-text-secondary hover:border-white/20 hover:text-text-primary'
          "
          @click="tracksCalories = false"
        >
          No
        </button>
      </div>
    </div>

    <!-- Calorie tracking details -->
    <div v-if="tracksCalories" class="space-y-5 border-t border-white/8 pt-5">
      <p class="text-xs font-bold tracking-widest uppercase text-text-muted">Tracking details</p>

      <!-- Avg daily kcal -->
      <div>
        <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-2">
          Average daily intake (kcal)
        </label>
        <input
          v-model.number="avgDailyKcal"
          type="number"
          min="500"
          max="10000"
          placeholder="e.g. 2200"
          class="w-full h-12 px-4 bg-surface-input border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
        />
      </div>

      <!-- How long tracking -->
      <div>
        <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-2">
          How long have you been tracking? (weeks)
        </label>
        <input
          v-model.number="trackingDurationWeeks"
          type="number"
          min="1"
          max="520"
          placeholder="e.g. 4"
          class="w-full h-12 px-4 bg-surface-input border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
        />
      </div>

      <!-- Weigh frequency -->
      <div>
        <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-3">
          How often do you weigh yourself?
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="opt in weighFrequencyOptions"
            :key="opt.value"
            type="button"
            class="w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium"
            :class="
              weighFrequency === opt.value
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-surface-input border-white/8 text-text-secondary hover:border-white/20 hover:text-text-primary'
            "
            @click="weighFrequency = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Consistent conditions -->
      <div>
        <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-3">
          Do you weigh yourself under consistent conditions (same time of day, same state)?
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium"
            :class="
              consistentConditions
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-surface-input border-white/8 text-text-secondary hover:border-white/20 hover:text-text-primary'
            "
            @click="consistentConditions = true"
          >
            Yes
          </button>
          <button
            type="button"
            class="w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium"
            :class="
              !consistentConditions
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-surface-input border-white/8 text-text-secondary hover:border-white/20 hover:text-text-primary'
            "
            @click="consistentConditions = false"
          >
            No
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
