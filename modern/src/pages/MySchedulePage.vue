<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useMyScheduleStore } from '../stores/myScheduleStore'
import { CalendarDays, List } from 'lucide-vue-next'

const store = useMyScheduleStore()
const viewMode = ref<'list' | 'calendar'>('list')

onMounted(async () => {
  await store.fetch()
})

// Calendar state
const currentMonth = ref(new Date())

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
})

function entriesForDay(day: number | null) {
  if (!day) return []
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const date = new Date(year, month, day)
  const dateStr = date.toISOString().slice(0, 10)
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })

  return store.entries.filter((e) => {
    if (!e.isRecurring) return e.date === dateStr
    if (!e.daysOfWeek.includes(dayName)) return false
    if (e.validFrom && dateStr < e.validFrom) return false
    if (e.validTo && dateStr > e.validTo) return false
    return true
  })
}

function prevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
}

const monthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">My Schedule</h1>
      <div class="flex gap-1 bg-black/5 dark:bg-white/5 rounded-xl p-1">
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          :class="viewMode === 'list' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-text-secondary'"
          @click="viewMode = 'list'"
        >
          <List class="w-4 h-4" /> List
        </button>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          :class="viewMode === 'calendar' ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-text-secondary'"
          @click="viewMode = 'calendar'"
        >
          <CalendarDays class="w-4 h-4" /> Calendar
        </button>
      </div>
    </div>

    <div v-if="store.isLoading" class="text-text-secondary text-sm">Loading…</div>

    <div v-else-if="store.entries.length === 0" class="text-center py-12">
      <CalendarDays class="w-12 h-12 text-text-muted mx-auto mb-3" />
      <p class="text-text-secondary text-sm">No schedule has been published for you yet.</p>
    </div>

    <template v-else>
      <!-- List view -->
      <div v-if="viewMode === 'list'" class="flex flex-col gap-3">
        <div
          v-for="entry in store.entries"
          :key="entry.id"
          class="bg-surface-card dark:bg-surface-card rounded-2xl border border-gray-200 dark:border-white/10 px-5 py-4"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">Course {{ entry.courseId.slice(0, 8) }}…</p>
              <p class="text-xs text-text-secondary mt-1">Building {{ entry.buildingId.slice(0, 8) }}…</p>
              <p class="text-xs text-primary mt-1">
                <template v-if="entry.isRecurring">
                  {{ entry.daysOfWeek.map(d => d.slice(0, 3)).join(', ') }} · {{ entry.startTime }}–{{ entry.endTime }}
                  <span class="text-text-muted ml-1">{{ entry.validFrom }} → {{ entry.validTo }}</span>
                </template>
                <template v-else>
                  {{ entry.date }} · {{ entry.startTime }}–{{ entry.endTime }}
                </template>
              </p>
            </div>
            <span class="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-lg font-medium">
              {{ entry.isRecurring ? 'Recurring' : 'One-off' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Calendar view -->
      <div v-else>
        <div class="flex items-center justify-between mb-4">
          <button class="px-3 py-1.5 rounded-xl text-sm text-text-secondary hover:bg-black/5 dark:hover:bg-white/5" @click="prevMonth">← Prev</button>
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ monthLabel }}</p>
          <button class="px-3 py-1.5 rounded-xl text-sm text-text-secondary hover:bg-black/5 dark:hover:bg-white/5" @click="nextMonth">Next →</button>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-1">
          <div v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="d" class="text-center text-xs text-text-muted py-1">{{ d }}</div>
        </div>

        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="(day, i) in calendarDays"
            :key="i"
            class="min-h-[80px] rounded-xl p-1.5"
            :class="day ? 'bg-surface-card dark:bg-surface-card border border-gray-200 dark:border-white/10' : ''"
          >
            <template v-if="day">
              <p class="text-xs text-text-secondary mb-1">{{ day }}</p>
              <div
                v-for="entry in entriesForDay(day)"
                :key="entry.id"
                class="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs mb-0.5 truncate"
              >
                {{ entry.startTime }}–{{ entry.endTime }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
