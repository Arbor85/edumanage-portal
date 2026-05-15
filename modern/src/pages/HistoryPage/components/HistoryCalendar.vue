<script setup lang="ts">
import { ref, computed } from 'vue'
import type { WorkoutHistoryOut } from '../../../types'

const props = defineProps<{ history: WorkoutHistoryOut[] }>()
const emit = defineEmits<{ view: [w: WorkoutHistoryOut] }>()

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function prev() {
  if (viewMonth.value === 0) { viewMonth.value = 11; viewYear.value-- }
  else viewMonth.value--
}
function next() {
  if (viewMonth.value === 11) { viewMonth.value = 0; viewYear.value++ }
  else viewMonth.value++
}

const calendarDays = computed(() => {
  const year = viewYear.value
  const month = viewMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: Array<{ date: Date | null; iso: string | null }> = []
  for (let i = 0; i < firstDay; i++) days.push({ date: null, iso: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    days.push({ date, iso: date.toISOString().slice(0, 10) })
  }
  return days
})

function workoutsForDay(iso: string | null) {
  if (!iso) return []
  return props.history.filter((w) => w.completedAt?.slice(0, 10) === iso)
}
</script>

<template>
  <div class="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-white/10 p-4">
    <div class="flex items-center justify-between mb-4">
      <button class="text-text-secondary hover:text-primary w-8 h-8 flex items-center justify-center rounded-lg" @click="prev">‹</button>
      <p class="font-semibold text-text-primary dark:text-white">{{ MONTH_NAMES[viewMonth] }} {{ viewYear }}</p>
      <button class="text-text-secondary hover:text-primary w-8 h-8 flex items-center justify-center rounded-lg" @click="next">›</button>
    </div>
    <div class="grid grid-cols-7 mb-2">
      <div v-for="d in DAY_NAMES" :key="d" class="text-center text-xs font-semibold text-text-secondary py-1">{{ d }}</div>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="(cell, idx) in calendarDays"
        :key="idx"
        class="min-h-[52px] rounded-xl p-1 text-xs"
        :class="cell.iso && workoutsForDay(cell.iso).length ? 'bg-primary-light dark:bg-primary/10' : ''"
      >
        <p v-if="cell.date" class="font-medium text-text-secondary mb-0.5">{{ cell.date.getDate() }}</p>
        <div class="flex flex-col gap-0.5">
          <button
            v-for="w in workoutsForDay(cell.iso)"
            :key="w.id ?? ''"
            class="bg-primary text-white rounded px-1 truncate text-left text-[10px] leading-4 hover:bg-primary-dark"
            @click="emit('view', w)"
          >{{ w.name ?? 'Workout' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
