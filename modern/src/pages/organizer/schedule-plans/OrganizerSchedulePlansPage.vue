<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSchedulePlanStore } from '../../../stores/schedulePlanStore'
import { useToast } from '../../../composables/useToast'
import PageHeader from '../../../components/layout/PageHeader.vue'
import ListSearchBar from '../../../components/ListSearchBar.vue'
import EmptyState from '../../../components/EmptyState.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import BaseButton from '../../../components/BaseButton.vue'
import SchedulePlanCard from './components/SchedulePlanCard.vue'
import SchedulePlanFormModal from './components/SchedulePlanFormModal.vue'
import { CalendarDays, Plus } from 'lucide-vue-next'
import type { SchedulePlanOut } from '../../../types'

const store = useSchedulePlanStore()
const router = useRouter()
const toast = useToast()

const search = ref('')
const isCreateOpen = ref(false)
const deleteTarget = ref<SchedulePlanOut | null>(null)

onMounted(() => store.fetchPlans())

const filtered = computed(() =>
  store.plans.filter(p =>
    !search.value || p.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

async function handleDelete() {
  if (!deleteTarget.value) return
  try {
    await store.removePlan(deleteTarget.value.id)
    toast.success('Plan deleted')
  } catch {
    toast.error('Failed to delete plan')
  } finally {
    deleteTarget.value = null
  }
}
</script>

<template>
  <div>
    <PageHeader title="Schedule Plans" subtitle="Build and publish training schedules.">
      <BaseButton variant="primary" @click="isCreateOpen = true">
        <Plus class="w-4 h-4" /> New Plan
      </BaseButton>
    </PageHeader>

    <div class="mb-5">
      <ListSearchBar
        v-model="search"
        placeholder="Search plans…"
        :loading="store.isLoading"
        @refresh="store.fetchPlans()"
      />
    </div>

    <EmptyState
      v-if="filtered.length === 0 && !store.isLoading"
      :icon="CalendarDays"
      :title="search ? 'No plans match' : 'No schedule plans yet'"
      :description="search ? 'Try a different search term.' : 'Create a plan to start building a training schedule.'"
      :action-label="search ? undefined : 'New Plan'"
      @action="isCreateOpen = true"
    />

    <div class="flex flex-col gap-3">
      <SchedulePlanCard
        v-for="plan in filtered"
        :key="plan.id"
        :plan="plan"
        @click="router.push(`/organizer/schedule-plans/${plan.id}`)"
        @delete="deleteTarget = plan"
      />
    </div>

    <SchedulePlanFormModal :open="isCreateOpen" @close="isCreateOpen = false" />

    <ConfirmDialog
      :open="!!deleteTarget"
      title="Delete Plan"
      :message="`Delete &quot;${deleteTarget?.name}&quot;? This cannot be undone.`"
      confirm-label="Delete"
      variant="danger"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
