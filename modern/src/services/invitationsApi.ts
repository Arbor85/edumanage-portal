import apiClient from './apiClient'
import type { InvitationOut, AcceptInvitationRequest } from '../types'

export const getInvitation = (code: string): Promise<InvitationOut> =>
  apiClient.get<InvitationOut>(`/api/invitations/${code}`).then((r) => r.data)

export const acceptInvitation = (code: string, d: AcceptInvitationRequest): Promise<void> =>
  apiClient.post(`/api/invitations/${code}/accept`, d).then(() => undefined)
