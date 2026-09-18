<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSchedulePlanStore } from '../../../stores/schedulePlanStore'
import { useToast } from '../../../composables/useToast'
import PageHeader from '../../../components/layout/PageHeader.vue'
import ListSearchBar from '../../../components/ListSearchBar.vue'
import EmptyState from '../../../components/EmptyState.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import BaseButton from '../../../components/BaseButton.vue'
import BuildingCard from './components/BuildingCard.vue'
import BuildingFormModal from './components/BuildingFormModal.vue'
import { Building2, Plus } from 'lucide-vue-next'
import type { BuildingOut, BuildingAvailabilityCreate } from '../../../types'

const route = useRoute()
const router = useRouter()
const store = useSchedulePlanStore()
const toast = useToast()

const search = ref('')
const isFormOpen = ref(false)
const editTarget = ref<BuildingOut | null>(null)
const deleteTarget = ref<BuildingOut | null>(null)

onMounted(() => store.fetchBuildings())

watch(() => route.query, async (query) => {
  if (query.edit) {
    if (editTarget.value?.id === query.edit && isFormOpen.value) return
    try {
      editTarget.value = await store.getBuilding(query.edit as string)
      isFormOpen.value = true
    } catch {
      toast.error('Building not found')
      router.replace({ query: {} })
    }
  } else if (query.new) {
    if (isFormOpen.value && !editTarget.value) return
    editTarget.value = null
    isFormOpen.value = true
  } else {
    isFormOpen.value = false
    editTarget.value = null
  }
}, { immediate: true })

const filtered = computed(() =>
  store.buildings.filter(b =>
    !search.value || b.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

function openCreate() {
  editTarget.value = null
  isFormOpen.value = true
  router.push({ query: { new: '1' } })
}

function openEdit(building: BuildingOut) {
  editTarget.value = building
  isFormOpen.value = true
  router.push({ query: { edit: building.id } })
}

async function handleDelete() {
  if (!deleteTarget.value) return
  try {
    await store.removeBuilding(deleteTarget.value.id)
    toast.success('Building deleted')
  } catch {
    toast.error('Failed to delete building')
  } finally {
    deleteTarget.value = null
  }
}

async function handleAddAvailability(buildingId: string, payload: BuildingAvailabilityCreate) {
  await store.addBuildingAvailability(buildingId, payload)
}

async function handleDeleteAvailability(buildingId: string, slotId: string) {
  await store.deleteBuildingAvailability(buildingId, slotId)
}
</script>

<template>
  <div>
    <PageHeader title="Buildings" subtitle="Manage training venues and their availability.">
      <BaseButton variant="primary" @click="openCreate">
        <Plus class="w-4 h-4" /> Add Building
      </BaseButton>
    </PageHeader>

    <div class="mb-5">
      <ListSearchBar
        v-model="search"
        placeholder="Search buildings…"
        :loading="store.isLoading"
        @refresh="store.fetchBuildings()"
      />
    </div>

    <EmptyState
      v-if="filtered.length === 0 && !store.isLoading"
      :icon="Building2"
      :title="search ? 'No buildings match' : 'No buildings yet'"
      :description="search ? 'Try a different search term.' : 'Add a building to start scheduling sessions.'"
      :action-label="search ? undefined : 'Add Building'"
      @action="openCreate"
    />

    <div class="flex flex-col gap-3">
      <BuildingCard
        v-for="building in filtered"
        :key="building.id"
        :building="building"
        :availabilities="store.buildingAvailabilities[building.id] ?? []"
        @edit="openEdit"
        @delete="deleteTarget = building"
        @expand="store.fetchBuildingAvailability(building.id)"
        @add-availability="(payload) => handleAddAvailability(building.id, payload)"
        @delete-availability="(slotId) => handleDeleteAvailability(building.id, slotId)"
      />
    </div>

    <BuildingFormModal
      :open="isFormOpen"
      :building="editTarget"
      @close="router.replace({ query: {} })"
    />

    <ConfirmDialog
      :open="!!deleteTarget"
      title="Delete Building"
      :message="`Delete &quot;${deleteTarget?.name}&quot;? This cannot be undone.`"
      confirm-label="Delete"
      variant="danger"
      @confirm="handleDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
