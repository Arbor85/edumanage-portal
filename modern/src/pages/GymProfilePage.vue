<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGymProfileStore } from '../stores/gymProfileStore'
import { useToast } from '../composables/useToast'
import { usePageTitle } from '../composables/usePageTitle'
import type { UserExerciseMax, UserExerciseMaxUpsert } from '../types'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import EmptyState from '../components/EmptyState.vue'
import BaseSpinner from '../components/BaseSpinner.vue'
import BaseButton from '../components/BaseButton.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import ListSearchBar from '../components/ListSearchBar.vue'
import ExerciseMaxCard from './GymProfilePage/components/ExerciseMaxCard.vue'
import ExerciseMaxFormModal from './GymProfilePage/components/ExerciseMaxFormModal.vue'
import { Dumbbell, Plus } from 'lucide-vue-next'

usePageTitle('Gym Profile')

const route = useRoute()
const store = useGymProfileStore()
const toast = useToast()

const clientUserId = computed(() => route.params.userId as string | undefined)
const readonly = computed(() => !!clientUserId.value)

const clientMaxes = ref<UserExerciseMax[]>([])
const isLoadingClient = ref(false)

const search = ref('')

const maxes = computed(() =>
  readonly.value ? clientMaxes.value : store.maxes
)

const isLoading = computed(() =>
  readonly.value ? isLoadingClient.value : store.isLoading
)

const filtered = computed(() => {
  const s = search.value.toLowerCase()
  if (!s) return maxes.value
  return maxes.value.filter((m) =>
    m.exerciseName.toLowerCase().includes(s) ||
    (m.primaryMuscle?.toLowerCase().includes(s) ?? false)
  )
})

async function refreshClient() {
  if (!clientUserId.value) return
  isLoadingClient.value = true
  try {
    clientMaxes.value = await store.fetchForClient(clientUserId.value)
  } finally {
    isLoadingClient.value = false
  }
}

onMounted(() => {
  if (readonly.value) {
    refreshClient()
  } else {
    store.fetch()
  }
})

const isFormOpen = ref(false)
const editingMax = ref<UserExerciseMax | null>(null)
const confirmRemoveId = ref<number | null>(null)
const isRemoving = ref(false)

function openAdd() {
  editingMax.value = null
  isFormOpen.value = true
}

function openEdit(max: UserExerciseMax) {
  editingMax.value = max
  isFormOpen.value = true
}

async function onSave(exerciseId: number, data: UserExerciseMaxUpsert) {
  try {
    await store.upsert(exerciseId, data)
    isFormOpen.value = false
    toast.success('Max saved')
  } catch {
    toast.error('Failed to save')
  }
}

async function confirmRemove() {
  if (confirmRemoveId.value == null) return
  isRemoving.value = true
  try {
    await store.remove(confirmRemoveId.value)
    toast.success('Removed')
  } catch {
    toast.error('Failed to remove')
  } finally {
    isRemoving.value = false
    confirmRemoveId.value = null
  }
}
</script>

<template>
  <AppLayout>
    <PageHeader
      :title="readonly ? 'Client Gym Profile' : 'Gym Profile'"
      :subtitle="readonly ? 'Personal records for this client.' : 'Your personal records per exercise.'"
    />

    <div class="max-w-2xl mx-auto w-full flex flex-col gap-4">
      <!-- Toolbar -->
      <div class="flex items-center gap-3">
        <ListSearchBar
          v-model="search"
          placeholder="Search exercises…"
          :loading="isLoading"
          class="flex-1"
          @refresh="readonly ? refreshClient() : store.refresh()"
        />
        <BaseButton v-if="!readonly" variant="primary" @click="openAdd">
          <Plus class="w-4 h-4 mr-1" />
          Add
        </BaseButton>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-16">
        <BaseSpinner />
      </div>

      <!-- Empty -->
      <EmptyState
        v-else-if="filtered.length === 0"
        :icon="Dumbbell"
        :title="search ? 'No matches' : 'No records yet'"
        :description="search ? 'Try a different search.' : readonly ? 'This client has no personal records.' : 'Add your first personal record to track progress.'"
        :action-label="!readonly && !search ? 'Add Record' : undefined"
        @action="openAdd"
      />

      <!-- List -->
      <div v-else class="flex flex-col gap-3">
        <ExerciseMaxCard
          v-for="max in filtered"
          :key="max.exerciseId"
          :max="max"
          :readonly="readonly"
          @edit="openEdit(max)"
          @remove="confirmRemoveId = max.exerciseId"
        />
      </div>
    </div>

    <!-- Form modal -->
    <ExerciseMaxFormModal
      :open="isFormOpen"
      :editing="editingMax"
      @close="isFormOpen = false"
      @save="onSave"
    />

    <!-- Confirm remove -->
    <ConfirmDialog
      :open="confirmRemoveId != null"
      title="Remove record"
      message="This will permanently remove this personal record."
      confirm-label="Remove"
      variant="danger"
      @confirm="confirmRemove"
      @cancel="confirmRemoveId = null"
    />
  </AppLayout>
</template>
