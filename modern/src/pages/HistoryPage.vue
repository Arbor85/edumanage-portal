<script setup lang="ts">
import { ref } from 'vue'
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('History')
import type { WorkoutHistoryOut } from '../types'
import { useWorkoutStore } from '../stores/workoutStore'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import ViewToggle from '../components/ViewToggle.vue'
import HistoryList from './HistoryPage/components/HistoryList.vue'
import HistoryCalendar from './HistoryPage/components/HistoryCalendar.vue'
import WorkoutDetailModal from './HistoryPage/components/WorkoutDetailModal.vue'

const workoutStore = useWorkoutStore()
const view = ref<'list' | 'calendar'>('list')
const viewTarget = ref<WorkoutHistoryOut | null>(null)
</script>

<template>
  <AppLayout>
    <PageHeader title="Workout History" subtitle="Review your completed workouts." />

    <div class="mb-4 flex justify-end">
      <ViewToggle
        v-model="view"
        :options="[{ value: 'list', label: 'List' }, { value: 'calendar', label: 'Calendar' }]"
        storage-key="history-view"
      />
    </div>

    <HistoryList v-if="view === 'list'" :history="workoutStore.history" @view="viewTarget = $event" />
    <HistoryCalendar v-else :history="workoutStore.history" @view="viewTarget = $event" />

    <WorkoutDetailModal :open="viewTarget !== null" :workout="viewTarget" @close="viewTarget = null" />
  </AppLayout>
</template>
