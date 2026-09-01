<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useMyScheduleStore } from '../stores/myScheduleStore'
import { useCourseStore } from '../stores/courseStore'
import { useSchedulePlanStore } from '../stores/schedulePlanStore'
import { CalendarDays, List, RotateCcw, Clock, MapPin } from 'lucide-vue-next'
import SkeletonBlock from '../components/SkeletonBlock.vue'
import EmptyState from '../components/EmptyState.vue'
import ScheduleCalendarView from './organizer/schedule-plan-detail/components/ScheduleCalendarView.vue'

const store = useMyScheduleStore()
const courseStore = useCourseStore()
const planStore = useSchedulePlanStore()
const viewMode = ref<'list' | 'calendar'>('list')

onMounted(() => Promise.all([store.fetch(), courseStore.fetch(), planStore.fetchBuildings()]))

function courseName(id: string) {
  return courseStore.courses.find(c => c.id === id)?.name ?? id
}

function buildingName(id: string) {
  return planStore.buildings.find(b => b.id === id)?.name ?? id
}

function recurrenceLabel(e: { recurrenceType: string; recurrenceInterval?: number | null }) {
  if (e.recurrenceType === 'none') return 'Once'
  if (e.recurrenceType === 'daily') return 'Daily'
  if (e.recurrenceType === 'weekly') return 'Weekly'
  if (e.recurrenceType === 'every-n-days') return `Every ${e.recurrenceInterval ?? '?'} days`
  return e.recurrenceType
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

const COLOR_BARS = [
  'bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
]
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-text-primary dark:text-white tracking-tight">My Schedule</h1>
        <p class="text-sm text-text-secondary mt-0.5">Your upcoming sessions and recurring classes</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Refresh"
          @click="store.fetch()"
        >
          <RotateCcw class="w-4 h-4" />
        </button>
        <div class="flex gap-1 bg-black/5 dark:bg-white/5 rounded-xl p-1">
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150"
            :class="viewMode === 'list' ? 'bg-white dark:bg-white/10 text-text-primary dark:text-white shadow-sm' : 'text-text-secondary'"
            @click="viewMode = 'list'"
          >
            <List class="w-4 h-4" /> List
          </button>
          <button
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150"
            :class="viewMode === 'calendar' ? 'bg-white dark:bg-white/10 text-text-primary dark:text-white shadow-sm' : 'text-text-secondary'"
            @click="viewMode = 'calendar'"
          >
            <CalendarDays class="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex flex-col gap-3">
      <SkeletonBlock v-for="i in 4" :key="i" height="5rem" />
    </div>

    <!-- Empty -->
    <EmptyState
      v-else-if="store.entries.length === 0"
      :icon="CalendarDays"
      title="No schedule yet"
      description="No schedule has been published for you yet."
    />

    <template v-else>
      <Transition name="fade" mode="out-in">

        <!-- List view -->
        <div v-if="viewMode === 'list'" key="list" class="flex flex-col gap-2">
          <div
            v-for="(entry, idx) in store.entries"
            :key="entry.id"
            class="stagger-item flex items-stretch bg-surface dark:bg-surface-card rounded-xl border border-gray-100 dark:border-white/6 shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-px hover:shadow-card"
            :style="{ animationDelay: idx * 35 + 'ms' }"
          >
            <div class="w-1 flex-shrink-0" :class="COLOR_BARS[idx % COLOR_BARS.length]" />
            <div class="flex-1 flex items-center gap-4 px-4 py-3.5 min-w-0">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm font-bold text-text-primary dark:text-white truncate">
                    {{ courseName(entry.courseId) }}
                  </span>
                  <span class="px-1.5 py-0.5 bg-primary/10 text-primary text-[11px] rounded-md font-semibold flex-shrink-0">
                    {{ recurrenceLabel(entry) }}
                  </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <div class="flex items-center gap-1.5">
                    <Clock class="w-3 h-3 text-text-secondary flex-shrink-0" />
                    <span class="text-xs text-text-secondary tabular-nums font-medium">
                      {{ formatDate(entry.startDate) }} · {{ entry.startTime }}–{{ entry.endTime }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <MapPin class="w-3 h-3 text-text-secondary flex-shrink-0" />
                    <span class="text-xs text-text-secondary truncate">{{ buildingName(entry.buildingId) }}</span>
                  </div>
                </div>
                <p v-if="entry.validUntil && entry.recurrenceType !== 'none'" class="text-[11px] text-text-secondary mt-1.5">
                  Until {{ formatDate(entry.validUntil) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Calendar view — same component as organizer -->
        <ScheduleCalendarView
          v-else
          key="calendar"
          :entries="store.entries"
          :course-name="courseName"
          :building-name="buildingName"
          :trainer-label="() => ''"
          @move="() => {}"
        />

      </Transition>
    </template>
  </div>
</template>
