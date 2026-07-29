import apiClient from './apiClient'
import type { UserProfile, UserProfileUpdate } from '../types'

const LS_KEY = 'userProfile'

function fromStorage(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function toStorage(profile: UserProfile) {
  localStorage.setItem(LS_KEY, JSON.stringify(profile))
}

export async function getProfile(): Promise<UserProfile | null> {
  try {
    const res = await apiClient.get<UserProfile>('/api/users/profile')
    toStorage(res.data)
    return res.data
  } catch {
    // API not yet available — fall back to localStorage
    return fromStorage()
  }
}

export async function updateProfile(data: UserProfileUpdate): Promise<UserProfile | null> {
  // Optimistically persist to localStorage immediately
  const existing = fromStorage()
  const merged: UserProfile = {
    userId: existing?.userId ?? '',
    goal: existing?.goal ?? null,
    experience: existing?.experience ?? null,
    equipment: existing?.equipment ?? [],
    reminderTime: existing?.reminderTime ?? null,
    onboardingComplete: existing?.onboardingComplete ?? false,
    ...data,
  }
  toStorage(merged)

  try {
    const res = await apiClient.patch<UserProfile>('/api/users/profile', data)
    toStorage(res.data)
    return res.data
  } catch {
    // API not yet available — localStorage already updated
    return merged
  }
}
