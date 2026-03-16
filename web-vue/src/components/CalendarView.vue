<template>
  <div class="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
    <div class="mb-4 flex items-center justify-between">
      <button
        type="button"
        @click="changeMonth(-1)"
        class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
      >
        Previous
      </button>
      <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">
        {{ currentMonthYear }}
      </h2>
      <button
        type="button"
        @click="changeMonth(1)"
        class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
      >
        Next
      </button>
    </div>

    <div class="grid grid-cols-7 gap-2">
      <div
        v-for="weekDay in weekDays"
        :key="weekDay"
        class="py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400"
      >
        {{ weekDay }}
      </div>

      <div
        v-for="(cell, index) in calendarCells"
        :key="`calendar-cell-${index}`"
        :class="[
          'min-h-24 rounded border p-2',
          cell.isCurrentMonth
            ? 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800'
            : 'border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-900',
          cell.isToday ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : '',
        ]"
      >
        <slot name="day" v-bind="cell" />
      </div>
    </div>

    <slot name="footer" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: Date
  }>(),
  {
    modelValue: undefined,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: Date): void
}>()

const internalDate = ref(new Date())

const currentDate = computed({
  get: () => props.modelValue ?? internalDate.value,
  set: (val: Date) => {
    if (props.modelValue !== undefined) {
      emit('update:modelValue', val)
    } else {
      internalDate.value = val
    }
  },
})

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const currentMonthYear = computed(() =>
  currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
)

type CalendarCell = {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  dateString: string
  date: Date
}

const calendarCells = computed((): CalendarCell[] => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthLastDay = new Date(year, month, 0).getDate()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cells: CalendarCell[] = []

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const cellDate = new Date(year, month - 1, day)
    cellDate.setHours(0, 0, 0, 0)
    cells.push({ day, isCurrentMonth: false, isToday: false, dateString: toDateKey(cellDate), date: cellDate })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day)
    cellDate.setHours(0, 0, 0, 0)
    cells.push({
      day,
      isCurrentMonth: true,
      isToday: cellDate.getTime() === today.getTime(),
      dateString: toDateKey(cellDate),
      date: cellDate,
    })
  }

  const remaining = 42 - cells.length
  for (let day = 1; day <= remaining; day++) {
    const cellDate = new Date(year, month + 1, day)
    cellDate.setHours(0, 0, 0, 0)
    cells.push({ day, isCurrentMonth: false, isToday: false, dateString: toDateKey(cellDate), date: cellDate })
  }

  return cells
})

const toDateKey = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const changeMonth = (offset: number) => {
  const next = new Date(currentDate.value)
  next.setMonth(next.getMonth() + offset)
  currentDate.value = next
}
</script>
