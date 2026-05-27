<script setup lang="ts">
import { ref, computed } from 'vue'
import type { RoutineSet, ActivityType, ActivityTrackType } from '../../types'
import WeightPickerDialog from '../WeightPickerDialog/index.vue'

type SetType = 'normal' | 'warmup' | 'failure' | 'drop'

const TYPE_ORDER: SetType[] = ['normal', 'warmup', 'failure', 'drop']

const TYPE_META: Record<SetType, { letter: string; classes: string; label: string }> = {
  normal:  { letter: 'N', classes: 'bg-blue-500',   label: 'Normal' },
  warmup:  { letter: 'W', classes: 'bg-amber-500',  label: 'Warmup' },
  failure: { letter: 'F', classes: 'bg-red-500',    label: 'Failure' },
  drop:    { letter: 'D', classes: 'bg-purple-500', label: 'Drop' },
}

const props = defineProps<{
  set: RoutineSet
  activityType?: ActivityType
  activityTrackType?: ActivityTrackType
}>()

const emit = defineEmits<{
  'update:set': [set: RoutineSet]
}>()

const weightPickerOpen = ref(false)

const trackType = computed(() => props.activityTrackType ?? 'repetitions')
const showWeight = computed(() =>
  (props.activityType === 'weighted' || props.activityType === 'machine' || props.activityType == null)
  && trackType.value === 'repetitions'
)

const currentType = computed<SetType>(
  () => (TYPE_ORDER.includes(props.set.type as SetType) ? props.set.type as SetType : 'normal'),
)

const meta = computed(() => TYPE_META[currentType.value])

function cycleType() {
  const idx = TYPE_ORDER.indexOf(currentType.value)
  emit('update:set', { ...props.set, type: TYPE_ORDER[(idx + 1) % TYPE_ORDER.length] })
}

function updateReps(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value)
  emit('update:set', { ...props.set, reps: isNaN(val) ? null : val })
}

function updateDuration(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value)
  emit('update:set', { ...props.set, duration: isNaN(val) ? null : val })
}

function updateDistance(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  emit('update:set', { ...props.set, distance: isNaN(val) ? null : val })
}

function onWeightConfirm(kg: number) {
  emit('update:set', { ...props.set, weight: kg })
  weightPickerOpen.value = false
}

const weightDisplay = computed(() => {
  if (props.set.weight === null || props.set.weight === undefined) return ''
  return props.set.weight % 1 === 0
    ? String(props.set.weight)
    : props.set.weight.toFixed(2)
})
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Type avatar -->
    <button
      type="button"
      :class="[
        'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center',
        'text-xs font-bold text-white',
        'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary',
        'active:opacity-80 transition-opacity',
        meta.classes,
      ]"
      :title="meta.label"
      :aria-label="`Set type: ${meta.label}. Tap to change.`"
      @click="cycleType"
    >
      {{ meta.letter }}
    </button>

    <!-- Reps input -->
    <div v-if="trackType === 'repetitions'" class="flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark overflow-hidden min-h-[44px]">
      <input
        :value="set.reps ?? ''"
        type="number"
        min="0"
        inputmode="numeric"
        placeholder="0"
        class="w-14 px-3 py-2.5 text-sm text-center bg-transparent outline-none text-text-primary dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        @input="updateReps"
      />
      <span class="pr-3 text-xs font-medium text-text-secondary dark:text-white/50 select-none">rep</span>
    </div>

    <!-- Duration input (time) -->
    <div v-else-if="trackType === 'time'" class="flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark overflow-hidden min-h-[44px]">
      <input
        :value="set.duration ?? ''"
        type="number"
        min="0"
        inputmode="numeric"
        placeholder="0"
        class="w-16 px-3 py-2.5 text-sm text-center bg-transparent outline-none text-text-primary dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        @input="updateDuration"
      />
      <span class="pr-3 text-xs font-medium text-text-secondary dark:text-white/50 select-none">sec</span>
    </div>

    <!-- Distance input (distance) -->
    <div v-else-if="trackType === 'distance'" class="flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark overflow-hidden min-h-[44px]">
      <input
        :value="set.distance ?? ''"
        type="number"
        min="0"
        step="10"
        inputmode="decimal"
        placeholder="0"
        class="w-16 px-3 py-2.5 text-sm text-center bg-transparent outline-none text-text-primary dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        @input="updateDistance"
      />
      <span class="pr-3 text-xs font-medium text-text-secondary dark:text-white/50 select-none">m</span>
    </div>

    <!-- Weight input (weighted / machine + repetitions only) -->
    <button
      v-if="showWeight"
      type="button"
      class="flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark overflow-hidden min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary"
      :aria-label="`Weight: ${weightDisplay || '0'} kg. Tap to edit.`"
      @click="weightPickerOpen = true"
    >
      <span class="w-16 px-3 py-2.5 text-sm text-center text-text-primary dark:text-white tabular-nums">
        {{ weightDisplay || '—' }}
      </span>
      <span class="pr-3 text-xs font-medium text-text-secondary dark:text-white/50 select-none">kg</span>
    </button>
  </div>

  <WeightPickerDialog
    :open="weightPickerOpen"
    :model-value="set.weight"
    @update:model-value="onWeightConfirm"
    @close="weightPickerOpen = false"
  />
</template>
