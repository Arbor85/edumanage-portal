<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
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

interface HealthQuestion {
  label: string
  ref: { value: boolean }
  setter: (v: boolean) => void
}

const questions: HealthQuestion[] = [
  {
    label: 'Are you under 18 years old?',
    ref: isMinor,
    setter: (v) => { isMinor.value = v },
  },
  {
    label: 'Are you pregnant or breastfeeding?',
    ref: isPregnantOrBreastfeeding,
    setter: (v) => { isPregnantOrBreastfeeding.value = v },
  },
  {
    label: 'Do you have a history of eating disorders?',
    ref: hasEatingDisorder,
    setter: (v) => { hasEatingDisorder.value = v },
  },
  {
    label: 'Do you have a medical condition or take medication that significantly affects your metabolism or weight?',
    ref: hasMetabolicCondition,
    setter: (v) => { hasMetabolicCondition.value = v },
  },
  {
    label: 'Have you experienced unexplained weight changes recently?',
    ref: unexplainedWeightChanges,
    setter: (v) => { unexplainedWeightChanges.value = v },
  },
]
</script>

<template>
  <div class="bg-surface-card border border-white/8 rounded-2xl p-6 space-y-6">
    <div>
      <h2 class="text-lg font-bold text-text-primary dark:text-white mb-1">A few quick health questions</h2>
      <p class="text-sm text-text-muted">These help us keep recommendations safe. All are optional.</p>
    </div>

    <div class="space-y-4">
      <div
        v-for="(q, i) in questions"
        :key="i"
        class="flex items-start justify-between gap-4 py-3 border-b border-white/8 last:border-0"
      >
        <span class="text-sm text-text-secondary flex-1 leading-relaxed">{{ q.label }}</span>
        <div class="flex gap-2 shrink-0">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all"
            :class="
              q.ref.value
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-surface-input border-white/8 text-text-muted hover:border-white/20'
            "
            @click="q.setter(true)"
          >
            Yes
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all"
            :class="
              !q.ref.value
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-surface-input border-white/8 text-text-muted hover:border-white/20'
            "
            @click="q.setter(false)"
          >
            No
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
