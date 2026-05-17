import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import BaseTextarea from '../../components/BaseTextarea.vue'

const meta = {
  title: 'System / UI / BaseTextarea',
  component: BaseTextarea,
  tags: ['autodocs'],
  args: {
    modelValue: '',
    label: 'Notes',
    placeholder: 'Enter notes...',
    rows: 3,
    disabled: false,
  },
} satisfies Meta<typeof BaseTextarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { BaseTextarea },
    setup() {
      const val = ref(args.modelValue ?? '')
      return { args, val }
    },
    template: '<div class="w-80"><BaseTextarea v-bind="args" v-model="val" /></div>',
  }),
}

export const WithLabel: Story = {
  args: { label: 'Client notes', placeholder: 'Add any relevant information...' },
  render: (args) => ({
    components: { BaseTextarea },
    setup() {
      const val = ref('')
      return { args, val }
    },
    template: '<div class="w-80"><BaseTextarea v-bind="args" v-model="val" /></div>',
  }),
}

export const WithError: Story = {
  args: { label: 'Description', error: 'Description is required' },
  render: (args) => ({
    components: { BaseTextarea },
    setup() {
      const val = ref('')
      return { args, val }
    },
    template: '<div class="w-80"><BaseTextarea v-bind="args" v-model="val" /></div>',
  }),
}

export const Disabled: Story = {
  args: { label: 'Read-only', modelValue: 'This field cannot be edited.', disabled: true },
  render: (args) => ({
    components: { BaseTextarea },
    setup() {
      const val = ref(args.modelValue ?? '')
      return { args, val }
    },
    template: '<div class="w-80"><BaseTextarea v-bind="args" v-model="val" /></div>',
  }),
}
