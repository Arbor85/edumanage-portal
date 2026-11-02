<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Switch } from '@headlessui/vue'
import type { WizardAnswers } from '../../../../utils/calorieCalc'

const props = defineProps<{
  initial?: WizardAnswers['health']
}>()

const isMinor = ref<boolean>(props.initial?.isMinor ?? false)
const isPregnantOrBreastfeeding = ref<boolean>(props.initial?.isPregnantOrBreastfeeding ?? false)
const hasEatingDisorder = ref<boolean>(props.initial?.hasEatingDisorder ?? false)
const hasMetabolicCondition = ref<boolean>(props.initial?.hasMetabolicCondition ?? false)
const unexplainedWeightChanges = ref<boolean>(props.initial?.unexplainedWeightChanges ?? false)

const isValid = computed<boolean>(() => true)

function getData(): WizardAnswers['health'] {
  return {
    isMinor: isMinor.value,
    isPregnantOrBreastfeeding: isPregnantOrBreastfeeding.value,
    hasEatingDisorder: hasEatingDisorder.value,
    hasMetabolicCondition: hasMetabolicCondition.value,
    unexplainedWeightChanges: unexplainedWeightChanges.value,
  }
}

const emit = defineEmits<{ valid: [boolean] }>()
watch(isValid, (v) => emit('valid', v))
onMounted(() => emit('valid', isValid.value))

defineExpose({ isValid, getData })
</script>

<template>
  <div class="bg-surface-card border border-white/8 rounded-2xl p-6 space-y-6">
    <div>
      <h2 class="text-lg font-bold text-text-primary dark:text-white mb-1">A few quick health questions</h2>
      <p class="text-sm text-text-muted">These help us keep recommendations safe. All are optional.</p>
    </div>

    <div class="bg-surface-input border border-white/8 rounded-xl divide-y divide-white/8">
      <!-- Under 18 -->
      <div class="flex items-center justify-between px-4 py-4">
        <div>
          <p class="text-sm font-semibold text-text-primary dark:text-white">Are you under 18 years old?</p>
          <p class="text-xs text-text-muted mt-0.5">Calorie needs differ for adolescents</p>
        </div>
        <Switch
          v-model="isMinor"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :class="isMinor ? 'bg-primary' : 'bg-white/10'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
            :class="isMinor ? 'translate-x-6' : 'translate-x-1'"
          />
        </Switch>
      </div>

      <!-- Pregnant or breastfeeding -->
      <div class="flex items-center justify-between px-4 py-4">
        <div>
          <p class="text-sm font-semibold text-text-primary dark:text-white">Are you pregnant or breastfeeding?</p>
          <p class="text-xs text-text-muted mt-0.5">Significant impact on caloric needs</p>
        </div>
        <Switch
          v-model="isPregnantOrBreastfeeding"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :class="isPregnantOrBreastfeeding ? 'bg-primary' : 'bg-white/10'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
            :class="isPregnantOrBreastfeeding ? 'translate-x-6' : 'translate-x-1'"
          />
        </Switch>
      </div>

      <!-- Eating disorder -->
      <div class="flex items-center justify-between px-4 py-4">
        <div>
          <p class="text-sm font-semibold text-text-primary dark:text-white">History of eating disorders?</p>
          <p class="text-xs text-text-muted mt-0.5">Calorie targets may need professional guidance</p>
        </div>
        <Switch
          v-model="hasEatingDisorder"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :class="hasEatingDisorder ? 'bg-primary' : 'bg-white/10'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
            :class="hasEatingDisorder ? 'translate-x-6' : 'translate-x-1'"
          />
        </Switch>
      </div>

      <!-- Metabolic condition -->
      <div class="flex items-center justify-between px-4 py-4">
        <div>
          <p class="text-sm font-semibold text-text-primary dark:text-white">Metabolic condition or medication?</p>
          <p class="text-xs text-text-muted mt-0.5">Conditions or meds that significantly affect metabolism</p>
        </div>
        <Switch
          v-model="hasMetabolicCondition"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :class="hasMetabolicCondition ? 'bg-primary' : 'bg-white/10'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
            :class="hasMetabolicCondition ? 'translate-x-6' : 'translate-x-1'"
          />
        </Switch>
      </div>

      <!-- Unexplained weight changes -->
      <div class="flex items-center justify-between px-4 py-4">
        <div>
          <p class="text-sm font-semibold text-text-primary dark:text-white">Unexplained weight changes recently?</p>
          <p class="text-xs text-text-muted mt-0.5">Changes not explained by diet or exercise</p>
        </div>
        <Switch
          v-model="unexplainedWeightChanges"
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :class="unexplainedWeightChanges ? 'bg-primary' : 'bg-white/10'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
            :class="unexplainedWeightChanges ? 'translate-x-6' : 'translate-x-1'"
          />
        </Switch>
      </div>
    </div>
  </div>
</template>
