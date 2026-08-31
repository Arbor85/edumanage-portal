<script setup lang="ts">
import { computed } from 'vue'
import { Trash2, AlertTriangle } from 'lucide-vue-next'
import BaseButton from '../../../../components/BaseButton.vue'
import type { ScheduleEntryOut } from '../../../../types'

const props = defineProps<{
  entry: ScheduleEntryOut
  courseName: string
  trainerLabel: string
  buildingName: string
}>()
defineEmits<{ delete: [id: string] }>()

const recurrenceLabel = computed(() => {
  const e = props.entry
  if (e.recurrenceType === 'none') return 'Once'
  if (e.recurrenceType === 'daily') return 'Daily'
  if (e.recurrenceType === 'weekly') return 'Weekly'
  if (e.recurrenceType === 'every-n-days') return `Every ${e.recurrenceInterval ?? '?'} days`
  return e.recurrenceType
})

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div
    class="flex items-start gap-4 bg-surface dark:bg-surface-card rounded-xl border px-4 py-3.5 shadow-sm"
    :class="entry.hasMismatch
      ? 'border-amber-400/60 bg-amber-50/50 dark:bg-amber-900/10'
      : 'border-gray-100 dark:border-white/5'"
  >
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-sm font-semibold text-text-primary dark:text-white">{{ courseName }}</span>
        <AlertTriangle
          v-if="entry.hasMismatch"
          class="w-3.5 h-3.5 text-amber-500 flex-shrink-0"
          title="Outside declared availability"
        />
      </div>
      <div class="flex items-center gap-2 flex-wrap mb-1.5">
        <span class="text-xs text-text-secondary font-mono">{{ trainerLabel }}</span>
        <span class="text-text-secondary text-xs">·</span>
        <span class="text-xs text-text-secondary">{{ buildingName }}</span>
      </div>
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-md font-medium">
          {{ recurrenceLabel }}
        </span>
        <span class="text-xs text-text-secondary">{{ formatDate(entry.startDate) }}</span>
        <span class="text-xs font-mono text-text-secondary tabular-nums">
          · {{ entry.startTime }}–{{ entry.endTime }}
        </span>
        <span v-if="entry.validUntil && entry.recurrenceType !== 'none'" class="text-xs text-text-secondary hidden sm:block">
          · until {{ formatDate(entry.validUntil) }}
        </span>
      </div>
    </div>
    <BaseButton size="sm" variant="ghost" class="flex-shrink-0 mt-0.5" @click="$emit('delete', entry.id)">
      <Trash2 class="w-3.5 h-3.5 text-red-400" />
    </BaseButton>
  </div>
</template>
