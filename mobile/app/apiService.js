// API service for interacting with backend (Alpaki Planner Fitness API)
// Provides methods for authentication, workout history, training plans, and mentees


import Constants from 'expo-constants';
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://localhost:8000/api';

async function request(endpoint, { method = 'GET', body, token } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || res.statusText);
  }
  return res.json();
}

// --- Authentication ---
export const apiAuth = {
  exchangeToken: (body) => request('/auth/token', { method: 'POST', body }),
  health: () => request('/auth/health'),
};

// --- Workout History ---
export const apiWorkoutHistory = {
  get: (params = '', token) => request(`/history${params ? '?' + params : ''}`, { token }),
  create: (body, token) => request('/history', { method: 'POST', body, token }),
};

// --- Training Plans ---
export const apiTrainingPlans = {
  getAll: (token) => request('/training-plans', { token }),
  create: (body, token) => request('/training-plans', { method: 'POST', body, token }),
  getById: (planId, token) => request(`/training-plans/${planId}`, { token }),
  update: (planId, body, token) => request(`/training-plans/${planId}`, { method: 'PUT', body, token }),
  delete: (planId, token) => request(`/training-plans/${planId}`, { method: 'DELETE', token }),
};

// --- Mentees ---
export const apiMentees = {
  getAll: (token) => request('/mentees', { token }),
  create: (body, token) => request('/mentees', { method: 'POST', body, token }),
  acceptInvitation: (inviteKey, token) => request(`/mentees/accept-invitation/${inviteKey}`, { method: 'POST', token }),
  delete: (menteeId, token) => request(`/mentees/${menteeId}`, { method: 'DELETE', token }),
};

export default {
  apiAuth,
  apiWorkoutHistory,
  apiTrainingPlans,
  apiMentees,
};
