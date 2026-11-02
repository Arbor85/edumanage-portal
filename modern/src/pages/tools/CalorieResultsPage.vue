<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RotateCcw } from '@lucide/vue'
import AppLayout from '../../components/layout/AppLayout.vue'
import { useCalorieStore } from '../../stores/calorieStore'
import type { WizardAnswers } from '../../utils/calorieCalc'
import ScenarioTable from './calorie/components/ScenarioTable.vue'
import CalorieRangeChart from './calorie/components/CalorieRangeChart.vue'
import MacrosCard from './calorie/components/MacrosCard.vue'
import SafetyFlagsCard from './calorie/components/SafetyFlagsCard.vue'

const router = useRouter()
const store = useCalorieStore()

onMounted(() => {
  if (!store.results.completed) {
    router.replace('/tools/calorie-calculator')
  }
})

const results = computed(() => store.results)
const answers = computed(() => store.answers as WizardAnswers)

function recalculate() {
  store.reset()
  router.push('/tools/calorie-calculator')
}

const occupationLabels: Record<string, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  highly_active: 'Highly Active',
  very_highly_active: 'Very Highly Active',
}

const goalLabels: Record<string, string> = {
  loss: 'Weight Loss',
  maintenance: 'Maintenance',
  gain: 'Muscle Gain',
  recomp: 'Recomposition',
}

function occupationLabel(level: string): string {
  return occupationLabels[level] ?? level
}

function goalLabel(goal: string): string {
  return goalLabels[goal] ?? goal
}

const bmrEquationLabel = computed(() => {
  const bf = answers.value?.profile?.bodyFatPct
  if (bf !== undefined && bf > 5 && bf < 50) {
    return 'Katch-McArdle (lean body mass formula)'
  }
  return 'Mifflin-St Jeor'
})
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto pb-12">
      <!-- Header -->
      <div class="pt-2 pb-8 flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-1">Tools</p>
          <h1 class="text-3xl font-black text-text-primary dark:text-white">Calorie Calculator</h1>
        </div>
        <button
          class="mt-2 flex items-center gap-2 h-10 px-4 bg-surface-card border border-white/8 text-text-muted font-semibold text-sm rounded-xl hover:border-white/20 hover:text-text-primary active:scale-[0.98] transition-all"
          @click="recalculate"
        >
          <RotateCcw class="w-4 h-4" />
          Recalculate
        </button>
      </div>

      <div class="space-y-6">
        <!-- Safety flags (top prominence) -->
        <SafetyFlagsCard
          v-if="results.safetyFlags.length > 0"
          :flags="results.safetyFlags"
        />

        <!-- Profile summary card -->
        <div class="bg-surface-card border border-white/8 rounded-2xl p-6">
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-4">Your Profile</p>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1.5 rounded-full bg-surface-input border border-white/8 text-xs font-semibold text-text-secondary">
              {{ answers.profile?.age }} yrs
            </span>
            <span class="px-3 py-1.5 rounded-full bg-surface-input border border-white/8 text-xs font-semibold text-text-secondary capitalize">
              {{ answers.profile?.sex }}
            </span>
            <span class="px-3 py-1.5 rounded-full bg-surface-input border border-white/8 text-xs font-semibold text-text-secondary">
              {{ answers.profile?.heightCm }} cm
            </span>
            <span class="px-3 py-1.5 rounded-full bg-surface-input border border-white/8 text-xs font-semibold text-text-secondary">
              {{ answers.profile?.weightKg }} kg
            </span>
            <span
              v-if="answers.activity?.occupationLevel"
              class="px-3 py-1.5 rounded-full bg-surface-input border border-white/8 text-xs font-semibold text-text-secondary"
            >
              {{ occupationLabel(answers.activity.occupationLevel) }}
            </span>
            <span
              v-if="answers.goal?.primary"
              class="px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-xs font-bold text-primary"
            >
              Goal: {{ goalLabel(answers.goal.primary) }}
            </span>
          </div>
        </div>

        <!-- Metabolic card -->
        <div class="bg-surface-card border border-white/8 rounded-2xl p-6 space-y-5">
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted">Metabolic Estimates</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- BMR -->
            <div class="bg-surface-input border border-white/8 rounded-xl p-4">
              <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-1">BMR</p>
              <p class="text-2xl font-black text-text-primary dark:text-white">
                {{ results.bmr.toLocaleString() }}
                <span class="text-sm font-semibold text-text-muted">kcal/day</span>
              </p>
              <p class="text-xs text-text-muted mt-1">Basal metabolic rate at rest</p>
            </div>

            <!-- TDEE -->
            <div class="bg-surface-input border border-white/8 rounded-xl p-4">
              <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-1">TDEE</p>
              <p class="text-2xl font-black text-text-primary dark:text-white">
                {{ results.tdeeRange.low.toLocaleString() }}–{{ results.tdeeRange.high.toLocaleString() }}
                <span class="text-sm font-semibold text-text-muted">kcal/day</span>
              </p>
              <p class="text-xs text-text-muted mt-1">Total daily energy expenditure</p>
            </div>
          </div>

          <!-- Source badge -->
          <div class="flex items-center gap-2">
            <span
              class="text-xs px-3 py-1 rounded-full font-bold border"
              :class="
                results.tdeeSource === 'history-calibrated'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-500 dark:text-amber-400'
                  : 'bg-primary/15 border-primary/30 text-primary'
              "
            >
              {{ results.tdeeSource === 'history-calibrated' ? 'Adjusted using calorie history' : 'Theoretical estimate' }}
            </span>
          </div>

          <!-- Explanation -->
          <p class="text-sm text-text-muted leading-relaxed">
            Your Total Daily Energy Expenditure (TDEE) is the total number of calories your body burns each day. It's
            presented as a range because individual variation, estimation error, and day-to-day fluctuations mean no single
            number is precise.
          </p>
        </div>

        <!-- Scenario table -->
        <div class="bg-surface-card border border-white/8 rounded-2xl p-6">
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-5">Calorie Scenarios</p>
          <ScenarioTable
            :scenarios="results.scenarios"
            :tdee-range="results.tdeeRange"
            :selected-goal="answers.goal?.primary ?? 'maintenance'"
          />
        </div>

        <!-- Bar chart -->
        <div class="bg-surface-card border border-white/8 rounded-2xl p-6">
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-5">Scenario Comparison</p>
          <CalorieRangeChart
            :scenarios="results.scenarios"
            :tdee-range="results.tdeeRange"
          />
        </div>

        <!-- Macros card -->
        <div class="bg-surface-card border border-white/8 rounded-2xl p-6">
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-5">Macro Targets</p>
          <MacrosCard
            :macros="results.macros"
            :goal="answers.goal?.primary ?? 'maintenance'"
          />
        </div>

        <!-- Methodology footer -->
        <div class="bg-surface-card border border-white/8 rounded-2xl p-6 space-y-3">
          <p class="text-xs font-bold tracking-widest uppercase text-text-muted">Methodology</p>
          <p class="text-sm text-text-muted leading-relaxed">
            BMR was calculated using the <span class="font-semibold text-text-secondary">{{ bmrEquationLabel }}</span> equation.
            NEAT (Non-Exercise Activity Thermogenesis) was estimated from your occupation level and daily step count.
            EAT (Exercise Activity Thermogenesis) was estimated using MET values for each training activity.
            A thermic effect of food factor (10%) was applied to the total.
            <span v-if="results.tdeeSource === 'history-calibrated'">
              Your TDEE estimate was partially calibrated using your reported calorie intake history (60% theoretical / 40% empirical blend).
            </span>
          </p>
          <p class="text-xs text-text-muted/70 leading-relaxed border-t border-white/8 pt-3">
            All values are estimates based on population averages and self-reported data. Individual metabolism varies
            significantly. This tool does not constitute medical or nutritional advice. Consult a qualified healthcare
            professional or registered dietitian before making significant dietary changes.
          </p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
