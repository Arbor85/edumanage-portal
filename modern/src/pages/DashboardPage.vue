<script setup lang="ts">
import { onMounted } from 'vue'
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('Dashboard')
import { useClientStore } from '../stores/clientStore'
import { useMeetingStore } from '../stores/meetingStore'
import { useRoutineStore } from '../stores/routineStore'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import ActiveWorkoutBanner from './DashboardPage/components/ActiveWorkoutBanner.vue'
import StatCardRow from './DashboardPage/components/StatCardRow.vue'
import RecommendedWorkoutCard from './DashboardPage/components/RecommendedWorkoutCard.vue'
import RecentActivityList from './DashboardPage/components/RecentActivityList.vue'
import DailyProgressCard from './DashboardPage/components/DailyProgressCard.vue'
import TodaysMealPlanCard from './DashboardPage/components/TodaysMealPlanCard.vue'

const clientStore = useClientStore()
const meetingStore = useMeetingStore()
const routineStore = useRoutineStore()

onMounted(() => {
  clientStore.fetch()
  meetingStore.fetch()
  routineStore.fetch()
})
</script>

<template>
  <AppLayout>
    <PageHeader title="Dashboard" subtitle="Welcome back, coach!" />

    <div class="flex flex-col gap-6">
      <ActiveWorkoutBanner />
      <StatCardRow />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 flex flex-col gap-4">
          <RecentActivityList />
          <RecommendedWorkoutCard />
        </div>
        <div class="flex flex-col gap-4">
          <DailyProgressCard />
          <TodaysMealPlanCard />
        </div>
      </div>
    </div>
  </AppLayout>
</template>
