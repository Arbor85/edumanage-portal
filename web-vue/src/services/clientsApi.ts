import type { Client } from '../types/client'
import { useAuth0 } from '@auth0/auth0-vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL in environment configuration')
}

const CLIENTS_ENDPOINT = `${API_BASE_URL}/api/clients`
const INVITATIONS_ENDPOINT = `${API_BASE_URL}/api/invitations`

export interface InvitationDetails {
  name: string | null
  imageUrl: string | null
}

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Client API request failed')
  }

  return response.json() as Promise<T>
}

export const useClientsApi = () => {
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

  const listClients = async (): Promise<Client[]> => {
    const response = await fetchWithAuth(CLIENTS_ENDPOINT)
    return parseJsonResponse<Client[]>(response)
  }

  const addClient = async (client: Client): Promise<Client> => {
    const response = await fetchWithAuth(CLIENTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(client),
    })

    return parseJsonResponse<Client>(response)
  }

  const editClient = async (invitationCode: string, client: Client): Promise<Client> => {
    const response = await fetchWithAuth(`${CLIENTS_ENDPOINT}/${encodeURIComponent(invitationCode)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(client),
    })

    return parseJsonResponse<Client>(response)
  }

  const deleteClient = async (invitationCode: string): Promise<Record<string, string>> => {
    const response = await fetchWithAuth(`${CLIENTS_ENDPOINT}/${encodeURIComponent(invitationCode)}`, {
      method: 'DELETE',
    })

    return parseJsonResponse<Record<string, string>>(response)
  }

  const getInvitationByCode = async (invitationCode: string): Promise<InvitationDetails> => {
    const response = await fetchWithAuth(`${INVITATIONS_ENDPOINT}/${encodeURIComponent(invitationCode)}`)
    return parseJsonResponse<InvitationDetails>(response)
  }

  const acceptInvitation = async (invitationCode: string, payload: { invitationCode: string; imageUrl: string }): Promise<void> => {
    const response = await fetchWithAuth(`${INVITATIONS_ENDPOINT}/${encodeURIComponent(invitationCode)}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invitationCode: payload.invitationCode,
        imageUrl: payload.imageUrl,
      }),
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Client API request failed')
    }
  }

  return {
    listClients,
    addClient,
    editClient,
    deleteClient,
    getInvitationByCode,
    acceptInvitation,
  }
}
