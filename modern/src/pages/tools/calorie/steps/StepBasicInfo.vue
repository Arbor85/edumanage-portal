<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { Check, ChevronDown, Mars, Venus } from '@lucide/vue'
import type { WizardAnswers, Sex } from '../../../../utils/calorieCalc'

const props = defineProps<{
  initial?: WizardAnswers['profile']
}>()

const age = ref<number | null>(props.initial?.age ?? null)
const sex = ref<Sex | null>(props.initial?.sex ?? null)
const heightCm = ref<number | null>(props.initial?.heightCm ?? null)
const weightKg = ref<number | null>(props.initial?.weightKg ?? null)
const waistCm = ref<number | null>(props.initial?.waistCm ?? null)
const bodyFatPct = ref<number | null>(props.initial?.bodyFatPct ?? null)
const bodyFatMethod = ref<string>(props.initial?.bodyFatMethod ?? '')

const isValid = computed<boolean>(() => {
  return (
    age.value !== null &&
    age.value >= 15 &&
    age.value <= 100 &&
    sex.value !== null &&
    heightCm.value !== null &&
    heightCm.value > 0 &&
    weightKg.value !== null &&
    weightKg.value > 0
  )
})

function getData(): WizardAnswers['profile'] {
  return {
    age: age.value!,
    sex: sex.value!,
    heightCm: heightCm.value!,
    weightKg: weightKg.value!,
    ...(waistCm.value !== null ? { waistCm: waistCm.value } : {}),
    ...(bodyFatPct.value !== null ? { bodyFatPct: bodyFatPct.value } : {}),
    ...(bodyFatPct.value !== null && bodyFatMethod.value
      ? { bodyFatMethod: bodyFatMethod.value }
      : {}),
  }
}

const emit = defineEmits<{ valid: [boolean] }>()
watch(isValid, (v) => emit('valid', v))
onMounted(() => emit('valid', isValid.value))

defineExpose({ isValid, getData })

const measurementMethods = [
  'DEXA scan',
  'Calipers (skinfold)',
  'Bioelectrical impedance (BIA)',
  'Hydrostatic weighing',
  'Bod Pod (air displacement)',
  'Visual estimate',
  'Other',
]
</script>

<template>
  <div class="bg-surface-card border border-white/8 rounded-2xl p-6 space-y-8">
    <div>
      <h2 class="text-lg font-bold text-text-primary dark:text-white mb-1">Basic Information</h2>
      <p class="text-sm text-text-muted">Tell us a bit about yourself so we can estimate your metabolic rate.</p>
    </div>

    <!-- Age -->
    <div>
      <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Age</label>
      <div class="relative">
        <input
          v-model.number="age"
          type="number"
          min="15"
          max="100"
          placeholder="e.g. 30"
          class="w-full h-12 px-4 pr-16 bg-surface-input border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
        />
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">yrs</span>
      </div>
    </div>

    <!-- Sex -->
    <div>
      <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Biological Sex</label>
      <div class="flex rounded-xl overflow-hidden border border-white/8">
        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all"
          :class="sex === 'male'
            ? 'bg-primary/15 text-primary border-r border-primary/20'
            : 'bg-surface-input text-text-secondary hover:text-text-primary border-r border-white/8'"
          @click="sex = 'male'"
        >
          <Mars class="w-4 h-4" />
          Male
        </button>
        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all"
          :class="sex === 'female'
            ? 'bg-primary/15 text-primary'
            : 'bg-surface-input text-text-secondary hover:text-text-primary'"
          @click="sex = 'female'"
        >
          <Venus class="w-4 h-4" />
          Female
        </button>
      </div>
    </div>

    <!-- Height -->
    <div>
      <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Height</label>
      <div class="relative">
        <input
          v-model.number="heightCm"
          type="number"
          min="100"
          max="250"
          placeholder="e.g. 175"
          class="w-full h-12 px-4 pr-16 bg-surface-input border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
        />
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">cm</span>
      </div>
    </div>

    <!-- Weight -->
    <div>
      <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Weight</label>
      <div class="relative">
        <input
          v-model.number="weightKg"
          type="number"
          min="30"
          max="300"
          placeholder="e.g. 75"
          class="w-full h-12 px-4 pr-16 bg-surface-input border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
        />
        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">kg</span>
      </div>
    </div>

    <!-- Optional section -->
    <div class="bg-white/[0.03] border border-white/8 rounded-xl p-4 space-y-5">
      <p class="text-xs font-semibold text-text-muted">Optional — skip if unknown</p>

      <!-- Waist -->
      <div>
        <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Waist circumference</label>
        <p class="text-xs text-text-muted mb-2">Used for body composition estimates</p>
        <div class="relative">
          <input
            v-model.number="waistCm"
            type="number"
            min="40"
            max="200"
            placeholder="e.g. 85"
            class="w-full h-12 px-4 pr-16 bg-surface-input border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">cm</span>
        </div>
      </div>

      <!-- Body fat % -->
      <div>
        <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Body fat %</label>
        <p class="text-xs text-text-muted mb-2">If provided, we'll use Katch-McArdle for a more accurate BMR.</p>
        <div class="relative">
          <input
            v-model.number="bodyFatPct"
            type="number"
            min="5"
            max="60"
            placeholder="e.g. 20"
            class="w-full h-12 px-4 pr-16 bg-surface-input border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">%</span>
        </div>
      </div>

      <!-- Body fat method -->
      <div v-if="bodyFatPct !== null">
        <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Measurement method</label>
        <Listbox v-model="bodyFatMethod">
          <div class="relative">
            <ListboxButton
              class="w-full flex items-center justify-between h-12 px-4 bg-surface-input border border-white/8 rounded-xl text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
              :class="bodyFatMethod ? 'text-text-primary dark:text-white' : 'text-text-muted'"
            >
              <span>{{ bodyFatMethod || 'Select method…' }}</span>
              <ChevronDown class="w-4 h-4 text-text-muted" />
            </ListboxButton>
            <ListboxOptions class="absolute z-50 mt-1 w-full bg-surface-card border border-white/10 rounded-xl shadow-lg overflow-hidden focus:outline-none">
              <ListboxOption
                v-for="method in measurementMethods"
                :key="method"
                :value="method"
                v-slot="{ active, selected }"
              >
                <div
                  class="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors"
                  :class="active ? 'bg-white/5' : ''"
                >
                  <span class="text-sm font-medium" :class="selected ? 'text-primary' : 'text-text-primary dark:text-white'">{{ method }}</span>
                  <Check v-if="selected" class="w-4 h-4 text-primary" />
                </div>
              </ListboxOption>
            </ListboxOptions>
          </div>
        </Listbox>
      </div>
    </div>
  </div>
</template>
