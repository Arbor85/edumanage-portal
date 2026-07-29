import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '../services/apiClient'

export interface DailyChallenge {
  id: string
  description: string
  type: 'reps' | 'distance' | 'duration' | 'flexibility'
  target: number
  unit: string
}

const POOL: Omit<DailyChallenge, 'id'>[] = [
  { description: 'Do 10 push-ups', type: 'reps', target: 10, unit: 'push-ups' },
  { description: 'Do 20 squats', type: 'reps', target: 20, unit: 'squats' },
  { description: 'Hold a plank for 60 seconds', type: 'duration', target: 60, unit: 'seconds' },
  { description: 'Walk or run 1 km', type: 'distance', target: 1, unit: 'km' },
  { description: 'Do 15 jumping jacks', type: 'reps', target: 15, unit: 'jumping jacks' },
  { description: 'Do 10 burpees', type: 'reps', target: 10, unit: 'burpees' },
  { description: 'Hold a wall sit for 45 seconds', type: 'duration', target: 45, unit: 'seconds' },
  { description: 'Do 25 sit-ups', type: 'reps', target: 25, unit: 'sit-ups' },
  { description: 'Walk 5,000 steps', type: 'distance', target: 5000, unit: 'steps' },
  { description: 'Do 12 lunges per leg', type: 'reps', target: 12, unit: 'lunges per leg' },
  { description: 'Hold a deep stretch for 5 minutes', type: 'flexibility', target: 5, unit: 'minutes' },
  { description: 'Do 20 mountain climbers', type: 'reps', target: 20, unit: 'mountain climbers' },
  { description: 'Run up and down stairs 5 times', type: 'reps', target: 5, unit: 'times' },
  { description: 'Do 15 glute bridges', type: 'reps', target: 15, unit: 'glute bridges' },
  { description: 'Hold a side plank for 30 seconds each side', type: 'duration', target: 30, unit: 'seconds' },
  { description: 'Do 10 tricep dips', type: 'reps', target: 10, unit: 'tricep dips' },
  { description: 'Walk briskly for 10 minutes', type: 'duration', target: 10, unit: 'minutes' },
  { description: 'Do 30 calf raises', type: 'reps', target: 30, unit: 'calf raises' },
  { description: 'Do 10 slow deep breaths — mindful reset', type: 'flexibility', target: 10, unit: 'breaths' },
  { description: 'Do 8 pull-ups (or 15 inverted rows)', type: 'reps', target: 8, unit: 'pull-ups' },
  { description: 'Stretch your hip flexors for 2 minutes each side', type: 'flexibility', target: 4, unit: 'minutes total' },
  { description: 'Do 20 high knees', type: 'reps', target: 20, unit: 'high knees' },
  { description: 'Do 10 push-ups with a 3-second pause at the bottom', type: 'reps', target: 10, unit: 'slow push-ups' },
  { description: 'Do 15 lateral band walks each direction', type: 'reps', target: 15, unit: 'steps' },
  { description: 'Do a 2-minute cool-down walk after your next workout', type: 'duration', target: 2, unit: 'minutes' },
  { description: 'Do 20 bicycle crunches', type: 'reps', target: 20, unit: 'reps' },
  { description: 'Hold a downward dog for 90 seconds', type: 'duration', target: 90, unit: 'seconds' },
  { description: 'Do 5 slow push-up negatives', type: 'reps', target: 5, unit: 'negatives' },
  { description: 'March in place for 3 minutes', type: 'duration', target: 3, unit: 'minutes' },
  { description: 'Do 10 jump squats', type: 'reps', target: 10, unit: 'jump squats' },
]

const LS_COMPLETED = 'challengeCompleted'

function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

function getTodayChallenge(): DailyChallenge {
  const today = todayKey()
  // Deterministic daily index: day-of-year mod pool length, no repeat within 30 days
  const start = new Date(new Date().getFullYear(), 0, 0)
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86_400_000)
  const idx = dayOfYear % POOL.length
  return { id: today, ...POOL[idx] }
}

function isCompletedToday(): boolean {
  try {
    return localStorage.getItem(LS_COMPLETED) === todayKey()
  } catch {
    return false
  }
}

export const useChallengeStore = defineStore('challenge', () => {
  const todayChallenge = ref<DailyChallenge>(getTodayChallenge())
  const completedToday = ref(isCompletedToday())

  async function fetchTodayChallenge() {
    try {
      const res = await apiClient.get<DailyChallenge>('/api/challenges/today')
      todayChallenge.value = res.data
      completedToday.value = (res.data as DailyChallenge & { completedByUser?: boolean }).completedByUser ?? completedToday.value
    } catch {
      // API not yet available — use client-side pool (already set)
    }
  }

  async function logChallenge() {
    completedToday.value = true
    localStorage.setItem(LS_COMPLETED, todayKey())
    try {
      await apiClient.post('/api/challenges/log', { challengeId: todayChallenge.value.id })
    } catch {
      // Persist locally even if API fails
    }
  }

  return { todayChallenge, completedToday, fetchTodayChallenge, logChallenge }
})
