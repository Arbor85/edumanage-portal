<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-vue-next'
import type { ScheduleEntryOut } from '../../../../types'

const props = defineProps<{
  entries: ScheduleEntryOut[]
  courseName: (id: string) => string
  trainerLabel: (id: string) => string
  buildingName: (id: string) => string
}>()

const emit = defineEmits<{
  move: [entryId: string, newStartDate: string, newStartTime: string, newEndTime: string]
}>()

const weekOffset = ref(0)

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOUR_START = 7
const HOUR_END = 22
const SLOT_HEIGHT = 52
const TOTAL_SLOTS = (HOUR_END - HOUR_START) * 2
const COL_MIN_WIDTH = 96 // px per day column

const weekDates = computed(() => {
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset + weekOffset.value * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
})

function toIso(d: Date) {
  return d.toISOString().slice(0, 10)
}

function weekLabel() {
  const first = weekDates.value[0]
  const last = weekDates.value[6]
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${first.toLocaleDateString(undefined, opts)} – ${last.toLocaleDateString(undefined, opts)}, ${last.getFullYear()}`
}

function isToday(d: Date) {
  return toIso(d) === toIso(new Date())
}

function isWeekend(d: Date) {
  const dow = d.getDay()
  return dow === 0 || dow === 6
}

const COLOR_PALETTE = [
  { solid: '#8b5cf6', cls: 'bg-violet-500' },
  { solid: '#0ea5e9', cls: 'bg-sky-500' },
  { solid: '#10b981', cls: 'bg-emerald-500' },
  { solid: '#f59e0b', cls: 'bg-amber-500' },
  { solid: '#f43f5e', cls: 'bg-rose-500' },
  { solid: '#6366f1', cls: 'bg-indigo-500' },
  { solid: '#14b8a6', cls: 'bg-teal-500' },
  { solid: '#f97316', cls: 'bg-orange-500' },
]

const colorMap = computed(() => {
  const map = new Map<string, typeof COLOR_PALETTE[0]>()
  props.entries.forEach((e, i) => map.set(e.id, COLOR_PALETTE[i % COLOR_PALETTE.length]))
  return map
})

interface Occurrence {
  entry: ScheduleEntryOut
  date: string
  dayIndex: number
  topPx: number
  heightPx: number
  color: typeof COLOR_PALETTE[0]
}

interface LayoutOccurrence extends Occurrence {
  colIndex: number
  colTotal: number
}

function layoutDay(occs: Occurrence[]): LayoutOccurrence[] {
  if (occs.length === 0) return []
  const sorted = [...occs].sort((a, b) => a.topPx - b.topPx)
  const laneEnds: number[] = []
  const assigned: Array<{ occ: Occurrence; lane: number }> = []
  for (const occ of sorted) {
    let lane = laneEnds.findIndex(end => end <= occ.topPx)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = occ.topPx + occ.heightPx
    assigned.push({ occ, lane })
  }
  return assigned.map(({ occ, lane }) => {
    const colTotal = assigned
      .filter(({ occ: o }) => o.topPx < occ.topPx + occ.heightPx && occ.topPx < o.topPx + o.heightPx)
      .reduce((max, { lane: l }) => Math.max(max, l + 1), 1)
    return { ...occ, colIndex: lane, colTotal }
  })
}

function timeToSlot(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h - HOUR_START) * 2 + Math.floor(m / 30)
}

function timeDiff(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

const occurrences = computed<Occurrence[]>(() => {
  const result: Occurrence[] = []
  const weekIsos = weekDates.value.map(toIso)

  for (const entry of props.entries) {
    const start = new Date(entry.startDate)
    const until = entry.validUntil ? new Date(entry.validUntil) : null
    const color = colorMap.value.get(entry.id) ?? COLOR_PALETTE[0]

    const topSlot = timeToSlot(entry.startTime)
    const durationMin = timeDiff(entry.startTime, entry.endTime)
    const topPx = Math.max(0, topSlot) * SLOT_HEIGHT
    const heightPx = Math.max(SLOT_HEIGHT * 0.6, (durationMin / 30) * SLOT_HEIGHT)

    if (entry.recurrenceType === 'none') {
      const dayIndex = weekIsos.indexOf(entry.startDate)
      if (dayIndex !== -1) result.push({ entry, date: entry.startDate, dayIndex, topPx, heightPx, color })
    } else if (entry.recurrenceType === 'weekly') {
      const originDow = start.getDay()
      weekDates.value.forEach((d, i) => {
        if (d.getDay() !== originDow || d < start || (until && d > until)) return
        result.push({ entry, date: toIso(d), dayIndex: i, topPx, heightPx, color })
      })
    } else if (entry.recurrenceType === 'daily') {
      weekDates.value.forEach((d, i) => {
        if (d < start || (until && d > until)) return
        result.push({ entry, date: toIso(d), dayIndex: i, topPx, heightPx, color })
      })
    } else if (entry.recurrenceType === 'every-n-days') {
      const interval = entry.recurrenceInterval ?? 1
      weekDates.value.forEach((d, i) => {
        if (d < start || (until && d > until)) return
        const diff = Math.round((d.getTime() - start.getTime()) / 86400000)
        if (diff % interval === 0) result.push({ entry, date: toIso(d), dayIndex: i, topPx, heightPx, color })
      })
    }
  }
  return result
})

const layoutByDay = computed(() => {
  const byDay = new Map<number, Occurrence[]>()
  for (const occ of occurrences.value) {
    const list = byDay.get(occ.dayIndex) ?? []
    list.push(occ)
    byDay.set(occ.dayIndex, list)
  }
  const result = new Map<number, LayoutOccurrence[]>()
  byDay.forEach((occs, dayIdx) => result.set(dayIdx, layoutDay(occs)))
  return result
})

const hourLabels = computed(() => {
  const labels = []
  for (let h = HOUR_START; h < HOUR_END; h++) {
    labels.push(`${String(h).padStart(2, '0')}:00`)
  }
  return labels
})

const dragging = ref<{ occ: Occurrence; offsetSlots: number } | null>(null)
const dragOverDay = ref<number | null>(null)
const dragOverSlot = ref<number | null>(null)

function onDragStart(e: DragEvent, occ: Occurrence) {
  if (!e.dataTransfer) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const offsetSlots = Math.floor((e.clientY - rect.top) / SLOT_HEIGHT)
  dragging.value = { occ, offsetSlots }
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', occ.entry.id)
}

function onDragOver(e: DragEvent, dayIndex: number, slotIndex: number) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  dragOverDay.value = dayIndex
  dragOverSlot.value = slotIndex
}

function onDrop(e: DragEvent, dayIndex: number, slotIndex: number) {
  e.preventDefault()
  if (!dragging.value) return
  const { occ, offsetSlots } = dragging.value
  const targetSlot = Math.max(0, Math.min(slotIndex - offsetSlots, TOTAL_SLOTS - 1))
  const newStartMinutes = HOUR_START * 60 + targetSlot * 30
  const durationMin = timeDiff(occ.entry.startTime, occ.entry.endTime)
  const newEndMinutes = newStartMinutes + durationMin
  const minsToTime = (m: number) =>
    `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  emit('move', occ.entry.id, toIso(weekDates.value[dayIndex]), minsToTime(newStartMinutes), minsToTime(newEndMinutes))
  dragging.value = null; dragOverDay.value = null; dragOverSlot.value = null
}

function onDragEnd() {
  dragging.value = null; dragOverDay.value = null; dragOverSlot.value = null
}

const totalGridWidth = computed(() => `${56 + 7 * COL_MIN_WIDTH}px`)
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Week navigation -->
    <div class="flex items-center gap-2">
      <button
        class="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        @click="weekOffset--"
      >
        <ChevronLeft class="w-4 h-4 text-text-secondary" />
      </button>
      <p class="text-sm font-semibold text-text-primary dark:text-white flex-1 text-center tracking-tight">
        {{ weekLabel() }}
      </p>
      <button
        class="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        @click="weekOffset++"
      >
        <ChevronRight class="w-4 h-4 text-text-secondary" />
      </button>
      <button
        class="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-text-secondary"
        @click="weekOffset = 0"
      >
        <Calendar class="w-3.5 h-3.5" /> Today
      </button>
    </div>

    <!-- Calendar grid — scrollable horizontally so it never squishes -->
    <div class="rounded-2xl border border-gray-100 dark:border-white/8 shadow-card overflow-hidden bg-surface dark:bg-surface-card">
      <div class="overflow-x-auto custom-scrollbar">
        <div :style="{ minWidth: totalGridWidth }">

          <!-- Header row -->
          <div class="grid border-b border-gray-100 dark:border-white/8" style="grid-template-columns: 56px repeat(7, 1fr)">
            <div class="py-3.5" />
            <div
              v-for="(d, i) in weekDates"
              :key="i"
              class="py-3.5 text-center border-l border-gray-100 dark:border-white/8 transition-colors"
              :class="isWeekend(d) ? 'bg-black/[0.015] dark:bg-white/[0.015]' : ''"
            >
              <p class="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">{{ DAY_NAMES[i] }}</p>
              <p
                class="text-sm font-bold mt-1 w-8 h-8 flex items-center justify-center rounded-full mx-auto transition-colors"
                :class="isToday(d)
                  ? 'bg-primary text-white shadow-glow-sm'
                  : 'text-text-primary dark:text-white'"
              >
                {{ d.getDate() }}
              </p>
            </div>
          </div>

          <!-- Scrollable body -->
          <div class="overflow-y-auto custom-scrollbar" style="max-height: calc(100dvh - 320px); min-height: 400px">
            <div
              class="grid relative"
              style="grid-template-columns: 56px repeat(7, 1fr)"
              :style="{ height: TOTAL_SLOTS * SLOT_HEIGHT + 'px' }"
            >
              <!-- Hour labels -->
              <div class="relative bg-surface dark:bg-surface-card border-r border-gray-100 dark:border-white/8">
                <div
                  v-for="(label, i) in hourLabels"
                  :key="label"
                  class="absolute right-2.5 text-[10px] font-medium text-text-secondary/70 tabular-nums select-none"
                  :style="{ top: i * 2 * SLOT_HEIGHT - 8 + 'px' }"
                >
                  {{ label }}
                </div>
              </div>

              <!-- Day columns -->
              <div
                v-for="(d, colIdx) in weekDates"
                :key="colIdx"
                class="relative border-l border-gray-100 dark:border-white/8 transition-colors"
                :class="isWeekend(d) ? 'bg-black/[0.012] dark:bg-white/[0.012]' : ''"
              >
                <!-- Slot drop targets -->
                <div
                  v-for="slotIdx in TOTAL_SLOTS"
                  :key="slotIdx"
                  class="absolute w-full transition-colors duration-75"
                  :class="[
                    slotIdx % 2 === 0
                      ? 'border-b border-gray-100 dark:border-white/5'
                      : 'border-b border-gray-50 dark:border-white/[0.03]',
                    dragOverDay === colIdx && dragOverSlot === slotIdx - 1
                      ? 'bg-primary/8 dark:bg-primary/10'
                      : ''
                  ]"
                  :style="{ top: (slotIdx - 1) * SLOT_HEIGHT + 'px', height: SLOT_HEIGHT + 'px' }"
                  @dragover="onDragOver($event, colIdx, slotIdx - 1)"
                  @drop="onDrop($event, colIdx, slotIdx - 1)"
                />

                <!-- Today highlight strip -->
                <div
                  v-if="isToday(d)"
                  class="absolute inset-0 bg-primary/[0.03] dark:bg-primary/[0.06] pointer-events-none"
                />

                <!-- Entry blocks -->
                <template v-for="occ in (layoutByDay.get(colIdx) ?? [])" :key="occ.entry.id + occ.date">
                  <div
                    class="absolute rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all duration-150 shadow-sm group"
                    :class="[occ.color.cls, dragging?.occ.entry.id === occ.entry.id ? 'opacity-30 scale-95' : 'opacity-95 hover:opacity-100 hover:shadow-md hover:-translate-y-px hover:z-10']"
                    :style="{
                      top: occ.topPx + 2 + 'px',
                      height: occ.heightPx - 4 + 'px',
                      left: `calc(${occ.colIndex / occ.colTotal * 100}% + 2px)`,
                      width: `calc(${100 / occ.colTotal}% - 4px)`,
                    }"
                    draggable="true"
                    @dragstart="onDragStart($event, occ)"
                    @dragend="onDragEnd"
                  >
                    <!-- Left accent bar -->
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-white/30 rounded-l-xl" />

                    <div class="px-2 py-1.5 pl-2.5 h-full flex flex-col justify-start gap-0.5 overflow-hidden">
                      <p class="text-white text-[11px] font-bold leading-tight truncate drop-shadow-sm">
                        {{ courseName(occ.entry.courseId) }}
                      </p>
                      <p class="text-white/85 text-[10px] leading-tight truncate tabular-nums font-medium">
                        {{ occ.entry.startTime }}–{{ occ.entry.endTime }}
                      </p>
                      <p v-if="occ.heightPx > 72" class="text-white/75 text-[9px] leading-tight truncate">
                        {{ buildingName(occ.entry.buildingId) }}
                      </p>
                      <p v-if="occ.heightPx > 100" class="text-white/65 text-[9px] leading-tight truncate">
                        {{ trainerLabel(occ.entry.trainerUserId) }}
                      </p>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="entries.length === 0"
      class="absolute inset-0 flex items-center justify-center pointer-events-none"
    />
  </div>
</template>
