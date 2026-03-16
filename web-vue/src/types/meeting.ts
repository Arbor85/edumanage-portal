export interface Meeting {
  id: string
  clientId: string
  startsAt: string
  price: number
  courseId?: string
}

export interface MeetingWritePayload {
  clientId: string
  startsAt: string
  price: number
  courseId?: string
}
