import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import SelectExercise from '../../components/SelectExercise/index.vue'
import { useExerciseStore } from '../../stores/exerciseStore'
import { mockExercises } from '../mocks/storeData'

function seedExerciseStore() {
  setActivePinia(createPinia())
  const store = useExerciseStore()
  store.exercises = [...mockExercises]
  return store
}

const meta = {
  title: 'Business / SelectExercise',
  component: SelectExercise,
  tags: ['autodocs'],
  decorators: [
    () => {
      seedExerciseStore()
      return { template: '<story />' }
    },
  ],
  args: {
    modelValue: null,
    label: 'Exercise',
  },
} satisfies Meta<typeof SelectExercise>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { SelectExercise },
    setup() {
      seedExerciseStore()
      const val = ref<number | null>(null)
      return { args, val }
    },
    template: '<div class="w-72"><SelectExercise v-bind="args" v-model="val" /></div>',
  }),
}

export const PreSelected: Story = {
  args: { modelValue: 1 },
  render: (args) => ({
    components: { SelectExercise },
    setup() {
      seedExerciseStore()
      const val = ref<number | null>(args.modelValue ?? null)
      return { args, val }
    },
    template: '<div class="w-72"><SelectExercise v-bind="args" v-model="val" /></div>',
  }),
}

export const WithError: Story = {
  args: { error: 'Exercise is required' },
  render: (args) => ({
    components: { SelectExercise },
    setup() {
      seedExerciseStore()
      const val = ref<number | null>(null)
      return { args, val }
    },
    template: '<div class="w-72"><SelectExercise v-bind="args" v-model="val" /></div>',
  }),
}
