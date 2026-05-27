<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ActivityType, ActivityTrackType } from '../types'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import { Plus, Trash2 } from 'lucide-vue-next'

interface SetDraft {
  reps: number | null
  weight: number | null
  duration: number | null
  distance: number | null
}

const props = defineProps<{
  open: boolean
  exerciseName: string
  activityType?: ActivityType
  activityTrackType?: ActivityTrackType
  initialSets?: SetDraft[]
}>()

const emit = defineEmits<{
  close: []
  confirm: [sets: SetDraft[]]
}>()

const trackType = computed(() => props.activityTrackType ?? 'repetitions')
const showWeight = computed(() =>
  (props.activityType === 'weighted' || props.activityType === 'machine' || props.activityType == null)
  && trackType.value === 'repetitions'
)

const sets = ref<SetDraft[]>([])

watch(() => props.open, (val) => {
  if (!val) return
  sets.value = props.initialSets?.length
    ? props.initialSets.map(s => ({ reps: s.reps, weight: s.weight, duration: s.duration, distance: s.distance }))
    : [{ reps: null, weight: null, duration: null, distance: null }]
})

function addSet() {
  const last = sets.value[sets.value.length - 1]
  sets.value.push({ reps: last?.reps ?? null, weight: last?.weight ?? null, duration: last?.duration ?? null, distance: last?.distance ?? null })
}

function removeSet(i: number) {
  if (sets.value.length > 1) sets.value.splice(i, 1)
}

function confirm() {
  emit('confirm', sets.value.map(s => ({ reps: s.reps ?? null, weight: s.weight ?? null, duration: s.duration ?? null, distance: s.distance ?? null })))
  emit('close')
}

const gridCols = computed(() => {
  if (trackType.value === 'time' || trackType.value === 'distance') return 'grid-cols-[2rem_1fr_2rem]'
  return showWeight.value ? 'grid-cols-[2rem_1fr_1fr_2rem]' : 'grid-cols-[2rem_1fr_2rem]'
})
</script>

<template>
  <BaseModal :open="open" :title="exerciseName" size="sm" @close="emit('close')">
    <div class="flex flex-col gap-4">
      <!-- Header row -->
      <div class="grid gap-2 text-xs font-medium text-text-secondary px-1" :class="gridCols">
        <span class="text-center">#</span>
        <span v-if="trackType === 'time'">Duration (sec)</span>
        <span v-else-if="trackType === 'distance'">Distance (m)</span>
        <span v-else>Reps</span>
        <span v-if="showWeight">Weight (kg)</span>
        <span />
      </div>

      <div class="flex flex-col gap-2">
        <div v-for="(set, i) in sets" :key="i" class="grid gap-2 items-center" :class="gridCols">
          <span class="text-sm font-medium text-text-secondary text-center">{{ i + 1 }}</span>

          <!-- Reps -->
          <input
            v-if="trackType === 'repetitions'"
            v-model.number="set.reps"
            type="number" min="1" placeholder="—"
            class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 outline-none text-text-primary dark:text-white focus-visible:ring-2 focus-visible:ring-primary text-center"
          />

          <!-- Duration -->
          <input
            v-else-if="trackType === 'time'"
            v-model.number="set.duration"
            type="number" min="0" placeholder="—"
            class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 outline-none text-text-primary dark:text-white focus-visible:ring-2 focus-visible:ring-primary text-center"
          />

          <!-- Distance -->
          <input
            v-else-if="trackType === 'distance'"
            v-model.number="set.distance"
            type="number" min="0" step="10" placeholder="—"
            class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 outline-none text-text-primary dark:text-white focus-visible:ring-2 focus-visible:ring-primary text-center"
          />

          <!-- Weight -->
          <input
            v-if="showWeight"
            v-model.number="set.weight"
            type="number" min="0" step="0.5" placeholder="—"
            class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 outline-none text-text-primary dark:text-white focus-visible:ring-2 focus-visible:ring-primary text-center"
          />
          <span v-else />

          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 transition-colors"
            :disabled="sets.length === 1"
            @click="removeSet(i)"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <button type="button" class="flex items-center gap-1.5 text-sm text-primary hover:underline self-start" @click="addSet">
        <Plus class="w-4 h-4" /> Add set
      </button>
    </div>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <BaseButton variant="ghost" size="sm" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" size="sm" @click="confirm">Save</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
