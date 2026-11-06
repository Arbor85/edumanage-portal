<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RoutineSet, ActivityType, ActivityTrackType, UserExerciseMax, CompletedRoutineSet } from '../../types'
import BaseModal from '../BaseModal.vue'
import BaseButton from '../BaseButton.vue'
import EditSet from '../EditSet/index.vue'
import WeightPickerDialog from '../WeightPickerDialog/index.vue'
import { useSetCalculations } from '../../composables/useSetCalculations'
import { useWeightUnit } from '../../composables/useWeightUnit'
import { Clock, Zap, TrendingUp } from '@lucide/vue'

const props = defineProps<{
  open: boolean
  set: RoutineSet
  activityType?: ActivityType
  activityTrackType?: ActivityTrackType
  setIndex: number
  mode: 'planning' | 'active'
  exerciseMax?: UserExerciseMax
  previousSessionSet?: CompletedRoutineSet
  activeReps?: number
  activeWeight?: number
  previousSetInSession?: { reps: number | null; weight: number | null }
  weightReadOnly?: boolean
}>()

const emit = defineEmits<{
  'update:open': [val: boolean]
  'confirm-planning': [set: RoutineSet]
  'confirm-active': [reps: number, weight: number]
}>()

const { toDisplay, unit } = useWeightUnit()

const localSet = ref<RoutineSet>({ ...props.set })
const localReps = ref(props.activeReps ?? 0)
const localWeight = ref(props.activeWeight ?? 0)
const weightPickerOpen = ref(false)

watch(() => props.open, (val) => {
  if (val) {
    localSet.value = { ...props.set }
    localReps.value = props.activeReps ?? 0
    localWeight.value = props.activeWeight ?? 0
  }
})

const { lastSession, percentOfMax, estimated1RM, suggestion, previousSet, hasContext } = useSetCalculations({
  set: localSet,
  activityTrackType: props.activityTrackType ?? 'repetitions',
  mode: props.mode,
  exerciseMax: props.exerciseMax,
  previousSessionSet: props.previousSessionSet,
  previousSetInSession: props.previousSetInSession,
})

const trackType = computed(() => props.activityTrackType ?? 'repetitions')
const showWeight = computed(() =>
  (props.activityType === 'weighted' || props.activityType === 'machine' || props.activityType == null)
  && trackType.value === 'repetitions'
)

const activeWeightDisplay = computed(() => {
  const d = toDisplay(localWeight.value)
  return d % 1 === 0 ? String(d) : d.toFixed(2)
})

function applySuggestion() {
  if (!suggestion.value) return
  localSet.value = {
    ...localSet.value,
    reps: suggestion.value.reps,
    weight: suggestion.value.weight ?? localSet.value.weight,
  }
}

function confirm() {
  if (props.mode === 'planning') {
    emit('confirm-planning', { ...localSet.value })
  } else {
    emit('confirm-active', localReps.value, localWeight.value)
  }
  emit('update:open', false)
}

function cancel() {
  emit('update:open', false)
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="`Set ${setIndex + 1}`"
    size="sm"
    @close="cancel"
  >
    <div class="flex flex-col gap-4">
      <!-- Planning mode: use EditSet for inputs -->
      <EditSet
        v-if="mode === 'planning'"
        :set="localSet"
        :activity-type="activityType"
        :activity-track-type="activityTrackType"
        @update:set="localSet = $event"
      />

      <!-- Active mode: simple reps + weight inputs -->
      <div v-else class="flex items-center gap-3">
        <template v-if="showWeight && !weightReadOnly">
          <button
            type="button"
            class="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-sm font-bold text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all"
            @click="weightPickerOpen = true"
          >
            {{ activeWeightDisplay }}<span class="text-text-secondary dark:text-white/50 text-xs ml-0.5 font-normal">{{ unit }}</span>
          </button>
          <span class="text-text-secondary text-sm">×</span>
        </template>
        <div
          v-if="showWeight && weightReadOnly"
          class="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-sm font-bold text-text-primary dark:text-white"
        >
          {{ activeWeightDisplay }}<span class="text-text-secondary text-xs ml-0.5 font-normal">{{ unit }}</span>
        </div>
        <span v-if="showWeight && weightReadOnly" class="text-text-secondary text-sm">×</span>

        <div class="flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark overflow-hidden min-h-[44px]">
          <input
            :value="localReps || ''"
            type="number"
            min="0"
            inputmode="numeric"
            placeholder="0"
            class="w-16 px-3 py-2.5 text-sm text-center bg-transparent outline-none text-text-primary dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            @input="localReps = parseInt(($event.target as HTMLInputElement).value) || 0"
          />
          <span class="pr-3 text-xs font-medium text-text-secondary dark:text-white/50 select-none">
            {{ weightReadOnly ? 'to failure' : 'rep' }}
          </span>
        </div>
      </div>

      <!-- Context panel -->
      <div v-if="hasContext" class="flex flex-col gap-2.5 pt-3 border-t border-gray-100 dark:border-white/8">
        <div v-if="previousSet" class="flex items-center gap-2 text-sm text-text-secondary dark:text-white/60">
          <Clock class="w-3.5 h-3.5 flex-shrink-0 text-text-secondary dark:text-white/40" />
          <span>{{ previousSet }}</span>
        </div>
        <div v-if="lastSession" class="flex items-center gap-2 text-sm text-text-secondary dark:text-white/60">
          <Clock class="w-3.5 h-3.5 flex-shrink-0 text-text-secondary dark:text-white/40" />
          <span>{{ lastSession }}</span>
        </div>
        <div v-if="percentOfMax" class="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
          <Zap class="w-3.5 h-3.5 flex-shrink-0" />
          <span>{{ percentOfMax }}</span>
        </div>
        <div v-if="estimated1RM" class="flex items-center gap-2 text-sm text-text-secondary dark:text-white/60">
          <TrendingUp class="w-3.5 h-3.5 flex-shrink-0 text-text-secondary dark:text-white/40" />
          <span>{{ estimated1RM }}</span>
        </div>
        <button
          v-if="suggestion && mode === 'planning'"
          type="button"
          class="flex items-center gap-2 text-sm text-primary font-medium hover:underline w-fit"
          @click="applySuggestion"
        >
          <TrendingUp class="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            Suggest:
            {{ suggestion.weight != null ? `${toDisplay(suggestion.weight)}${unit} × ` : '' }}{{ suggestion.reps }} reps
          </span>
        </button>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <BaseButton variant="ghost" @click="cancel">Cancel</BaseButton>
        <BaseButton variant="primary" @click="confirm">Confirm</BaseButton>
      </div>
    </template>
  </BaseModal>

  <WeightPickerDialog
    v-if="mode === 'active' && !weightReadOnly"
    :open="weightPickerOpen"
    :model-value="localWeight"
    @update:model-value="localWeight = $event; weightPickerOpen = false"
    @close="weightPickerOpen = false"
  />
</template>
