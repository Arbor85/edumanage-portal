<script setup lang="ts">
import { computed } from 'vue'
import { useClientStore } from '../../../stores/clientStore'
import { useMeetingStore } from '../../../stores/meetingStore'
import { useWorkoutStore } from '../../../stores/workoutStore'
import { useRoutineStore } from '../../../stores/routineStore'
import StatCard from '../../../components/StatCard.vue'

const clientStore = useClientStore()
const meetingStore = useMeetingStore()
const workoutStore = useWorkoutStore()
const routineStore = useRoutineStore()

const now = new Date().toISOString()

const stats = computed(() => [
  { label: 'Active Clients', value: clientStore.active.length, icon: '👤', iconBg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Routines', value: routineStore.routines.length, icon: '📋', iconBg: 'bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Upcoming Meetings', value: meetingStore.meetings.filter((m) => (m.date ?? '') >= now).length, icon: '📅', iconBg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { label: 'Workouts This Month', value: workoutStore.history.filter((w) => w.completedAt?.slice(0, 7) === now.slice(0, 7)).length, icon: '🏋️', iconBg: 'bg-green-50 dark:bg-green-900/20' },
])
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard
      v-for="stat in stats"
      :key="stat.label"
      :label="stat.label"
      :value="stat.value"
      :icon="stat.icon"
      :icon-bg="stat.iconBg"
    />
  </div>
</template>
