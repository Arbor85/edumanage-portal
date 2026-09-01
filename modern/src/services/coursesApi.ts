import apiClient from './apiClient'
import type { CourseOut, CourseCreate, CourseUpdate, CourseAvailabilityOut, CourseAvailabilityCreate, CourseAvailabilityUpdate } from '../types'

export const listCourses = (): Promise<CourseOut[]> =>
  apiClient.get<CourseOut[]>('/api/courses').then((r) => r.data)

export const createCourse = (d: CourseCreate): Promise<CourseOut> =>
  apiClient.post<CourseOut>('/api/courses', d).then((r) => r.data)

export const updateCourse = (id: string, d: CourseUpdate): Promise<CourseOut> =>
  apiClient.put<CourseOut>(`/api/courses/${id}`, d).then((r) => r.data)

export const deleteCourse = (id: string): Promise<void> =>
  apiClient.delete(`/api/courses/${id}`).then(() => undefined)

// ── Availability ──────────────────────────────────────────────

export const listCourseAvailability = (courseId: string): Promise<CourseAvailabilityOut[]> =>
  apiClient.get<CourseAvailabilityOut[]>(`/api/courses/${courseId}/availability`).then((r) => r.data)

export const addCourseAvailability = (courseId: string, d: CourseAvailabilityCreate): Promise<CourseAvailabilityOut> =>
  apiClient.post<CourseAvailabilityOut>(`/api/courses/${courseId}/availability`, d).then((r) => r.data)

export const updateCourseAvailability = (courseId: string, availId: string, d: CourseAvailabilityUpdate): Promise<CourseAvailabilityOut> =>
  apiClient.put<CourseAvailabilityOut>(`/api/courses/${courseId}/availability/${availId}`, d).then((r) => r.data)

export const deleteCourseAvailability = (courseId: string, availId: string): Promise<void> =>
  apiClient.delete(`/api/courses/${courseId}/availability/${availId}`).then(() => undefined)
