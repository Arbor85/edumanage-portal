export type ClientTag =
  | 'Online'
  | 'Inperson'
  | 'Group'
  | 'Female'
  | 'Male'
  | 'Gym'
  | 'Mix'
  | 'CrossFit'

export type ClientStatus = 'Active' | 'Suspended' | 'Pending'

export interface Client {
  name: string
  tags: ClientTag[]
  imageUrl: string
  status: ClientStatus
  invitationCode: string
}
