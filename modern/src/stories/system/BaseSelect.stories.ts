import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import BaseSelect from '../../components/BaseSelect.vue'

const sampleOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
]

const meta = {
  title: 'System / UI / BaseSelect',
  component: BaseSelect,
  tags: ['autodocs'],
  args: {
    modelValue: '',
    label: 'Choose option',
    options: sampleOptions,
    placeholder: 'Select...',
    disabled: false,
  },
} satisfies Meta<typeof BaseSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { BaseSelect },
    setup() {
      const val = ref(args.modelValue ?? '')
      return { args, val }
    },
    template: '<div class="w-72"><BaseSelect v-bind="args" v-model="val" /></div>',
  }),
}

export const WithLabel: Story = {
  args: { label: 'Difficulty level', placeholder: 'Select difficulty...' },
  render: (args) => ({
    components: { BaseSelect },
    setup() {
      const val = ref('')
      return { args, val }
    },
    template: '<div class="w-72"><BaseSelect v-bind="args" v-model="val" /></div>',
  }),
}

export const WithError: Story = {
  args: { label: 'Category', error: 'Category is required' },
  render: (args) => ({
    components: { BaseSelect },
    setup() {
      const val = ref('')
      return { args, val }
    },
    template: '<div class="w-72"><BaseSelect v-bind="args" v-model="val" /></div>',
  }),
}

export const Disabled: Story = {
  args: { label: 'Status', modelValue: 'a', disabled: true },
  render: (args) => ({
    components: { BaseSelect },
    setup() {
      const val = ref(args.modelValue ?? '')
      return { args, val }
    },
    template: '<div class="w-72"><BaseSelect v-bind="args" v-model="val" /></div>',
  }),
}
