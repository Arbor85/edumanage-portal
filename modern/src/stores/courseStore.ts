import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CourseOut, CourseCreate, CourseUpdate } from '../types'
import * as coursesApi from '../services/coursesApi'

export const useCourseStore = defineStore('course', () => {
  const courses = ref<CourseOut[]>([])
  const isLoading = ref(false)

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
  }

  return { courses, isLoading, fetch, create, update, remove }
})
