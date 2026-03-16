export type CourseType = 'Individual' | 'Group'

export interface CoursePrice {
  value: number
  currency: string
}

export interface Course {
  id: string
  name: string
  type: CourseType
  size?: number
  price: CoursePrice
  description?: string
}

export interface CourseWritePayload {
  name: string
  type: CourseType
  size?: number
  price: CoursePrice
  description?: string
}
