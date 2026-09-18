<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('Plans')
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

const route = useRoute()
const router = useRouter()
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

function openEdit(plan: PlanOut) {
  editTarget.value = plan
  router.push({ query: { edit: plan.id! } })
}

function openCreate() {
  isCreateOpen.value = true
  router.push({ query: { new: '1' } })
}

watch(() => route.query, async (query) => {
  if (query.edit) {
    if (editTarget.value?.id === query.edit) return
    try {
      editTarget.value = await planStore.get(query.edit as string)
      isCreateOpen.value = false
    } catch {
      toast.error('Plan not found')
      router.replace({ query: {} })
    }
  } else if (query.new) {
    if (isCreateOpen.value) return
    isCreateOpen.value = true
    editTarget.value = null
  } else {
    isCreateOpen.value = false
    editTarget.value = null
  }
}, { immediate: true })

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
      <BaseButton variant="primary" @click="openCreate">+ New Plan</BaseButton>
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

    <Transition name="fade" mode="out-in">
      <PlanList
        v-if="view === 'list'"
        key="list"
        :plans="filtered"
        :loading="planStore.isLoading"
        @edit="openEdit"
      />
      <PlanKanban
        v-else
        key="kanban"
        :plans="filtered"
        :loading="planStore.isLoading"
        @edit="openEdit"
        @delete="deleteTarget = $event"
      />
    </Transition>

    <PlanFormModal
      :open="isCreateOpen || editTarget !== null"
      :plan="editTarget"
      @close="router.replace({ query: {} })"
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
