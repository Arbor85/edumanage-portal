import type { BodyMeasurementOut, BodyMeasurementCreate } from '../types'

const BASE = '/api/body-measurements'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

export function listMeasurements(): Promise<BodyMeasurementOut[]> {
  return request<BodyMeasurementOut[]>(BASE)
}

export function logMeasurement(data: BodyMeasurementCreate): Promise<BodyMeasurementOut> {
  return request<BodyMeasurementOut>(BASE, { method: 'POST', body: JSON.stringify(data) })
}

export function deleteMeasurement(id: string): Promise<void> {
  return request<void>(`${BASE}/${id}`, { method: 'DELETE' })
}
