import apiClient from './apiClient'
import type { CourseOut, CourseCreate, CourseUpdate } from '../types'

export const listCourses = (): Promise<CourseOut[]> =>
  apiClient.get<CourseOut[]>('/api/courses').then((r) => r.data)

export const createCourse = (d: CourseCreate): Promise<CourseOut> =>
  apiClient.post<CourseOut>('/api/courses', d).then((r) => r.data)

export const updateCourse = (id: string, d: CourseUpdate): Promise<CourseOut> =>
  apiClient.put<CourseOut>(`/api/courses/${id}`, d).then((r) => r.data)

export const deleteCourse = (id: string): Promise<void> =>
  apiClient.delete(`/api/courses/${id}`).then(() => undefined)
