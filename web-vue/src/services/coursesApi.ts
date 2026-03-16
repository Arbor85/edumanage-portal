import type { Course, CourseWritePayload } from '../types/course'
import { useAuth0 } from '@auth0/auth0-vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL in environment configuration')
}

const COURSES_ENDPOINT = `${API_BASE_URL}/api/courses`

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Course API request failed')
  }

  return response.json() as Promise<T>
}

export const useCoursesApi = () => {
  const { getAccessTokenSilently } = useAuth0()

  const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers)
    const token = await getAccessTokenSilently()

    headers.set('Authorization', `Bearer ${token}`)

    return fetch(input, {
      ...init,
      headers,
    })
  }

  const listCourses = async (): Promise<Course[]> => {
    const response = await fetchWithAuth(COURSES_ENDPOINT)
    return parseJsonResponse<Course[]>(response)
  }

  const addCourse = async (payload: CourseWritePayload): Promise<Course> => {
    const response = await fetchWithAuth(COURSES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    return parseJsonResponse<Course>(response)
  }

  const editCourse = async (courseId: string, payload: CourseWritePayload): Promise<Course> => {
    const response = await fetchWithAuth(`${COURSES_ENDPOINT}/${encodeURIComponent(courseId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    return parseJsonResponse<Course>(response)
  }

  const deleteCourse = async (courseId: string): Promise<void> => {
    const response = await fetchWithAuth(`${COURSES_ENDPOINT}/${encodeURIComponent(courseId)}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Course API request failed')
    }
  }

  return {
    listCourses,
    addCourse,
    editCourse,
    deleteCourse,
  }
}
