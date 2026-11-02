import { defineStore } from 'pinia'
import { ref } from 'vue'
import { computeCalories, emptyScenario } from '../utils/calorieCalc'
import type { WizardAnswers, CalorieResults } from '../utils/calorieCalc'

function makeEmptyResults(): CalorieResults {
  return {
    completed: false,
    bmr: 0,
    tdeeRange: { low: 0, high: 0 },
    tdeeSource: 'theoretical',
    scenarios: {
      loss: emptyScenario(),
      maintenance: emptyScenario(),
      gain: emptyScenario(),
      recomp: emptyScenario(),
    },
    macros: {
      proteinGRange: { low: 0, high: 0 },
      fatGRange: { low: 0, high: 0 },
      carbGRange: { low: 0, high: 0 },
    },
    safetyFlags: [],
  }
}

export const useCalorieStore = defineStore('calorie', () => {
  const answers = ref<Partial<WizardAnswers>>({})
  const results = ref<CalorieResults>(makeEmptyResults())

  function setStepData<K extends keyof WizardAnswers>(step: K, data: WizardAnswers[K]) {
    answers.value = { ...answers.value, [step]: data }
  }

  function compute() {
    const r = computeCalories(answers.value as WizardAnswers)
    results.value = { ...r, completed: true }
  }

  function reset() {
    answers.value = {}
    results.value = makeEmptyResults()
  }

  return { answers, results, setStepData, compute, reset }
})
