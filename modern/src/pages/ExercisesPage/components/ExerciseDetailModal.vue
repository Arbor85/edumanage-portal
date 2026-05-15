<script setup lang="ts">
import type { ExcerciseOut } from '../../../types'
import BaseModal from '../../../components/BaseModal.vue'
import DifficultyBadge from '../../../components/DifficultyBadge.vue'
import BaseBadge from '../../../components/BaseBadge.vue'
import BaseButton from '../../../components/BaseButton.vue'
import { computed } from 'vue'

const props = defineProps<{
  open: boolean
  exercise: ExcerciseOut | null
}>()
defineEmits<{ close: []; edit: [] }>()

const difficultyLevel = computed(() => {
  const tags = props.exercise?.tags ?? []
  for (const tag of tags) {
    const lower = tag.toLowerCase()
    if (/advanced/.test(lower)) return 'Advanced' as const
    if (/intermediate/.test(lower)) return 'Intermediate' as const
    if (/beginner/.test(lower)) return 'Beginner' as const
  }
  return null
})
</script>

<template>
  <BaseModal :open="open" :title="exercise?.name ?? ''" size="md" @close="$emit('close')">
    <template v-if="exercise">
      <div class="flex flex-wrap gap-2 mb-4">
        <DifficultyBadge :level="difficultyLevel" />
        <BaseBadge v-if="exercise.primaryMuscle" :label="exercise.primaryMuscle" variant="primary" />
      </div>

      <p v-if="exercise.shortDescription" class="text-sm text-text-secondary dark:text-white/70 mb-4">
        {{ exercise.shortDescription }}
      </p>

      <div v-if="(exercise.secondaryMuscles ?? []).length" class="mb-4">
        <p class="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Secondary Muscles</p>
        <div class="flex flex-wrap gap-1.5">
          <BaseBadge v-for="m in exercise.secondaryMuscles" :key="m" :label="m" />
        </div>
      </div>

      <div v-if="(exercise.tags ?? []).length" class="mb-4">
        <p class="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Tags</p>
        <div class="flex flex-wrap gap-1.5">
          <BaseBadge v-for="tag in exercise.tags" :key="tag" :label="tag" />
        </div>
      </div>

      <div v-if="(exercise.muscles ?? []).length" class="mb-4">
        <p class="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Muscle Groups</p>
        <div class="flex flex-wrap gap-1.5">
          <BaseBadge v-for="m in exercise.muscles" :key="m.name ?? ''" :label="m.name ?? ''" />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton variant="ghost" @click="$emit('close')">Close</BaseButton>
        <BaseButton variant="primary" @click="$emit('edit')">Edit</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
