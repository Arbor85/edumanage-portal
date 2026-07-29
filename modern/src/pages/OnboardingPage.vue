<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { updateProfile } from '../services/userProfileService'
import OnboardingLayout from '../components/layout/OnboardingLayout.vue'
import type { OnboardingGoal, OnboardingExperience, OnboardingEquipment } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1)
const totalSteps = 4
const saving = ref(false)

// Step 1 — Goal
const goal = ref<OnboardingGoal | null>(null)
const goals: { value: OnboardingGoal; label: string; emoji: string; sub: string }[] = [
  { value: 'muscle',         label: 'Build muscle',        emoji: '💪', sub: 'Get stronger and bigger' },
  { value: 'weight_loss',    label: 'Lose weight',         emoji: '🔥', sub: 'Burn fat and get lean' },
  { value: 'active',         label: 'Stay active',         emoji: '⚡', sub: 'Keep moving and feel good' },
  { value: 'follow_trainer', label: "Follow my trainer's plan", emoji: '🎯', sub: 'Let my coach guide me' },
]

// Step 2 — Experience
const experience = ref<OnboardingExperience | null>(null)
const experiences: { value: OnboardingExperience; label: string; sub: string }[] = [
  { value: 'beginner',     label: 'Beginner',     sub: 'Less than 1 year of training' },
  { value: 'intermediate', label: 'Intermediate', sub: '1–3 years of training' },
  { value: 'advanced',     label: 'Advanced',     sub: '3+ years of training' },
]

// Step 3 — Equipment
const equipment = ref<OnboardingEquipment[]>([])
const equipmentOptions: { value: OnboardingEquipment; label: string; sub: string; emoji: string }[] = [
  { value: 'none',      label: 'No equipment',    sub: 'Bodyweight only',              emoji: '🏠' },
  { value: 'dumbbells', label: 'Dumbbells',        sub: 'Free weights at home or gym',  emoji: '🏋️' },
  { value: 'barbell',   label: 'Barbell & rack',   sub: 'Full free weight setup',       emoji: '🔩' },
  { value: 'full_gym',  label: 'Full gym access',  sub: 'All machines and equipment',   emoji: '🏟️' },
]

function toggleEquipment(val: OnboardingEquipment) {
  if (val === 'none') {
    equipment.value = equipment.value.includes('none') ? [] : ['none']
    return
  }
  const idx = equipment.value.indexOf(val)
  if (idx >= 0) {
    equipment.value.splice(idx, 1)
  } else {
    equipment.value = equipment.value.filter(e => e !== 'none')
    equipment.value.push(val)
  }
}

// Step 4 — Reminder
const reminderEnabled = ref(false)
const reminderTime = ref('08:00')

const canContinue = computed(() => {
  if (step.value === 1) return goal.value !== null
  if (step.value === 2) return experience.value !== null
  if (step.value === 3) return equipment.value.length > 0
  return true // step 4 is always skippable
})

const continueLabel = computed(() => {
  if (step.value === totalSteps) return 'Start training'
  return 'Continue'
})

function back() {
  if (step.value > 1) step.value--
}

async function next() {
  if (step.value < totalSteps) {
    step.value++
    return
  }
  // Final step — save and enter app
  saving.value = true
  try {
    const profile = await updateProfile({
      goal: goal.value!,
      experience: experience.value!,
      equipment: equipment.value,
      reminderTime: reminderEnabled.value ? reminderTime.value : null,
      onboardingComplete: true,
    })
    if (profile) authStore.setProfile(profile)
    router.push('/')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <OnboardingLayout
    :step="step"
    :total-steps="totalSteps"
    :can-go-back="step > 1"
    :can-continue="canContinue"
    :continue-label="continueLabel"
    :loading="saving"
    @back="back"
    @next="next"
  >
    <!-- Step 1 — Goal -->
    <template v-if="step === 1">
      <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-3">Step 1 of 4</p>
      <h1 class="text-4xl font-black text-white mb-2">What's your goal?</h1>
      <p class="text-text-secondary mb-8">We'll personalise your experience around it.</p>
      <div class="flex flex-col gap-3">
        <button
          v-for="g in goals"
          :key="g.value"
          class="flex items-center gap-4 p-4 rounded-2xl border text-left transition-all active:scale-[0.98]"
          :class="goal === g.value
            ? 'border-primary bg-primary/10 shadow-glow'
            : 'border-white/10 bg-surface-card hover:border-white/20 hover:bg-surface-elevated'"
          @click="goal = g.value"
        >
          <span class="text-2xl flex-shrink-0">{{ g.emoji }}</span>
          <div class="flex-1">
            <p class="font-bold text-white">{{ g.label }}</p>
            <p class="text-sm text-text-secondary">{{ g.sub }}</p>
          </div>
          <div
            class="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all"
            :class="goal === g.value ? 'border-primary bg-primary' : 'border-white/20'"
          />
        </button>
      </div>
    </template>

    <!-- Step 2 — Experience -->
    <template v-else-if="step === 2">
      <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-3">Step 2 of 4</p>
      <h1 class="text-4xl font-black text-white mb-2">Your experience?</h1>
      <p class="text-text-secondary mb-8">We use this to calibrate workout intensity.</p>
      <div class="flex flex-col gap-3">
        <button
          v-for="e in experiences"
          :key="e.value"
          class="flex items-center gap-4 p-4 rounded-2xl border text-left transition-all active:scale-[0.98]"
          :class="experience === e.value
            ? 'border-primary bg-primary/10 shadow-glow'
            : 'border-white/10 bg-surface-card hover:border-white/20 hover:bg-surface-elevated'"
          @click="experience = e.value"
        >
          <div class="flex-1">
            <p class="font-bold text-white">{{ e.label }}</p>
            <p class="text-sm text-text-secondary">{{ e.sub }}</p>
          </div>
          <div
            class="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all"
            :class="experience === e.value ? 'border-primary bg-primary' : 'border-white/20'"
          />
        </button>
      </div>
    </template>

    <!-- Step 3 — Equipment -->
    <template v-else-if="step === 3">
      <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-3">Step 3 of 4</p>
      <h1 class="text-4xl font-black text-white mb-2">What do you have access to?</h1>
      <p class="text-text-secondary mb-8">Select all that apply — we'll filter workouts accordingly.</p>
      <div class="flex flex-col gap-3">
        <button
          v-for="e in equipmentOptions"
          :key="e.value"
          class="flex items-center gap-4 p-4 rounded-2xl border text-left transition-all active:scale-[0.98]"
          :class="equipment.includes(e.value)
            ? 'border-primary bg-primary/10 shadow-glow'
            : 'border-white/10 bg-surface-card hover:border-white/20 hover:bg-surface-elevated'"
          @click="toggleEquipment(e.value)"
        >
          <span class="text-2xl flex-shrink-0">{{ e.emoji }}</span>
          <div class="flex-1">
            <p class="font-bold text-white">{{ e.label }}</p>
            <p class="text-sm text-text-secondary">{{ e.sub }}</p>
          </div>
          <div
            class="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
            :class="equipment.includes(e.value) ? 'border-primary bg-primary' : 'border-white/20'"
          >
            <svg v-if="equipment.includes(e.value)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
              <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </button>
      </div>
    </template>

    <!-- Step 4 — Reminder -->
    <template v-else>
      <p class="text-xs font-bold tracking-widest uppercase text-text-muted mb-3">Step 4 of 4</p>
      <h1 class="text-4xl font-black text-white mb-2">Daily reminder?</h1>
      <p class="text-text-secondary mb-8">Get a nudge when it's time to move. You can change this anytime.</p>

      <div class="flex flex-col gap-4">
        <button
          class="flex items-center gap-4 p-4 rounded-2xl border text-left transition-all active:scale-[0.98]"
          :class="reminderEnabled
            ? 'border-primary bg-primary/10 shadow-glow'
            : 'border-white/10 bg-surface-card hover:border-white/20'"
          @click="reminderEnabled = !reminderEnabled"
        >
          <span class="text-2xl">⏰</span>
          <div class="flex-1">
            <p class="font-bold text-white">Set a reminder</p>
            <p class="text-sm text-text-secondary">Pick your preferred workout time</p>
          </div>
          <div
            class="w-11 h-6 rounded-full transition-all relative flex-shrink-0"
            :class="reminderEnabled ? 'bg-primary' : 'bg-white/10'"
          >
            <div
              class="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
              :class="reminderEnabled ? 'left-[22px]' : 'left-0.5'"
            />
          </div>
        </button>

        <Transition name="reminder">
          <div v-if="reminderEnabled" class="p-4 rounded-2xl bg-surface-card border border-white/10">
            <label class="block text-sm font-medium text-text-secondary mb-2">Reminder time</label>
            <input
              v-model="reminderTime"
              type="time"
              class="w-full px-4 py-3 rounded-xl bg-surface-input border border-white/10 text-white text-lg font-bold text-center focus-visible:ring-2 focus-visible:ring-primary outline-none"
            />
          </div>
        </Transition>

        <button
          class="text-sm text-text-muted hover:text-text-secondary transition-colors py-2"
          @click="reminderEnabled = false; next()"
        >
          Skip for now
        </button>
      </div>
    </template>
  </OnboardingLayout>
</template>

<style scoped>
.reminder-enter-active,
.reminder-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.reminder-enter-from,
.reminder-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
