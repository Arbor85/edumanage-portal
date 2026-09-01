<script setup lang="ts">
import { computed } from 'vue'
import { Trash2, AlertTriangle, Pencil, Clock, MapPin, User } from 'lucide-vue-next'
import BaseButton from '../../../../components/BaseButton.vue'
import type { ScheduleEntryOut } from '../../../../types'

const props = defineProps<{
  entry: ScheduleEntryOut
  courseName: string
  trainerLabel: string
  buildingName: string
  colorIndex?: number
}>()
defineEmits<{ delete: [id: string]; edit: [entry: ScheduleEntryOut] }>()

const COLOR_BARS = [
  'bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
]
const barColor = computed(() => COLOR_BARS[(props.colorIndex ?? 0) % COLOR_BARS.length])

const recurrenceLabel = computed(() => {
  const e = props.entry
  if (e.recurrenceType === 'none') return 'Once'
  if (e.recurrenceType === 'daily') return 'Daily'
  if (e.recurrenceType === 'weekly') return 'Weekly'
  if (e.recurrenceType === 'every-n-days') return `Every ${e.recurrenceInterval ?? '?'} days`
  return e.recurrenceType
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div
    class="stagger-item group flex items-stretch bg-surface dark:bg-surface-card rounded-xl border shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-px hover:shadow-card"
    :class="entry.hasMismatch
      ? 'border-amber-400/50 bg-amber-50/40 dark:bg-amber-900/10'
      : 'border-gray-100 dark:border-white/6'"
  >
    <!-- Color bar -->
    <div class="w-1 flex-shrink-0" :class="barColor" />

    <div class="flex-1 flex items-center gap-4 px-4 py-3.5 min-w-0">
      <!-- Main content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-sm font-bold text-text-primary dark:text-white truncate">{{ courseName }}</span>
          <AlertTriangle
            v-if="entry.hasMismatch"
            class="w-3.5 h-3.5 text-amber-500 flex-shrink-0"
            title="Outside declared availability"
          />
          <span class="px-1.5 py-0.5 bg-primary/10 text-primary text-[11px] rounded-md font-semibold flex-shrink-0">
            {{ recurrenceLabel }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-1">
          <div class="flex items-center gap-1.5">
            <Clock class="w-3 h-3 text-text-secondary flex-shrink-0" />
            <span class="text-xs text-text-secondary tabular-nums font-medium">
              {{ formatDate(entry.startDate) }} · {{ entry.startTime }}–{{ entry.endTime }}
            </span>
          </div>
          <div class="flex items-center gap-1.5">
            <MapPin class="w-3 h-3 text-text-secondary flex-shrink-0" />
            <span class="text-xs text-text-secondary truncate">{{ buildingName }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <User class="w-3 h-3 text-text-secondary flex-shrink-0" />
            <span class="text-xs text-text-secondary truncate font-mono">{{ trainerLabel }}</span>
          </div>
        </div>

        <p v-if="entry.validUntil && entry.recurrenceType !== 'none'" class="text-[11px] text-text-secondary mt-1.5">
          Until {{ formatDate(entry.validUntil) }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <BaseButton size="sm" variant="ghost" @click="$emit('edit', entry)">
          <Pencil class="w-3.5 h-3.5 text-text-secondary" />
        </BaseButton>
        <BaseButton size="sm" variant="ghost" @click="$emit('delete', entry.id)">
          <Trash2 class="w-3.5 h-3.5 text-red-400" />
        </BaseButton>
      </div>
    </div>
  </div>
</template>
