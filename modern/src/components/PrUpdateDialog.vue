<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

export interface PrCandidate {
  exerciseId: number
  exerciseName: string
  activityTrackType: 'repetitions' | 'time' | 'distance'
  newWeight?: number | null
  newReps?: number | null
  newDuration?: number | null
  newDistance?: number | null
  oldLabel?: string
  newLabel: string
  newOneRm?: number | null
}

const props = defineProps<{
  open: boolean
  candidate: PrCandidate | null
}>()

const emit = defineEmits<{
  confirm: []
  skip: []
}>()
</script>

<template>
  <BaseModal :open="open" title="New Personal Record!" size="sm" @close="emit('skip')">
    <template v-if="candidate">
      <div class="flex flex-col gap-4">
        <div class="text-center py-2">
          <p class="text-2xl">🏆</p>
          <p class="font-semibold text-text-primary dark:text-white mt-1">{{ candidate.exerciseName }}</p>
        </div>

        <div class="rounded-xl bg-gray-50 dark:bg-white/5 p-4 flex items-center justify-around gap-4">
          <div class="text-center" v-if="candidate.oldLabel">
            <p class="text-xs text-text-secondary mb-1">Previous</p>
            <p class="font-semibold text-text-primary dark:text-white">{{ candidate.oldLabel }}</p>
          </div>
          <div class="text-text-secondary" v-if="candidate.oldLabel">→</div>
          <div class="text-center">
            <p class="text-xs text-text-secondary mb-1">New</p>
            <p class="font-bold text-primary text-lg">{{ candidate.newLabel }}</p>
            <p v-if="candidate.newOneRm" class="text-xs text-text-secondary">~{{ Math.round(candidate.newOneRm) }} kg 1RM</p>
          </div>
        </div>

        <p class="text-sm text-text-secondary text-center">Update your gym profile with this new record?</p>

        <div class="flex gap-3 justify-end">
          <BaseButton variant="ghost" @click="emit('skip')">Skip</BaseButton>
          <BaseButton variant="primary" @click="emit('confirm')">Update PR</BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>
