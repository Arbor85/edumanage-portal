<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCourseStore } from '../../../stores/courseStore'
import { useCoursesCalendar } from '../../../composables/useCoursesCalendar'
import CourseCalendarMonthView from './CourseCalendarMonthView.vue'
import CourseCalendarWeekView from './CourseCalendarWeekView.vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const courseStore = useCourseStore()

const mode = ref<'month' | 'week'>('month')

const cal = useCoursesCalendar(
  () => courseStore.courses,
  () => courseStore.courseAvailabilities,
)

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const headerLabel = computed(() => {
  if (mode.value === 'month') {
    const d = cal.anchorDate.value
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
  }
  const { from, to } = cal.weekRange.value
  if (from.getMonth() === to.getMonth())
    return `${from.getDate()} – ${to.getDate()} ${MONTH_NAMES[from.getMonth()]} ${from.getFullYear()}`
  return `${from.getDate()} ${MONTH_NAMES[from.getMonth()]} – ${to.getDate()} ${MONTH_NAMES[to.getMonth()]} ${to.getFullYear()}`
})

function prev() { mode.value === 'month' ? cal.prevMonth() : cal.prevWeek() }
function next() { mode.value === 'month' ? cal.nextMonth() : cal.nextWeek() }
function today() { cal.goToday() }

async function ensureAvailabilities() {
  for (const course of courseStore.courses) {
    if (course.id && !courseStore.courseAvailabilities[course.id]) {
      await courseStore.fetchCourseAvailability(course.id)
    }
  }
}

onMounted(ensureAvailabilities)
watch(() => courseStore.courses, ensureAvailabilities)
</script>

<template>
  <div class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
    <!-- Calendar header -->
    <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-white/10">
      <button
        class="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        @click="prev"
      ><ChevronLeft class="w-4 h-4" /></button>
      <button
        class="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        @click="next"
      ><ChevronRight class="w-4 h-4" /></button>

      <span class="font-semibold text-text-primary dark:text-white text-sm min-w-[160px]">{{ headerLabel }}</span>

      <button
        class="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/15 text-text-secondary hover:text-text-primary hover:border-gray-300 dark:hover:border-white/25 transition-colors"
        @click="today"
      >Today</button>

      <div class="ml-auto flex bg-gray-100 dark:bg-white/5 rounded-lg p-0.5 gap-0.5">
        <button
          class="px-3 py-1 rounded-md text-xs font-medium transition-colors"
          :class="mode === 'month'
            ? 'bg-white dark:bg-white/15 text-text-primary dark:text-white shadow-sm'
            : 'text-text-secondary hover:text-text-primary dark:hover:text-white'"
          @click="mode = 'month'"
        >Month</button>
        <button
          class="px-3 py-1 rounded-md text-xs font-medium transition-colors"
          :class="mode === 'week'
            ? 'bg-white dark:bg-white/15 text-text-primary dark:text-white shadow-sm'
            : 'text-text-secondary hover:text-text-primary dark:hover:text-white'"
          @click="mode = 'week'"
        >Week</button>
      </div>
    </div>

    <!-- Views -->
    <CourseCalendarMonthView
      v-if="mode === 'month'"
      :year="cal.anchorDate.value.getFullYear()"
      :month="cal.anchorDate.value.getMonth()"
      :occurrences="cal.monthOccurrences.value"
    />
    <CourseCalendarWeekView
      v-else
      :week-start="cal.weekStart.value"
      :occurrences="cal.weekOccurrences.value"
    />
  </div>
</template>
