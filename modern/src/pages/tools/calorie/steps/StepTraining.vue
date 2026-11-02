<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { X } from '@lucide/vue'
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
            {{ act.sessionsPerWeek }}Ã—/week Â· {{ act.avgDurationMin }} min Â· {{ intensityLabel(act.intensity) }}
            <span v-if="act.weeklyVolumeKm"> Â· {{ act.weeklyVolumeKm }} km/wk</span>
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
    <div v-if="showForm" class="border border-white/8 rounded-xl p-4 space-y-4 bg-surface-input">
      <p class="text-xs font-bold tracking-widest uppercase text-text-muted">New Activity</p>

      <!-- Type -->
      <div>
        <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-2">Activity type</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="opt in activityTypeOptions"
            :key="opt.value"
            type="button"
            class="w-full text-left px-3 py-2 rounded-lg border transition-all text-sm font-medium"
            :class="
              formType === opt.value
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-surface-card border-white/8 text-text-secondary hover:border-white/20 hover:text-text-primary'
            "
            @click="formType = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Sessions per week -->
      <div>
        <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-2">Sessions per week</label>
        <input
          v-model.number="formSessions"
          type="number"
          min="1"
          max="14"
          placeholder="e.g. 3"
          class="w-full h-12 px-4 bg-surface-card border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
        />
      </div>

      <!-- Average duration -->
      <div>
        <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-2">Average duration (min)</label>
        <input
          v-model.number="formDuration"
          type="number"
          min="10"
          max="300"
          placeholder="e.g. 60"
          class="w-full h-12 px-4 bg-surface-card border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
        />
      </div>

      <!-- Intensity -->
      <div>
        <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-2">Intensity</label>
        <div class="space-y-2">
          <button
            v-for="opt in intensityOptions"
            :key="opt.value"
            type="button"
            class="w-full text-left px-4 py-2.5 rounded-xl border transition-all"
            :class="
              formIntensity === opt.value
                ? 'bg-primary/10 border-primary/40 text-primary'
                : 'bg-surface-card border-white/8 text-text-secondary hover:border-white/20 hover:text-text-primary'
            "
            @click="formIntensity = opt.value"
          >
            <span class="text-sm font-semibold">{{ opt.label }}</span>
            <span class="text-xs opacity-70 ml-2">{{ opt.description }}</span>
          </button>
        </div>
      </div>

      <!-- Weekly volume km (running / cycling only) -->
      <div v-if="showVolumeKm">
        <label class="block text-xs font-bold tracking-widest uppercase text-text-muted mb-2">
          Weekly volume (km) â€” optional
        </label>
        <input
          v-model.number="formVolumeKm"
          type="number"
          min="0"
          max="500"
          placeholder="e.g. 40"
          class="w-full h-12 px-4 bg-surface-card border border-white/8 rounded-xl text-base font-semibold text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
        />
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
      class="w-full h-11 border border-dashed border-white/20 rounded-xl text-sm font-semibold text-text-muted hover:border-primary/40 hover:text-primary transition-all"
      @click="openForm"
    >
      + Add activity
    </button>

    <!-- Volume varies toggle -->
    <div class="flex items-center gap-3 pt-1">
      <input
        id="volumeVaries"
        v-model="volumeVariesSignificantly"
        type="checkbox"
        class="w-4 h-4 rounded accent-primary"
      />
      <label for="volumeVaries" class="text-sm text-text-secondary cursor-pointer select-none">
        Volume varies significantly between weeks
      </label>
    </div>
  </div>
</template>
