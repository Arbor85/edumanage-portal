export interface Meeting {
  id: string
  clientId: string
  startsAt: string
  price: number
}

export interface MeetingWritePayload {
  clientId: string
  startsAt: string
  price: number
}
