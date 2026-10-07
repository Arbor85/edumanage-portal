<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { CalendarOccurrence } from '../../../composables/useCoursesCalendar'
import { COURSE_COLORS } from '../../../composables/useCoursesCalendar'

const props = defineProps<{
  year: number
  month: number
  occurrences: CalendarOccurrence[]
}>()

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const calendarDays = computed(() => {
  const { year, month } = props
  const firstDow = new Date(year, month, 1).getDay()
  const offset = (firstDow + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevEnd = new Date(year, month, 0).getDate()

  const days: { date: Date; current: boolean }[] = []
  for (let i = offset - 1; i >= 0; i--)
    days.push({ date: new Date(year, month - 1, prevEnd - i), current: false })
  for (let d = 1; d <= daysInMonth; d++)
    days.push({ date: new Date(year, month, d), current: true })
  const tail = (7 - (days.length % 7)) % 7
  for (let d = 1; d <= tail; d++)
    days.push({ date: new Date(year, month + 1, d), current: false })
  return days
})

const todayIso = new Date().toISOString().slice(0, 10)

function iso(d: Date) { return d.toISOString().slice(0, 10) }

function occurrencesFor(d: Date): CalendarOccurrence[] {
  const key = iso(d)
  return props.occurrences
    .filter(o => iso(o.date) === key)
    .sort((a, b) => a.slot.startTime.localeCompare(b.slot.startTime))
}

interface PopoverState {
  occurrence?: CalendarOccurrence
  overflow?: CalendarOccurrence[]
  x: number
  y: number
}
const popover = ref<PopoverState | null>(null)

function showOccurrencePopover(e: MouseEvent, occ: CalendarOccurrence) {
  e.stopPropagation()
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  popover.value = { occurrence: occ, x: r.left + r.width / 2, y: r.bottom + 8 }
}

function showOverflowPopover(e: MouseEvent, occs: CalendarOccurrence[]) {
  e.stopPropagation()
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  popover.value = { overflow: occs, x: r.left + r.width / 2, y: r.bottom + 8 }
}

function closePopover() { popover.value = null }
onMounted(() => document.addEventListener('click', closePopover))
onUnmounted(() => document.removeEventListener('click', closePopover))

function fmtTime(t: string) { return t.slice(0, 5) }
function fmtDays(days: string[]) { return days.map(d => d.slice(0, 3)).join(', ') }

const TYPE_LABEL: Record<string, string> = {
  'online': 'Online', 'in-person': 'In-person', 'hybrid': 'Hybrid',
}

const uniqueCourses = computed(() => {
  const seen = new Set<string>()
  return props.occurrences.filter(o => {
    if (!o.course.id || seen.has(o.course.id)) return false
    seen.add(o.course.id!)
    return true
  })
})
</script>

<template>
  <div>
    <!-- Day headers -->
    <div class="grid grid-cols-7 border-b border-gray-100 dark:border-white/10">
      <div
        v-for="d in DAY_NAMES" :key="d"
        class="py-2 text-center text-xs font-semibold text-text-secondary uppercase tracking-wider"
      >{{ d }}</div>
    </div>

    <!-- Day cells -->
    <div class="grid grid-cols-7">
      <div
        v-for="(cell, idx) in calendarDays" :key="idx"
        class="min-h-[88px] p-1.5 border-r border-b border-gray-100 dark:border-white/10 last:border-r-0"
        :class="{ 'bg-primary/5': iso(cell.date) === todayIso }"
      >
        <!-- Day number -->
        <div class="mb-1">
          <span
            class="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full"
            :class="[
              iso(cell.date) === todayIso
                ? 'bg-primary text-white'
                : cell.current
                  ? 'text-text-primary dark:text-white'
                  : 'text-text-secondary/40 dark:text-white/20'
            ]"
          >{{ cell.date.getDate() }}</span>
        </div>

        <!-- Chips -->
        <template v-if="occurrencesFor(cell.date).length">
          <button
            v-for="occ in occurrencesFor(cell.date).slice(0, 2)"
            :key="occ.slot.id"
            class="w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded mb-0.5 truncate border-l-2 hover:brightness-110 transition-all"
            :style="{ borderColor: occ.color, background: occ.color + '22', color: occ.color }"
            @click="showOccurrencePopover($event, occ)"
          >{{ occ.course.name }} · {{ fmtTime(occ.slot.startTime) }}</button>

          <button
            v-if="occurrencesFor(cell.date).length > 2"
            class="text-[10px] text-text-secondary hover:text-text-primary dark:hover:text-white px-1 transition-colors"
            @click="showOverflowPopover($event, occurrencesFor(cell.date).slice(2))"
          >+{{ occurrencesFor(cell.date).length - 2 }} more</button>
        </template>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-x-5 gap-y-1 px-4 py-3 border-t border-gray-100 dark:border-white/10">
      <div v-for="o in uniqueCourses" :key="o.course.id!" class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" :style="{ background: o.color }" />
        <span class="text-xs text-text-secondary">{{ o.course.name }}</span>
      </div>
    </div>

    <!-- Popover -->
    <Teleport to="body">
      <div
        v-if="popover"
        class="fixed z-50 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl shadow-xl p-3 w-56 text-sm"
        :style="{ left: popover.x + 'px', top: popover.y + 'px', transform: 'translateX(-50%)' }"
        @click.stop
      >
        <!-- Single occurrence -->
        <template v-if="popover.occurrence">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" :style="{ background: popover.occurrence.color }" />
            <span class="font-semibold text-text-primary dark:text-white truncate">{{ popover.occurrence.course.name }}</span>
          </div>
          <div class="space-y-1 text-xs text-text-secondary">
            <div v-if="popover.occurrence.course.type" class="inline-flex px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-text-primary dark:text-white/80">
              {{ TYPE_LABEL[popover.occurrence.course.type] ?? popover.occurrence.course.type }}
            </div>
            <div>{{ fmtTime(popover.occurrence.slot.startTime) }} – {{ fmtTime(popover.occurrence.slot.endTime) }}</div>
            <div>{{ fmtDays(popover.occurrence.slot.daysOfWeek) }}</div>
          </div>
        </template>

        <!-- Overflow list -->
        <template v-else-if="popover.overflow">
          <div
            v-for="occ in popover.overflow" :key="occ.slot.id"
            class="flex items-center gap-2 py-1 cursor-pointer hover:opacity-80"
            @click="popover = { occurrence: occ, x: popover!.x, y: popover!.y }"
          >
            <span class="w-2 h-2 rounded-sm flex-shrink-0" :style="{ background: occ.color }" />
            <span class="text-xs text-text-primary dark:text-white truncate">{{ occ.course.name }} · {{ fmtTime(occ.slot.startTime) }}</span>
          </div>
        </template>
      </div>
    </Teleport>
  </div>
</template>
