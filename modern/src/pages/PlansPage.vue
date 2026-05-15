<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { PlanOut } from '../types'
import { usePlanStore } from '../stores/planStore'
import { useClientStore } from '../stores/clientStore'
import { useRoutineStore } from '../stores/routineStore'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import ListSearchBar from '../components/ListSearchBar.vue'
import BaseButton from '../components/BaseButton.vue'
import ViewToggle from '../components/ViewToggle.vue'
import PlanList from './PlansPage/components/PlanList.vue'
import PlanKanban from './PlansPage/components/PlanKanban.vue'
import PlanFormModal from './PlansPage/components/PlanFormModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useToast } from '../composables/useToast'

const planStore = usePlanStore()
const clientStore = useClientStore()
const routineStore = useRoutineStore()
const toast = useToast()

const search = ref('')
const view = ref<'list' | 'kanban'>('list')
const isCreateOpen = ref(false)
const editTarget = ref<PlanOut | null>(null)
const deleteTarget = ref<PlanOut | null>(null)

onMounted(() => {
  planStore.fetch()
  clientStore.fetch()
  routineStore.fetch()
})

const filtered = computed(() =>
  planStore.plans.filter((p) =>
    !search.value || p.name?.toLowerCase().includes(search.value.toLowerCase())
  )
)

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
</script>

<template>
  <AppLayout>
    <PageHeader title="Training Plans" subtitle="Design and manage client training plans.">
      <BaseButton variant="primary" @click="isCreateOpen = true">+ New Plan</BaseButton>
    </PageHeader>

    <div class="mb-4 flex items-center gap-3">
      <div class="flex-1">
        <ListSearchBar
          v-model="search"
          placeholder="Search plans..."
          :loading="planStore.isLoading"
          @refresh="planStore.fetch()"
        />
      </div>
      <ViewToggle
        v-model="view"
        :options="[{ value: 'list', label: 'List' }, { value: 'kanban', label: 'Kanban' }]"
        storage-key="plans-view"
      />
    </div>

    <PlanList
      v-if="view === 'list'"
      :plans="filtered"
      :loading="planStore.isLoading"
      @edit="editTarget = $event"
    />

    <PlanKanban
      v-else
      :plans="filtered"
      :loading="planStore.isLoading"
      @edit="editTarget = $event"
      @delete="deleteTarget = $event"
    />

    <PlanFormModal
      :open="isCreateOpen || editTarget !== null"
      :plan="editTarget"
      @close="isCreateOpen = false; editTarget = null"
    />

    <ConfirmDialog
      :open="deleteTarget !== null"
      title="Delete Plan"
      message="Delete this plan?"
      confirm-label="Delete"
      variant="danger"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />
  </AppLayout>
</template>
