import type { Meta, StoryObj } from '@storybook/vue3'
import { setActivePinia, createPinia } from 'pinia'
import ActiveExerciseCard from '../../pages/ActiveWorkoutPage/components/ActiveExerciseCard.vue'
import { useWorkoutStore } from '../../stores/workoutStore'
import type { ActiveExercise } from '../../types'

function seedWorkoutStore() {
  setActivePinia(createPinia())
  return useWorkoutStore()
}

const mockExercise: ActiveExercise = {
  name: 'Barbell Squat',
  isBodyweight: false,
  currentSetIndex: 1,
  skipped: false,
  sets: [
    {
      setNumber: 1, reps: 10, weight: 60,
      targetReps: 10, targetWeight: 60,
      actualReps: 10, actualWeight: 60,
      completed: true, isBodyweight: false, note: null,
    },
    {
      setNumber: 2, reps: 8, weight: 80,
      targetReps: 8, targetWeight: 80,
      actualReps: null, actualWeight: null,
      completed: false, isBodyweight: false, note: null,
    },
    {
      setNumber: 3, reps: 8, weight: 80,
      targetReps: 8, targetWeight: 80,
      actualReps: null, actualWeight: null,
      completed: false, isBodyweight: false, note: null,
    },
  ],
}

const meta = {
  title: 'Pages / ActiveWorkout / ActiveExerciseCard',
  component: ActiveExerciseCard,
  tags: ['autodocs'],
  args: {
    exercise: mockExercise,
    isCurrent: true,
  },
} satisfies Meta<typeof ActiveExerciseCard>

export default meta
type Story = StoryObj<typeof meta>

export const Current: Story = {
  args: { exercise: mockExercise, isCurrent: true },
  render: (args) => ({
    components: { ActiveExerciseCard },
    setup() {
      seedWorkoutStore()
      return { args }
    },
    template: '<div class="w-80"><ActiveExerciseCard v-bind="args" /></div>',
  }),
}

export const NotCurrent: Story = {
  args: { exercise: { ...mockExercise, name: 'Bench Press' }, isCurrent: false },
  render: (args) => ({
    components: { ActiveExerciseCard },
    setup() {
      seedWorkoutStore()
      return { args }
    },
    template: '<div class="w-80"><ActiveExerciseCard v-bind="args" /></div>',
  }),
}

export const AllCompleted: Story = {
  args: {
    isCurrent: false,
    exercise: {
      ...mockExercise,
      currentSetIndex: 3,
      sets: mockExercise.sets.map((s) => ({ ...s, completed: true })),
    },
  },
  render: (args) => ({
    components: { ActiveExerciseCard },
    setup() {
      seedWorkoutStore()
      return { args }
    },
    template: '<div class="w-80"><ActiveExerciseCard v-bind="args" /></div>',
  }),
}
