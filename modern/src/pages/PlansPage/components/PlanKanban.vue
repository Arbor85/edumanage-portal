<script setup lang="ts">
import type { PlanOut } from '../../../types'
import { usePlanStore } from '../../../stores/planStore'
import { useToast } from '../../../composables/useToast'
import SkeletonBlock from '../../../components/SkeletonBlock.vue'
import PlanKanbanCard from './PlanKanbanCard.vue'

const props = defineProps<{ plans: PlanOut[]; loading: boolean }>()
const emit = defineEmits<{ edit: [p: PlanOut]; delete: [p: PlanOut] }>()

const planStore = usePlanStore()
const toast = useToast()

const columns = [
  { key: 'draft', label: 'Draft' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
]

function byStatus(status: string) {
  return props.plans.filter((p) => p.status === status)
}

async function onDrop(e: DragEvent, targetStatus: string) {
  const id = e.dataTransfer?.getData('planId')
  if (!id) return
  try {
    await planStore.updateStatus(id, targetStatus)
    toast.success('Status updated')
  } catch {
    toast.error('Failed to update status')
  }
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div
      v-for="col in columns"
      :key="col.key"
      class="bg-gray-50 dark:bg-white/5 rounded-2xl p-3 min-h-[200px]"
      @dragover.prevent
      @drop="onDrop($event, col.key)"
    >
      <p class="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">{{ col.label }} ({{ byStatus(col.key).length }})</p>

      <div v-if="loading" class="flex flex-col gap-2">
        <SkeletonBlock v-for="i in 3" :key="i" height="4rem" />
      </div>

      <div class="flex flex-col gap-2">
        <div
          v-for="plan in byStatus(col.key)"
          :key="plan.id ?? ''"
          draggable="true"
          @dragstart="$event.dataTransfer?.setData('planId', plan.id ?? '')"
        >
          <PlanKanbanCard :plan="plan" @edit="emit('edit', plan)" @delete="emit('delete', plan)" />
        </div>
      </div>
    </div>
  </div>
</template>
