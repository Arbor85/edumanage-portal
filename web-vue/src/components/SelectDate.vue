<template>
  <div>
    <button
      type="button"
      @click="openDialog"
      class="inline-flex w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      <span>{{ displayValue }}</span>
      <span class="text-xs text-slate-500 dark:text-slate-400">Pick day</span>
    </button>

    <div
      v-if="isOpen"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="closeDialog"
    >
      <div class="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">Select date</h3>
          <button
            type="button"
            @click="closeDialog"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div class="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <div class="mb-3 flex items-center justify-between">
            <button
              type="button"
              class="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              @click="goToPreviousMonth"
            >
              Prev
            </button>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ monthTitle }}</p>
            <button
              type="button"
              class="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              @click="goToNextMonth"
            >
              Next
            </button>
          </div>

          <div class="mb-2 grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <span v-for="dayName in dayNames" :key="dayName">{{ dayName }}</span>
          </div>

          <div class="grid grid-cols-7 gap-2">
            <button
              v-for="day in calendarDays"
              :key="day.key"
              type="button"
              :disabled="!day.isCurrentMonth"
              class="h-12 rounded-md border text-sm transition-colors"
              :class="dayClass(day)"
              @click="selectDay(day)"
            >
              {{ day.date.getDate() }}
            </button>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="closeDialog"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type CalendarCell = {
  key: string
  date: Date
  isCurrentMonth: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
  }>(),
  {
    modelValue: '',
    placeholder: 'Select date',
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const draftDate = ref<Date | null>(null)
const visibleMonth = ref(new Date())
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const toDate = (value: string) => {
  const normalizedValue = value?.split('T')[0] || ''
  if (!normalizedValue) return null

  const [yearPart, monthPart, dayPart] = normalizedValue.split('-')
  const year = Number(yearPart)
  const month = Number(monthPart)
  const day = Number(dayPart)

  if (!year || !month || !day) return null

  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? null : date
}

const toIsoDate = (value: Date | null) => {
  if (!value) return ''

  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const displayValue = computed(() => {
  return props.modelValue || props.placeholder
})

const monthTitle = computed(() => {
  return visibleMonth.value.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
})

const selectedIso = computed(() => toIsoDate(draftDate.value))
const todayIso = computed(() => toIsoDate(new Date()))

const calendarDays = computed<CalendarCell[]>(() => {
  const year = visibleMonth.value.getFullYear()
  const month = visibleMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const leading = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: CalendarCell[] = []

  for (let i = leading; i > 0; i -= 1) {
    const date = new Date(year, month, 1 - i)
    cells.push({ key: toIsoDate(date), date, isCurrentMonth: false })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day)
    cells.push({ key: toIsoDate(date), date, isCurrentMonth: true })
  }

  while (cells.length < 42) {
    const nextDay = cells.length - (leading + daysInMonth) + 1
    const date = new Date(year, month + 1, nextDay)
    cells.push({ key: toIsoDate(date), date, isCurrentMonth: false })
  }

  return cells
})

const dayClass = (day: CalendarCell) => {
  const iso = toIsoDate(day.date)
  const isSelected = iso === selectedIso.value
  const isToday = iso === todayIso.value
  const isPast = iso < todayIso.value

  if (!day.isCurrentMonth) {
    return 'border-slate-200/70 bg-slate-50/60 text-slate-300 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-600'
  }

  if (isSelected) {
    return 'border-emerald-500 bg-emerald-500 text-white dark:border-emerald-500 dark:bg-emerald-500'
  }

  if (isToday) {
    return 'border-sky-500 bg-white text-slate-900 dark:border-sky-400 dark:bg-slate-800 dark:text-slate-100'
  }

  if (isPast) {
    return 'border-slate-200/70 bg-white/60 text-slate-600 hover:bg-slate-100/80 dark:border-slate-700/70 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700/80'
  }

  return 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
}

const selectDay = (day: CalendarCell) => {
  if (!day.isCurrentMonth) return
  draftDate.value = day.date
  emit('update:modelValue', toIsoDate(day.date))
  isOpen.value = false
}

const goToPreviousMonth = () => {
  visibleMonth.value = new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth() - 1, 1)
}

const goToNextMonth = () => {
  visibleMonth.value = new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth() + 1, 1)
}

const openDialog = () => {
  draftDate.value = toDate(props.modelValue)
  visibleMonth.value = draftDate.value
    ? new Date(draftDate.value.getFullYear(), draftDate.value.getMonth(), 1)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  isOpen.value = true
}

const closeDialog = () => {
  isOpen.value = false
}

</script>
