<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PlanOut } from '../../../types'
import { usePlanStore } from '../../../stores/planStore'
import { useClientStore } from '../../../stores/clientStore'
import { useToast } from '../../../composables/useToast'
import SkeletonBlock from '../../../components/SkeletonBlock.vue'
import EmptyState from '../../../components/EmptyState.vue'
import BaseBadge from '../../../components/BaseBadge.vue'
import BaseButton from '../../../components/BaseButton.vue'
import PaginationBar from '../../../components/PaginationBar.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'

const props = defineProps<{ plans: PlanOut[]; loading: boolean }>()
const emit = defineEmits<{ edit: [p: PlanOut] }>()

const planStore = usePlanStore()
const clientStore = useClientStore()
const toast = useToast()

const page = ref(1)
const PAGE_SIZE = 20
const deleteTarget = ref<PlanOut | null>(null)

const paginated = computed(() =>
  props.plans.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE)
)

function clientName(id: string | null) {
  return clientStore.clients.find((c) => c.invitationCode === id)?.name ?? id ?? '—'
}

const statusVariant = (s: string | null) =>
  s === 'active' ? 'success' : s === 'inactive' ? 'danger' : 'default'

async function handleDelete() {
  if (!deleteTarget.value?.id) return
  try {
    await planStore.remove(deleteTarget.value.id)
    toast.success('Plan deleted')
    deleteTarget.value = null
  } catch {
    toast.error('Failed to delete plan')
  }
}

async function changeStatus(plan: PlanOut, status: string) {
  try {
    await planStore.updateStatus(plan.id!, status)
    toast.success('Status updated')
  } catch {
    toast.error('Failed to update status')
  }
}
</script>

<template>
  <div>
    <div v-if="loading" class="flex flex-col gap-3">
      <SkeletonBlock v-for="i in 5" :key="i" height="4rem" />
    </div>

    <EmptyState v-else-if="!plans.length" icon="📅" title="No plans yet" description="Create your first training plan." />

    <div v-else class="flex flex-col gap-3 custom-scrollbar">
      <div
        v-for="plan in paginated"
        :key="plan.id ?? ''"
        class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="font-semibold text-text-primary dark:text-white">{{ plan.name }}</p>
            <BaseBadge :label="plan.status ?? 'draft'" :variant="statusVariant(plan.status)" />
          </div>
          <p v-if="plan.note" class="text-xs text-text-secondary mt-0.5 truncate">{{ plan.note }}</p>
          <p class="text-xs text-text-secondary mt-0.5">Client: {{ clientName(plan.clientId) }} · {{ plan.workouts?.length ?? 0 }} workouts</p>
        </div>
        <div class="flex gap-1.5 flex-wrap">
          <BaseButton size="sm" variant="ghost" @click="changeStatus(plan, plan.status === 'active' ? 'inactive' : 'active')">
            {{ plan.status === 'active' ? 'Deactivate' : 'Activate' }}
          </BaseButton>
          <BaseButton size="sm" variant="ghost" aria-label="Edit" @click="emit('edit', plan)">✏️</BaseButton>
          <BaseButton size="sm" variant="ghost" aria-label="Delete" @click="deleteTarget = plan">🗑️</BaseButton>
        </div>
      </div>
    </div>

    <PaginationBar :page="page" :page-size="PAGE_SIZE" :total="plans.length" @update:page="page = $event" />

    <ConfirmDialog
      :open="deleteTarget !== null"
      title="Delete Plan"
      message="Delete this plan?"
      confirm-label="Delete"
      variant="danger"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
