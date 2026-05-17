import type { Meta, StoryObj } from '@storybook/vue3'
import { setActivePinia, createPinia } from 'pinia'
import WorkoutTimer from '../../pages/ActiveWorkoutPage/components/WorkoutTimer.vue'
import { useWorkoutStore } from '../../stores/workoutStore'

function seedWithActiveWorkout(elapsedSeconds = 0) {
  setActivePinia(createPinia())
  const store = useWorkoutStore()
  store.activeWorkout = {
    routineName: 'Push Day A',
    mode: 'routine',
    sourceWorkout: null,
    startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
    pausedAt: null,
    status: 'in_progress',
    totalPausedSeconds: 0,
    currentExerciseIndex: 1,
    currentSetIndex: 0,
    paused: false,
    elapsedSeconds,
    exercises: [],
  }
  store.elapsedSeconds = elapsedSeconds
  return store
}

const meta = {
  title: 'Pages / ActiveWorkout / WorkoutTimer',
  component: WorkoutTimer,
  tags: ['autodocs'],
} satisfies Meta<typeof WorkoutTimer>

export default meta
type Story = StoryObj<typeof meta>

export const Running: Story = {
  render: () => ({
    components: { WorkoutTimer },
    setup() {
      seedWithActiveWorkout(325)
    },
    template: '<WorkoutTimer />',
  }),
}

export const JustStarted: Story = {
  render: () => ({
    components: { WorkoutTimer },
    setup() {
      seedWithActiveWorkout(0)
    },
    template: '<WorkoutTimer />',
  }),
}

export const NoActiveWorkout: Story = {
  render: () => ({
    components: { WorkoutTimer },
    setup() {
      setActivePinia(createPinia())
    },
    template: '<WorkoutTimer />',
  }),
}
