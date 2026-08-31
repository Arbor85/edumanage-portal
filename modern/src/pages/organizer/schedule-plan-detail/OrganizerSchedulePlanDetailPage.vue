<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSchedulePlanStore } from '../../../stores/schedulePlanStore'
import { useOrganizerStore } from '../../../stores/organizerStore'
import { useCourseStore } from '../../../stores/courseStore'
import { useToast } from '../../../composables/useToast'
import BaseBadge from '../../../components/BaseBadge.vue'
import BaseButton from '../../../components/BaseButton.vue'
import EmptyState from '../../../components/EmptyState.vue'
import ScheduleEntryCard from './components/ScheduleEntryCard.vue'
import ScheduleEntryFormModal from './components/ScheduleEntryFormModal.vue'
import ScheduleCalendarView from './components/ScheduleCalendarView.vue'
import AutoSchedulePanel from './components/AutoSchedulePanel.vue'
import { ChevronLeft, Plus, ClipboardList, Calendar, Zap } from 'lucide-vue-next'
import type { ScheduleEntryCreate } from '../../../types'

const route = useRoute()
const router = useRouter()
const store = useSchedulePlanStore()
const organizerStore = useOrganizerStore()
const courseStore = useCourseStore()
const toast = useToast()

const planId = route.params.id as string
const activeTab = ref<'manual' | 'calendar' | 'auto'>('manual')
const isEntryFormOpen = ref(false)
const autoRunning = ref(false)
const confirming = ref(false)

const plan = computed(() => store.plans.find(p => p.id === planId))

onMounted(() => Promise.all([
  store.fetchPlans(),
  store.fetchEntries(planId),
  store.fetchBuildings(),
  organizerStore.fetchOrg(),
  organizerStore.fetchTrainers(),
  organizerStore.fetchTrainerCourses(),
  courseStore.fetch(),
]))

async function togglePublish() {
  if (!plan.value) return
  try {
    if (plan.value.status === 'Published') {
      await store.unpublishPlan(planId)
      toast.success('Plan unpublished')
    } else {
      await store.publishPlan(planId)
      toast.success('Plan published')
    }
  } catch {
    toast.error('Failed to update plan status')
  }
}

async function handleAddEntry(entry: ScheduleEntryCreate) {
  await store.addEntry(planId, entry)
}

async function handleRemoveEntry(entryId: string) {
  await store.removeEntry(planId, entryId)
}

async function handleMoveEntry(entryId: string, newStartDate: string, newStartTime: string, newEndTime: string) {
  const entry = store.entries.find(e => e.id === entryId)
  if (!entry) return
  try {
    await store.updateEntry(planId, entryId, {
      trainerUserId: entry.trainerUserId,
      buildingId: entry.buildingId,
      courseId: entry.courseId,
      startDate: newStartDate,
      startTime: newStartTime,
      endTime: newEndTime,
      recurrenceType: entry.recurrenceType,
      recurrenceInterval: entry.recurrenceInterval,
      validUntil: entry.validUntil,
    })
  } catch {
    toast.error('Failed to move entry')
  }
}

async function handleAutoRun(selection: { courseIds: string[]; buildingIds: string[]; trainerIds: string[] }) {
  autoRunning.value = true
  try {
    await store.runAutoSchedule(planId, selection)
  } finally {
    autoRunning.value = false
  }
}

async function handleAutoConfirm() {
  confirming.value = true
  try {
    await store.confirmAutoSchedule(planId)
    toast.success('Schedule saved')
    activeTab.value = 'manual'
  } catch {
    toast.error('Failed to confirm schedule')
  } finally {
    confirming.value = false
  }
}

function trainerLabel(id: string) {
  const t = organizerStore.trainers.find(t => t.trainerUserId === id)
  if (t?.firstName || t?.lastName) return [t.firstName, t.lastName].filter(Boolean).join(' ')
  const parts = id.split('|')
  const hash = parts.length > 1 ? parts[1] : id
  return hash.length > 10 ? '···' + hash.slice(-10) : hash
}

function buildingName(id: string) {
  return store.buildings.find(b => b.id === id)?.name ?? id
}

function courseName(id: string) {
  return courseStore.courses.find(c => c.id === id)?.name ?? id
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <BaseButton variant="ghost" size="sm" @click="router.push('/organizer/schedule-plans')">
        <ChevronLeft class="w-5 h-5" />
      </BaseButton>
      <h1 class="text-xl font-bold text-text-primary dark:text-white flex-1 truncate">
        {{ plan?.name ?? 'Schedule Plan' }}
      </h1>
      <BaseBadge
        :label="plan?.status ?? ''"
        :variant="plan?.status === 'Published' ? 'success' : 'default'"
      />
      <BaseButton
        :variant="plan?.status === 'Published' ? 'secondary' : 'primary'"
        :disabled="!plan || store.entries.length === 0"
        @click="togglePublish"
      >
        {{ plan?.status === 'Published' ? 'Unpublish' : 'Publish' }}
      </BaseButton>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-black/5 dark:bg-white/5 rounded-xl p-1 w-fit">
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="activeTab === 'manual'
          ? 'bg-white dark:bg-white/10 text-text-primary dark:text-white shadow-sm'
          : 'text-text-secondary'"
        @click="activeTab = 'manual'"
      >
        <ClipboardList class="w-4 h-4" /> Manual
      </button>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="activeTab === 'calendar'
          ? 'bg-white dark:bg-white/10 text-text-primary dark:text-white shadow-sm'
          : 'text-text-secondary'"
        @click="activeTab = 'calendar'"
      >
        <Calendar class="w-4 h-4" /> Calendar
      </button>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="activeTab === 'auto'
          ? 'bg-white dark:bg-white/10 text-text-primary dark:text-white shadow-sm'
          : 'text-text-secondary'"
        @click="activeTab = 'auto'"
      >
        <Zap class="w-4 h-4" /> Auto
      </button>
    </div>

    <!-- Manual tab -->
    <div v-if="activeTab === 'manual'">
      <div class="flex justify-between items-center mb-4">
        <p class="text-sm text-text-secondary">
          {{ store.entries.length }} {{ store.entries.length === 1 ? 'entry' : 'entries' }}
        </p>
        <BaseButton variant="primary" size="sm" @click="isEntryFormOpen = true">
          <Plus class="w-4 h-4" /> Add Entry
        </BaseButton>
      </div>

      <EmptyState
        v-if="store.entries.length === 0"
        :icon="ClipboardList"
        title="No entries yet"
        description="Add schedule entries manually or use Auto to generate them."
        action-label="Add Entry"
        @action="isEntryFormOpen = true"
      />

      <div class="flex flex-col gap-2">
        <ScheduleEntryCard
          v-for="entry in store.entries"
          :key="entry.id"
          :entry="entry"
          :course-name="courseName(entry.courseId)"
          :trainer-label="trainerLabel(entry.trainerUserId)"
          :building-name="buildingName(entry.buildingId)"
          @delete="handleRemoveEntry"
        />
      </div>
    </div>

    <!-- Calendar tab -->
    <ScheduleCalendarView
      v-else-if="activeTab === 'calendar'"
      :entries="store.entries"
      :course-name="courseName"
      :trainer-label="trainerLabel"
      :building-name="buildingName"
      @move="handleMoveEntry"
    />

    <!-- Auto tab -->
    <AutoSchedulePanel
      v-else
      :trainers="organizerStore.trainers"
      :buildings="store.buildings"
      :courses="courseStore.courses"
      :proposal="store.autoScheduleProposal"
      :running="autoRunning"
      :confirming="confirming"
      @run="handleAutoRun"
      @confirm="handleAutoConfirm"
    />

    <ScheduleEntryFormModal
      :open="isEntryFormOpen"
      :trainers="organizerStore.trainers"
      :buildings="store.buildings"
      :courses="courseStore.courses"
      :trainer-courses="organizerStore.trainerCourses"
      @close="isEntryFormOpen = false"
      @saved="handleAddEntry"
    />
  </div>
</template>
