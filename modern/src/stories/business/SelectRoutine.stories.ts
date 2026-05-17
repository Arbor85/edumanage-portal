import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import SelectRoutine from '../../components/SelectRoutine/index.vue'
import { useRoutineStore } from '../../stores/routineStore'
import { mockRoutines } from '../mocks/storeData'

function seedRoutineStore() {
  setActivePinia(createPinia())
  const store = useRoutineStore()
  store.routines = [...mockRoutines]
  return store
}

const meta = {
  title: 'Business / SelectRoutine',
  component: SelectRoutine,
  tags: ['autodocs'],
  decorators: [
    () => {
      seedRoutineStore()
      return { template: '<story />' }
    },
  ],
  args: {
    modelValue: null,
    label: 'Routine',
  },
} satisfies Meta<typeof SelectRoutine>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { SelectRoutine },
    setup() {
      seedRoutineStore()
      const val = ref<string | null>(null)
      return { args, val }
    },
    template: '<div class="w-72"><SelectRoutine v-bind="args" v-model="val" /></div>',
  }),
}

export const PreSelected: Story = {
  args: { modelValue: 'r1' },
  render: (args) => ({
    components: { SelectRoutine },
    setup() {
      seedRoutineStore()
      const val = ref<string | null>(args.modelValue ?? null)
      return { args, val }
    },
    template: '<div class="w-72"><SelectRoutine v-bind="args" v-model="val" /></div>',
  }),
}

export const WithError: Story = {
  args: { error: 'Routine selection is required' },
  render: (args) => ({
    components: { SelectRoutine },
    setup() {
      seedRoutineStore()
      const val = ref<string | null>(null)
      return { args, val }
    },
    template: '<div class="w-72"><SelectRoutine v-bind="args" v-model="val" /></div>',
  }),
}
