<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft } from '@lucide/vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import { useCalorieStore } from '../../stores/calorieStore'
import type { WizardAnswers } from '../../utils/calorieCalc'
import type { ComputedRef } from 'vue'

import StepBasicInfo from './calorie/steps/StepBasicInfo.vue'
import StepActivity from './calorie/steps/StepActivity.vue'
import StepTraining from './calorie/steps/StepTraining.vue'
import StepHistory from './calorie/steps/StepHistory.vue'
import StepHealth from './calorie/steps/StepHealth.vue'
import StepGoal from './calorie/steps/StepGoal.vue'

interface StepExpose {
  isValid: ComputedRef<boolean>
  getData(): WizardAnswers[keyof WizardAnswers]
}

const router = useRouter()
const calorieStore = useCalorieStore()

const STEPS = ['Basic Info', 'Daily Activity', 'Training', 'Weight History', 'Health', 'Goal']
const currentStep = ref(1)
const currentStepRef = ref<StepExpose | null>(null)

const stepComponents = [StepBasicInfo, StepActivity, StepTraining, StepHistory, StepHealth, StepGoal]
const stepKeys: (keyof WizardAnswers)[] = ['profile', 'activity', 'training', 'history', 'health', 'goal']

const stepIsValid = ref(false)
watch(currentStep, () => { stepIsValid.value = false })
const canProceed = computed(() => stepIsValid.value)

function stepInitialData(step: number): WizardAnswers[keyof WizardAnswers] | undefined {
  const key = stepKeys[step - 1]
  return (calorieStore.answers as Partial<WizardAnswers>)[key] as WizardAnswers[typeof key] | undefined
}

function handleBack() {
  if (currentStep.value === 1) {
    router.push('/tools')
  } else {
    currentStep.value--
  }
}

async function handleNext() {
  if (!canProceed.value) return
  const data = currentStepRef.value!.getData()
  calorieStore.setStepData(stepKeys[currentStep.value - 1], data as WizardAnswers[keyof WizardAnswers])

  if (currentStep.value === 6) {
    calorieStore.compute()
    router.push('/tools/calorie-calculator/results')
  } else {
    currentStep.value++
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-lg mx-auto">
      <!-- Back + title -->
      <div class="pt-2 pb-6 flex items-center gap-3">
        <button
          class="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          @click="handleBack"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted">Tools</p>
          <h1 class="text-2xl font-black text-text-primary dark:text-white">Calorie Calculator</h1>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="mb-2 flex items-center justify-between">
        <span class="text-xs font-semibold text-text-muted">Step {{ currentStep }} of {{ STEPS.length }}</span>
        <span class="text-xs font-semibold text-text-muted">{{ STEPS[currentStep - 1] }}</span>
      </div>
      <div class="w-full h-1.5 bg-white/8 rounded-full mb-8 overflow-hidden">
        <div
          class="h-full bg-primary rounded-full transition-all duration-300"
          :style="{ width: `${(currentStep / STEPS.length) * 100}%` }"
        />
      </div>

      <!-- Active step component -->
      <component
        :is="stepComponents[currentStep - 1]"
        ref="currentStepRef"
        :initial="stepInitialData(currentStep)"
        @valid="stepIsValid = $event"
      />

      <!-- Navigation -->
      <div class="mt-8 flex gap-3">
        <button
          v-if="currentStep > 1"
          class="h-12 px-6 bg-surface-card border border-white/8 text-text-muted font-semibold text-sm rounded-2xl hover:border-white/20 hover:text-text-primary transition-all"
          @click="handleBack"
        >
          Back
        </button>
        <button
          class="flex-1 h-12 bg-primary text-white font-bold text-sm rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
          :disabled="!canProceed"
          @click="handleNext"
        >
          {{ currentStep === 6 ? 'See Results' : 'Next' }}
        </button>
      </div>
    </div>
  </AppLayout>
</template>
