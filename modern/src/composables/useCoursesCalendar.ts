import { computed, ref } from 'vue'
import type { CourseOut, CourseAvailabilityOut } from '../types'

export interface CalendarOccurrence {
  date: Date
  course: CourseOut
  slot: CourseAvailabilityOut
  color: string
}

export const COURSE_COLORS = [
  '#7c3aed',
  '#0891b2',
  '#16a34a',
  '#dc2626',
  '#d97706',
  '#db2777',
  '#2563eb',
  '#65a30d',
]

const DAY_TO_INDEX: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function useCoursesCalendar(
  getCourses: () => CourseOut[],
  getAvailabilities: () => Record<string, CourseAvailabilityOut[]>,
) {
  const today = new Date()
  const anchorDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))

  // Week start = Monday of the week containing anchorDate
  const weekStart = computed(() => {
    const d = new Date(anchorDate.value)
    const dow = d.getDay()
    const diff = dow === 0 ? -6 : 1 - dow
    d.setDate(d.getDate() + diff)
    return d
  })

  const monthRange = computed(() => ({
    from: new Date(anchorDate.value.getFullYear(), anchorDate.value.getMonth(), 1),
    to: new Date(anchorDate.value.getFullYear(), anchorDate.value.getMonth() + 1, 0),
  }))

  const weekRange = computed(() => {
    const from = new Date(weekStart.value)
    const to = new Date(from)
    to.setDate(to.getDate() + 6)
    return { from, to }
  })

  function prevMonth() {
    anchorDate.value = new Date(anchorDate.value.getFullYear(), anchorDate.value.getMonth() - 1, 1)
  }
  function nextMonth() {
    anchorDate.value = new Date(anchorDate.value.getFullYear(), anchorDate.value.getMonth() + 1, 1)
  }
  function prevWeek() {
    const d = new Date(anchorDate.value)
    d.setDate(d.getDate() - 7)
    anchorDate.value = d
  }
  function nextWeek() {
    const d = new Date(anchorDate.value)
    d.setDate(d.getDate() + 7)
    anchorDate.value = d
  }
  function goToday() {
    anchorDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
  }

  function courseColor(course: CourseOut): string {
    const idx = getCourses().findIndex(c => c.id === course.id)
    return COURSE_COLORS[(idx < 0 ? 0 : idx) % COURSE_COLORS.length]
  }

  function expandSlots(range: { from: Date; to: Date }): CalendarOccurrence[] {
    const result: CalendarOccurrence[] = []
    for (const course of getCourses()) {
      if (!course.id) continue
      const slots = getAvailabilities()[course.id] ?? []
      const color = courseColor(course)
      for (const slot of slots) {
        const validFrom = slot.validFrom ? parseLocalDate(slot.validFrom) : null
        const validTo = slot.validTo ? parseLocalDate(slot.validTo) : null
        const cur = new Date(range.from)
        while (cur <= range.to) {
          const dow = cur.getDay()
          if (slot.daysOfWeek.some(d => DAY_TO_INDEX[d] === dow)) {
            if ((!validFrom || cur >= validFrom) && (!validTo || cur <= validTo)) {
              result.push({ date: new Date(cur), course, slot, color })
            }
          }
          cur.setDate(cur.getDate() + 1)
        }
      }
    }
    return result
  }

  const monthOccurrences = computed(() => expandSlots(monthRange.value))
  const weekOccurrences = computed(() => expandSlots(weekRange.value))

  return {
    anchorDate,
    weekStart,
    monthRange,
    weekRange,
    monthOccurrences,
    weekOccurrences,
    prevMonth, nextMonth,
    prevWeek, nextWeek,
    goToday,
    courseColor,
  }
}
