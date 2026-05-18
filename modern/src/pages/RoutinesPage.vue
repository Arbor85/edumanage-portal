<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('Routines')
import { useRoutineStore } from '../stores/routineStore'
import { useExerciseStore } from '../stores/exerciseStore'
import type { RoutineOut } from '../types'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import ListSearchBar from '../components/ListSearchBar.vue'
import BaseButton from '../components/BaseButton.vue'
import RoutineList from './RoutinesPage/components/RoutineList.vue'
import RoutineFormModal from './RoutinesPage/components/RoutineFormModal.vue'

const routineStore = useRoutineStore()
const exerciseStore = useExerciseStore()

const search = ref('')
const isCreateOpen = ref(false)
const editTarget = ref<RoutineOut | null>(null)

onMounted(() => {
  routineStore.fetch()
  exerciseStore.fetch()
})

const filtered = computed(() =>
  routineStore.routines.filter((r) =>
    !search.value || r.name?.toLowerCase().includes(search.value.toLowerCase())
  )
)
</script>

<template>
  <AppLayout>
    <PageHeader title="Workouts" subtitle="Manage your workout routines.">
      <BaseButton variant="primary" @click="isCreateOpen = true">+ New Routine</BaseButton>
    </PageHeader>

    <div class="mb-4">
      <ListSearchBar
        v-model="search"
        placeholder="Search routines..."
        :loading="routineStore.isLoading"
        @refresh="routineStore.fetch()"
      />
    </div>

    <RoutineList
      :routines="filtered"
      :loading="routineStore.isLoading"
      @edit="editTarget = $event"
    />

    <RoutineFormModal
      :open="isCreateOpen || editTarget !== null"
      :routine="editTarget"
      @close="isCreateOpen = false; editTarget = null"
    />
  </AppLayout>
</template>
