import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CourseOut, CourseCreate, CourseUpdate, CourseAvailabilityOut, CourseAvailabilityCreate } from '../types'
import * as coursesApi from '../services/coursesApi'

export const useCourseStore = defineStore('course', () => {
  const courses = ref<CourseOut[]>([])
  const isLoading = ref(false)
  const courseAvailabilities = ref<Record<string, CourseAvailabilityOut[]>>({})

  async function fetch() {
    isLoading.value = true
    try {
      courses.value = await coursesApi.listCourses()
    } finally {
      isLoading.value = false
    }
  }

  async function create(d: CourseCreate) {
    const created = await coursesApi.createCourse(d)
    courses.value.push(created)
    return created
  }

  async function update(id: string, d: CourseUpdate) {
    const updated = await coursesApi.updateCourse(id, d)
    const idx = courses.value.findIndex((c) => c.id === id)
    if (idx !== -1) courses.value[idx] = updated
    return updated
  }

  async function remove(id: string) {
    await coursesApi.deleteCourse(id)
    courses.value = courses.value.filter((c) => c.id !== id)
    delete courseAvailabilities.value[id]
  }

  // ── Availability ──────────────────────────────────────────────

  async function fetchCourseAvailability(courseId: string) {
    courseAvailabilities.value[courseId] = await coursesApi.listCourseAvailability(courseId)
  }

  async function addCourseAvailability(courseId: string, d: CourseAvailabilityCreate) {
    const created = await coursesApi.addCourseAvailability(courseId, d)
    if (!courseAvailabilities.value[courseId]) courseAvailabilities.value[courseId] = []
    courseAvailabilities.value[courseId].push(created)
  }

  async function deleteCourseAvailability(courseId: string, availId: string) {
    await coursesApi.deleteCourseAvailability(courseId, availId)
    if (courseAvailabilities.value[courseId]) {
      courseAvailabilities.value[courseId] = courseAvailabilities.value[courseId].filter((a) => a.id !== availId)
    }
  }

  return {
    courses, isLoading, courseAvailabilities,
    fetch, create, update, remove,
    fetchCourseAvailability, addCourseAvailability, deleteCourseAvailability,
  }
})
