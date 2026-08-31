<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
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

// Calendar state
const weekOffset = ref(0)

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOUR_START = 7
const HOUR_END = 22
const SLOT_HEIGHT = 40 // px per 30-min slot
const TOTAL_SLOTS = (HOUR_END - HOUR_START) * 2

// Week dates
const weekDates = computed(() => {
  const now = new Date()
  const day = now.getDay() // 0=Sun
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

// Entry colors by entry id (stable)
const COLOR_PALETTE = [
  'bg-violet-500/85', 'bg-sky-500/85', 'bg-emerald-500/85', 'bg-amber-500/85',
  'bg-rose-500/85', 'bg-indigo-500/85', 'bg-teal-500/85', 'bg-orange-500/85',
]
const colorMap = computed(() => {
  const map = new Map<string, string>()
  props.entries.forEach((e, i) => map.set(e.id, COLOR_PALETTE[i % COLOR_PALETTE.length]))
  return map
})

// Expand recurring entries into occurrences visible in the current week
interface Occurrence {
  entry: ScheduleEntryOut
  date: string
  dayIndex: number // 0=Mon
  topPx: number
  heightPx: number
  color: string
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
    const heightPx = Math.max(SLOT_HEIGHT / 2, (durationMin / 30) * SLOT_HEIGHT)

    if (entry.recurrenceType === 'none') {
      const iso = entry.startDate
      const dayIndex = weekIsos.indexOf(iso)
      if (dayIndex !== -1) {
        result.push({ entry, date: iso, dayIndex, topPx, heightPx, color })
      }
    } else if (entry.recurrenceType === 'weekly') {
      const originDow = start.getDay() // 0=Sun
      weekDates.value.forEach((d, i) => {
        const dow = d.getDay()
        if (dow !== originDow) return
        const iso = toIso(d)
        if (d < start) return
        if (until && d > until) return
        result.push({ entry, date: iso, dayIndex: i, topPx, heightPx, color })
      })
    } else if (entry.recurrenceType === 'daily') {
      weekDates.value.forEach((d, i) => {
        if (d < start) return
        if (until && d > until) return
        result.push({ entry, date: toIso(d), dayIndex: i, topPx, heightPx, color })
      })
    } else if (entry.recurrenceType === 'every-n-days') {
      const interval = entry.recurrenceInterval ?? 1
      weekDates.value.forEach((d, i) => {
        if (d < start) return
        if (until && d > until) return
        const diffDays = Math.round((d.getTime() - start.getTime()) / 86400000)
        if (diffDays % interval === 0) {
          result.push({ entry, date: toIso(d), dayIndex: i, topPx, heightPx, color })
        }
      })
    }
  }
  return result
})

// Hour labels
const hourLabels = computed(() => {
  const labels = []
  for (let h = HOUR_START; h < HOUR_END; h++) {
    labels.push(`${String(h).padStart(2, '0')}:00`)
  }
  return labels
})

// Drag and drop
const dragging = ref<{ occ: Occurrence; offsetSlots: number } | null>(null)
const dragOverDay = ref<number | null>(null)
const dragOverSlot = ref<number | null>(null)

function onDragStart(e: DragEvent, occ: Occurrence) {
  if (!e.dataTransfer) return
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const relY = e.clientY - rect.top
  const offsetSlots = Math.floor(relY / SLOT_HEIGHT)
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
  const newStartMinutes = (HOUR_START * 60) + targetSlot * 30
  const durationMin = timeDiff(occ.entry.startTime, occ.entry.endTime)
  const newEndMinutes = newStartMinutes + durationMin

  function minsToTime(m: number) {
    const h = Math.floor(m / 60) % 24
    const min = m % 60
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
  }

  const newDate = toIso(weekDates.value[dayIndex])
  const newStartTime = minsToTime(newStartMinutes)
  const newEndTime = minsToTime(newEndMinutes)

  emit('move', occ.entry.id, newDate, newStartTime, newEndTime)
  dragging.value = null
  dragOverDay.value = null
  dragOverSlot.value = null
}

function onDragEnd() {
  dragging.value = null
  dragOverDay.value = null
  dragOverSlot.value = null
}

function isToday(d: Date) {
  const now = new Date()
  return toIso(d) === toIso(now)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Week navigation -->
    <div class="flex items-center gap-3">
      <button
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        @click="weekOffset--"
      >
        <ChevronLeft class="w-4 h-4 text-text-secondary" />
      </button>
      <p class="text-sm font-medium text-text-primary dark:text-white flex-1 text-center">
        {{ weekLabel() }}
      </p>
      <button
        class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        @click="weekOffset++"
      >
        <ChevronRight class="w-4 h-4 text-text-secondary" />
      </button>
      <button
        class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-text-secondary"
        @click="weekOffset = 0"
      >
        Today
      </button>
    </div>

    <!-- Grid -->
    <div class="bg-surface dark:bg-surface-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
      <!-- Header row -->
      <div class="grid border-b border-gray-100 dark:border-white/5" style="grid-template-columns: 56px repeat(7, 1fr)">
        <div class="py-3" />
        <div
          v-for="(d, i) in weekDates"
          :key="i"
          class="py-3 text-center border-l border-gray-100 dark:border-white/5"
        >
          <p class="text-xs font-medium text-text-secondary">{{ DAY_NAMES[i] }}</p>
          <p
            class="text-sm font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full mx-auto"
            :class="isToday(d)
              ? 'bg-primary text-white'
              : 'text-text-primary dark:text-white'"
          >
            {{ d.getDate() }}
          </p>
        </div>
      </div>

      <!-- Scrollable body -->
      <div class="overflow-y-auto custom-scrollbar" style="max-height: 600px">
        <div
          class="grid relative"
          style="grid-template-columns: 56px repeat(7, 1fr)"
          :style="{ height: TOTAL_SLOTS * SLOT_HEIGHT + 'px' }"
        >
          <!-- Hour labels -->
          <div class="relative">
            <div
              v-for="(label, i) in hourLabels"
              :key="label"
              class="absolute right-2 text-[10px] text-text-secondary tabular-nums"
              :style="{ top: i * 2 * SLOT_HEIGHT - 7 + 'px' }"
            >
              {{ label }}
            </div>
          </div>

          <!-- Day columns -->
          <div
            v-for="(_d, colIdx) in weekDates"
            :key="colIdx"
            class="relative border-l border-gray-100 dark:border-white/5"
          >
            <!-- Slot backgrounds for drag targets -->
            <div
              v-for="slotIdx in TOTAL_SLOTS"
              :key="slotIdx"
              class="absolute w-full border-b border-gray-50 dark:border-white/[0.03] transition-colors"
              :class="{
                'border-b-gray-200 dark:border-b-white/10': slotIdx % 2 === 0,
                'bg-primary/5': dragOverDay === colIdx && dragOverSlot === slotIdx - 1,
              }"
              :style="{ top: (slotIdx - 1) * SLOT_HEIGHT + 'px', height: SLOT_HEIGHT + 'px' }"
              @dragover="onDragOver($event, colIdx, slotIdx - 1)"
              @drop="onDrop($event, colIdx, slotIdx - 1)"
            />

            <!-- Entry blocks -->
            <template v-for="occ in occurrences.filter(o => o.dayIndex === colIdx)" :key="occ.entry.id + occ.date">
              <div
                class="absolute left-0.5 right-0.5 rounded-lg px-1.5 py-1 cursor-grab active:cursor-grabbing overflow-hidden select-none"
                :class="[occ.color, dragging?.occ.entry.id === occ.entry.id ? 'opacity-40' : 'opacity-100']"
                :style="{ top: occ.topPx + 'px', height: occ.heightPx + 'px' }"
                draggable="true"
                @dragstart="onDragStart($event, occ)"
                @dragend="onDragEnd"
              >
                <p class="text-white text-[10px] font-semibold leading-tight truncate">
                  {{ courseName(occ.entry.courseId) }}
                </p>
                <p class="text-white/80 text-[9px] leading-tight truncate">
                  {{ occ.entry.startTime }}–{{ occ.entry.endTime }}
                </p>
                <p v-if="occ.heightPx > 50" class="text-white/70 text-[9px] leading-tight truncate mt-0.5">
                  {{ trainerLabel(occ.entry.trainerUserId) }}
                </p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
