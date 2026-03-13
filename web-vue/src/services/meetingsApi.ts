import type { Meeting, MeetingWritePayload } from '../types/meeting'
import { useAuth0 } from '@auth0/auth0-vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL in environment configuration')
}

const MEETINGS_ENDPOINT = `${API_BASE_URL}/api/meetings`

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Meeting API request failed')
  }

  return response.json() as Promise<T>
}

export const useMeetingsApi = () => {
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

  const listMeetings = async (): Promise<Meeting[]> => {
    const response = await fetchWithAuth(MEETINGS_ENDPOINT)
    return parseJsonResponse<Meeting[]>(response)
  }

  const addMeeting = async (payload: MeetingWritePayload): Promise<Meeting> => {
    const response = await fetchWithAuth(MEETINGS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return parseJsonResponse<Meeting>(response)
  }

  const editMeeting = async (meetingId: string, payload: MeetingWritePayload): Promise<Meeting> => {
    const response = await fetchWithAuth(`${MEETINGS_ENDPOINT}/${encodeURIComponent(meetingId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return parseJsonResponse<Meeting>(response)
  }

  const deleteMeeting = async (meetingId: string): Promise<void> => {
    const response = await fetchWithAuth(`${MEETINGS_ENDPOINT}/${encodeURIComponent(meetingId)}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Meeting API request failed')
    }
  }

  return {
    listMeetings,
    addMeeting,
    editMeeting,
    deleteMeeting,
  }
}
