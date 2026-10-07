<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { CalendarOccurrence } from '../../../composables/useCoursesCalendar'

const props = defineProps<{
  weekStart: Date
  occurrences: CalendarOccurrence[]
}>()

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOUR_START = 8
const HOUR_END = 21
const PX_PER_HOUR = 40
const TOTAL_PX = (HOUR_END - HOUR_START) * PX_PER_HOUR

const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(props.weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
)

const todayIso = new Date().toISOString().slice(0, 10)
function iso(d: Date) { return d.toISOString().slice(0, 10) }

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function timeToTop(t: string): number {
  const mins = timeToMinutes(t) - HOUR_START * 60
  return Math.max(0, mins * PX_PER_HOUR / 60)
}

function durationToPx(start: string, end: string): number {
  const mins = timeToMinutes(end) - timeToMinutes(start)
  const capped = Math.min(mins, (HOUR_END - HOUR_START) * 60 - (timeToMinutes(start) - HOUR_START * 60))
  return Math.max(20, capped * PX_PER_HOUR / 60)
}

interface PositionedOccurrence {
  occ: CalendarOccurrence
  lane: number
  totalLanes: number
}

function positionOccurrences(occs: CalendarOccurrence[]): PositionedOccurrence[] {
  const sorted = [...occs].sort((a, b) => a.slot.startTime.localeCompare(b.slot.startTime))
  const laneEnds: number[] = []

  return sorted.map(occ => {
    const start = timeToMinutes(occ.slot.startTime)
    const end = timeToMinutes(occ.slot.endTime)
    let lane = laneEnds.findIndex(e => e <= start)
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(0) }
    laneEnds[lane] = end

    // Recalculate totalLanes after all assignments for this set would need a second pass.
    // We'll patch totalLanes below.
    return { occ, lane, totalLanes: 1 }
  }).map((item, _, arr) => ({
    ...item,
    totalLanes: laneEnds.length,
  }))
}

const dayBlocks = computed(() =>
  weekDays.value.map(day => {
    const key = iso(day)
    const dayOccs = props.occurrences.filter(o => iso(o.date) === key)
    return { day, blocks: positionOccurrences(dayOccs) }
  })
)

// Popover
interface PopoverState { occ: CalendarOccurrence; x: number; y: number }
const popover = ref<PopoverState | null>(null)

function showPopover(e: MouseEvent, occ: CalendarOccurrence) {
  e.stopPropagation()
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  popover.value = { occ, x: r.right + 8, y: r.top }
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
    <div class="overflow-x-auto">
      <div class="min-w-[560px]">
        <!-- Day headers -->
        <div class="grid border-b border-gray-100 dark:border-white/10" style="grid-template-columns: 48px repeat(7, 1fr)">
          <div class="border-r border-gray-100 dark:border-white/10" />
          <div
            v-for="(day, i) in weekDays" :key="i"
            class="py-2 text-center border-r border-gray-100 dark:border-white/10 last:border-r-0"
          >
            <div class="text-xs font-semibold text-text-secondary uppercase tracking-wider">{{ DAY_SHORT[i] }}</div>
            <div
              class="mx-auto mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold"
              :class="iso(day) === todayIso
                ? 'bg-primary text-white'
                : 'text-text-primary dark:text-white'"
            >{{ day.getDate() }}</div>
          </div>
        </div>

        <!-- Time grid -->
        <div
          class="grid relative overflow-y-auto"
          style="grid-template-columns: 48px repeat(7, 1fr); max-height: 520px"
        >
          <!-- Time labels column -->
          <div class="border-r border-gray-100 dark:border-white/10 relative" :style="{ height: TOTAL_PX + 'px' }">
            <div
              v-for="h in hours" :key="h"
              class="absolute right-2 text-[10px] text-text-secondary"
              :style="{ top: ((h - HOUR_START) * PX_PER_HOUR - 7) + 'px' }"
            >{{ String(h).padStart(2, '0') }}:00</div>
          </div>

          <!-- Day columns -->
          <div
            v-for="({ day, blocks }, i) in dayBlocks" :key="i"
            class="relative border-r border-gray-100 dark:border-white/10 last:border-r-0"
            :style="{ height: TOTAL_PX + 'px' }"
            :class="{ 'bg-primary/[0.03]': iso(day) === todayIso }"
          >
            <!-- Hour lines -->
            <div
              v-for="h in hours" :key="h"
              class="absolute left-0 right-0 border-t border-gray-100 dark:border-white/5"
              :style="{ top: ((h - HOUR_START) * PX_PER_HOUR) + 'px' }"
            />

            <!-- Course blocks -->
            <button
              v-for="{ occ, lane, totalLanes } in blocks" :key="occ.slot.id"
              class="absolute rounded-md px-1.5 py-1 text-left overflow-hidden hover:brightness-110 transition-all text-[10px] font-semibold"
              :style="{
                top: timeToTop(occ.slot.startTime) + 'px',
                height: durationToPx(occ.slot.startTime, occ.slot.endTime) + 'px',
                left: `calc(${lane / totalLanes * 100}% + 2px)`,
                right: `calc(${(1 - (lane + 1) / totalLanes) * 100}% + 2px)`,
                background: occ.color + '33',
                color: occ.color,
                borderLeft: `3px solid ${occ.color}`,
              }"
              @click="showPopover($event, occ)"
            >
              <div class="truncate">{{ occ.course.name }}</div>
              <div class="opacity-70 font-normal text-[9px]">{{ fmtTime(occ.slot.startTime) }} – {{ fmtTime(occ.slot.endTime) }}</div>
            </button>
          </div>
        </div>
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
        class="fixed z-50 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl shadow-xl p-3 w-52 text-sm"
        :style="{ left: popover.x + 'px', top: popover.y + 'px' }"
        @click.stop
      >
        <div class="flex items-center gap-2 mb-2">
          <span class="w-2.5 h-2.5 rounded-sm flex-shrink-0" :style="{ background: popover.occ.color }" />
          <span class="font-semibold text-text-primary dark:text-white truncate">{{ popover.occ.course.name }}</span>
        </div>
        <div class="space-y-1 text-xs text-text-secondary">
          <div v-if="popover.occ.course.type" class="inline-flex px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-text-primary dark:text-white/80">
            {{ TYPE_LABEL[popover.occ.course.type] ?? popover.occ.course.type }}
          </div>
          <div>{{ fmtTime(popover.occ.slot.startTime) }} – {{ fmtTime(popover.occ.slot.endTime) }}</div>
          <div>{{ fmtDays(popover.occ.slot.daysOfWeek) }}</div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
