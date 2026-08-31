import apiClient from './apiClient'
import type {
  OrganizationCreate,
  OrganizationOut,
  OrganizationMemberOut,
  JoinOrganizationRequest,
  AvailabilityCreate,
  AvailabilityOut,
  TrainerCourseAssociationCreate,
  TrainerCourseAssociationOut,
} from '../types'

export const createOrganization = (d: OrganizationCreate): Promise<OrganizationOut> =>
  apiClient.post<OrganizationOut>('/api/organizations', d).then((r) => r.data)

export const getMyOrganization = (): Promise<OrganizationOut> =>
  apiClient.get<OrganizationOut>('/api/organizations/mine').then((r) => r.data)

export const generateInvite = (): Promise<OrganizationOut> =>
  apiClient.post<OrganizationOut>('/api/organizations/invite').then((r) => r.data)

export const joinOrganization = (code: string, body?: JoinOrganizationRequest): Promise<OrganizationMemberOut> =>
  apiClient.post<OrganizationMemberOut>(`/api/organizations/join/${code}`, body ?? {}).then((r) => r.data)

export const listTrainers = (): Promise<OrganizationMemberOut[]> =>
  apiClient.get<OrganizationMemberOut[]>('/api/organizations/trainers').then((r) => r.data)

export const removeTrainer = (trainerId: string): Promise<void> =>
  apiClient.delete(`/api/organizations/trainers/${trainerId}`).then(() => undefined)

export const listTrainerAvailability = (trainerId: string): Promise<AvailabilityOut[]> =>
  apiClient.get<AvailabilityOut[]>(`/api/organizations/trainers/${trainerId}/availability`).then((r) => r.data)

export const addTrainerAvailability = (trainerId: string, d: AvailabilityCreate): Promise<AvailabilityOut> =>
  apiClient.post<AvailabilityOut>(`/api/organizations/trainers/${trainerId}/availability`, d).then((r) => r.data)

export const updateTrainerAvailability = (trainerId: string, id: string, d: AvailabilityCreate): Promise<AvailabilityOut> =>
  apiClient.put<AvailabilityOut>(`/api/organizations/trainers/${trainerId}/availability/${id}`, d).then((r) => r.data)

export const deleteTrainerAvailability = (trainerId: string, id: string): Promise<void> =>
  apiClient.delete(`/api/organizations/trainers/${trainerId}/availability/${id}`).then(() => undefined)

export const listTrainerCourses = (): Promise<TrainerCourseAssociationOut[]> =>
  apiClient.get<TrainerCourseAssociationOut[]>('/api/organizations/trainer-courses').then((r) => r.data)

export const addTrainerCourse = (d: TrainerCourseAssociationCreate): Promise<TrainerCourseAssociationOut> =>
  apiClient.post<TrainerCourseAssociationOut>('/api/organizations/trainer-courses', d).then((r) => r.data)

export const deleteTrainerCourse = (id: string): Promise<void> =>
  apiClient.delete(`/api/organizations/trainer-courses/${id}`).then(() => undefined)
