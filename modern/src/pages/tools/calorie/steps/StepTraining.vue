<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { RadioGroup, RadioGroupOption, Switch } from '@headlessui/vue'
import { Check, Plus, X } from '@lucide/vue'
import type { WizardAnswers, TrainingActivity, ActivityType, Intensity } from '../../../../utils/calorieCalc'

const props = defineProps<{
  initial?: WizardAnswers['training']
}>()

const activities = ref<TrainingActivity[]>(props.initial?.activities ? [...props.initial.activities] : [])
const volumeVariesSignificantly = ref<boolean>(props.initial?.volumeVariesSignificantly ?? false)

// Inline form state
const showForm = ref(false)
const formType = ref<ActivityType | null>(null)
const formSessions = ref<number | null>(null)
const formDuration = ref<number | null>(null)
const formIntensity = ref<Intensity | null>(null)
const formVolumeKm = ref<number | null>(null)

const isValid = computed<boolean>(() => true)

function getData(): WizardAnswers['training'] {
  return {
    activities: activities.value,
    volumeVariesSignificantly: volumeVariesSignificantly.value,
  }
}

const emit = defineEmits<{ valid: [boolean] }>()
watch(isValid, (v) => emit('valid', v))
onMounted(() => emit('valid', isValid.value))

defineExpose({ isValid, getData })

const activityTypeOptions: { value: ActivityType; label: string }[] = [
  { value: 'running', label: 'Running' },
  { value: 'strength', label: 'Strength Training' },
  { value: 'cycling', label: 'Cycling' },
  { value: 'swimming', label: 'Swimming' },
  { value: 'walking', label: 'Walking' },
  { value: 'team_sports', label: 'Team Sports' },
  { value: 'other', label: 'Other' },
]

const intensityOptions: { value: Intensity; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'Conversational pace, little sweat' },
  { value: 'moderate', label: 'Moderate', description: 'Elevated heart rate, some effort' },
  { value: 'high', label: 'High', description: 'Pushing hard, heavy breathing' },
]

const showVolumeKm = computed(() => formType.value === 'running' || formType.value === 'cycling')

const canAddActivity = computed(() =>
  formType.value !== null &&
  formSessions.value !== null && formSessions.value >= 1 &&
  formDuration.value !== null && formDuration.value >= 10 &&
  formIntensity.value !== null,
)

function openForm() {
  formType.value = null
  formSessions.value = null
  formDuration.value = null
  formIntensity.value = null
  formVolumeKm.value = null
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
}

function addActivity() {
  if (!canAddActivity.value) return
  const newActivity: TrainingActivity = {
    id: crypto.randomUUID(),
    type: formType.value!,
    sessionsPerWeek: formSessions.value!,
    avgDurationMin: formDuration.value!,
    intensity: formIntensity.value!,
    ...(showVolumeKm.value && formVolumeKm.value !== null ? { weeklyVolumeKm: formVolumeKm.value } : {}),
  }
  activities.value.push(newActivity)
  showForm.value = false
}

function removeActivity(id: string) {
  activities.value = activities.value.filter((a) => a.id !== id)
}

function activityLabel(type: ActivityType): string {
  return activityTypeOptions.find((o) => o.value === type)?.label ?? type
}

function intensityLabel(intensity: Intensity): string {
  return intensityOptions.find((o) => o.value === intensity)?.label ?? intensity
}
</script>

<template>
  <div class="bg-surface-card border border-white/8 rounded-2xl p-6 space-y-6">
    <div>
      <h2 class="text-lg font-bold text-text-primary dark:text-white mb-1">Training Activities</h2>
      <p class="text-sm text-text-muted">Add your weekly exercise activities. Skip this step if you don't train regularly.</p>
    </div>

    <!-- Activity list -->
    <div v-if="activities.length > 0" class="space-y-2">
      <div
        v-for="act in activities"
        :key="act.id"
        class="flex items-center justify-between px-4 py-3 bg-surface-input border border-white/8 rounded-xl"
      >
        <div>
          <div class="text-sm font-semibold text-text-primary dark:text-white">
            {{ activityLabel(act.type) }}
          </div>
          <div class="text-xs text-text-muted mt-0.5">
            {{ act.sessionsPerWeek }}×/week · {{ act.avgDurationMin }} min · {{ intensityLabel(act.intensity) }}
            <span v-if="act.weeklyVolumeKm"> · {{ act.weeklyVolumeKm }} km/wk</span>
          </div>
        </div>
        <button
          type="button"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:bg-black/10 dark:hover:bg-white/10 hover:text-red-400 transition-colors"
          @click="removeActivity(act.id)"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div v-else class="text-sm text-text-muted text-center py-3">
      No activities added yet. Add one below or proceed if you don't train regularly.
    </div>

    <!-- Inline form -->
    <div v-if="showForm" class="border border-white/8 rounded-xl p-4 space-y-5 bg-surface-input">
      <p class="text-xs font-semibold text-text-muted">New Activity</p>

      <!-- Activity type -->
      <div>
        <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Activity type</label>
        <RadioGroup v-model="formType">
          <div class="grid grid-cols-2 gap-2">
            <RadioGroupOption
              v-for="opt in activityTypeOptions"
              :key="opt.value"
              :value="opt.value"
              v-slot="{ checked }"
            >
              <div
                class="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all"
                :class="checked
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-surface-card border-white/8 hover:border-white/20'"
              >
                <div class="flex-1">
                  <p class="text-sm font-semibold" :class="checked ? 'text-primary' : 'text-text-primary dark:text-white'">{{ opt.label }}</p>
                </div>
                <div
                  class="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  :class="checked ? 'border-primary bg-primary' : 'border-white/20'"
                >
                  <Check v-if="checked" class="w-2.5 h-2.5 text-white" />
                </div>
              </div>
            </RadioGroupOption>
          </div>
        </RadioGroup>
      </div>

      <!-- Sessions per week -->
      <div>
        <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Sessions per week</label>
        <div class="relative">
          <input
            v-model.number="formSessions"
            type="number"
            min="1"
            max="14"
            placeholder="e.g. 3"
            class="w-full h-12 px-4 pr-16 bg-surface-card border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">/ wk</span>
        </div>
      </div>

      <!-- Average duration -->
      <div>
        <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Average duration</label>
        <div class="relative">
          <input
            v-model.number="formDuration"
            type="number"
            min="10"
            max="300"
            placeholder="e.g. 60"
            class="w-full h-12 px-4 pr-16 bg-surface-card border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">min</span>
        </div>
      </div>

      <!-- Intensity -->
      <div>
        <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Intensity</label>
        <RadioGroup v-model="formIntensity">
          <div class="grid grid-cols-3 gap-2">
            <RadioGroupOption
              v-for="opt in intensityOptions"
              :key="opt.value"
              :value="opt.value"
              v-slot="{ checked }"
            >
              <div
                class="flex flex-col items-center gap-1 px-3 py-3 rounded-xl border cursor-pointer transition-all text-center"
                :class="checked
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-surface-card border-white/8 hover:border-white/20'"
              >
                <p class="text-sm font-semibold" :class="checked ? 'text-primary' : 'text-text-primary dark:text-white'">{{ opt.label }}</p>
                <p class="text-xs text-text-muted leading-tight">{{ opt.description }}</p>
              </div>
            </RadioGroupOption>
          </div>
        </RadioGroup>
      </div>

      <!-- Weekly volume km (running / cycling only) -->
      <div v-if="showVolumeKm">
        <label class="block text-sm font-semibold text-text-primary dark:text-white mb-2">Weekly volume <span class="font-normal text-text-muted">(optional)</span></label>
        <div class="relative">
          <input
            v-model.number="formVolumeKm"
            type="number"
            min="0"
            max="500"
            placeholder="e.g. 40"
            class="w-full h-12 px-4 pr-16 bg-surface-card border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
          />
          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted pointer-events-none">km</span>
        </div>
      </div>

      <div class="flex gap-3 pt-1">
        <button
          type="button"
          class="h-10 px-5 bg-surface-card border border-white/8 text-text-muted font-semibold text-sm rounded-xl hover:border-white/20 hover:text-text-primary transition-all"
          @click="cancelForm"
        >
          Cancel
        </button>
        <button
          type="button"
          class="flex-1 h-10 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
          :disabled="!canAddActivity"
          @click="addActivity"
        >
          Add Activity
        </button>
      </div>
    </div>

    <!-- Add activity button -->
    <button
      v-if="!showForm"
      type="button"
      class="w-full h-11 flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-xl text-sm font-semibold text-text-muted hover:border-primary/40 hover:text-primary transition-all"
      @click="openForm"
    >
      <Plus class="w-4 h-4" />
      Add activity
    </button>

    <!-- Volume varies toggle -->
    <div class="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
      <div>
        <p class="text-sm font-semibold text-text-primary dark:text-white">Volume varies significantly</p>
        <p class="text-xs text-text-muted mt-0.5">Training load changes considerably between weeks</p>
      </div>
      <Switch
        v-model="volumeVariesSignificantly"
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :class="volumeVariesSignificantly ? 'bg-primary' : 'bg-white/10'"
      >
        <span
          class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
          :class="volumeVariesSignificantly ? 'translate-x-6' : 'translate-x-1'"
        />
      </Switch>
    </div>
  </div>
</template>
