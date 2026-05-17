import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import BaseInput from '../../components/BaseInput.vue'

const meta = {
  title: 'System / UI / BaseInput',
  component: BaseInput,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number'] },
  },
  args: {
    modelValue: '',
    label: 'Label',
    placeholder: 'Type here...',
    type: 'text',
    disabled: false,
  },
} satisfies Meta<typeof BaseInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { BaseInput },
    setup() {
      const val = ref(args.modelValue ?? '')
      return { args, val }
    },
    template: '<BaseInput v-bind="args" v-model="val" />',
  }),
}

export const WithLabel: Story = {
  args: { label: 'Email address', placeholder: 'user@example.com', type: 'email' },
  render: (args) => ({
    components: { BaseInput },
    setup() {
      const val = ref('')
      return { args, val }
    },
    template: '<div class="w-72"><BaseInput v-bind="args" v-model="val" /></div>',
  }),
}

export const WithError: Story = {
  args: { label: 'Email', placeholder: 'user@example.com', error: 'Email is required' },
  render: (args) => ({
    components: { BaseInput },
    setup() {
      const val = ref('')
      return { args, val }
    },
    template: '<div class="w-72"><BaseInput v-bind="args" v-model="val" /></div>',
  }),
}

export const WithHint: Story = {
  args: { label: 'Username', hint: 'Must be at least 4 characters' },
  render: (args) => ({
    components: { BaseInput },
    setup() {
      const val = ref('')
      return { args, val }
    },
    template: '<div class="w-72"><BaseInput v-bind="args" v-model="val" /></div>',
  }),
}

export const Disabled: Story = {
  args: { label: 'Read-only field', modelValue: 'Cannot edit this', disabled: true },
  render: (args) => ({
    components: { BaseInput },
    setup() {
      const val = ref(args.modelValue ?? '')
      return { args, val }
    },
    template: '<div class="w-72"><BaseInput v-bind="args" v-model="val" /></div>',
  }),
}

export const PasswordType: Story = {
  args: { label: 'Password', placeholder: '••••••••', type: 'password' },
  render: (args) => ({
    components: { BaseInput },
    setup() {
      const val = ref('')
      return { args, val }
    },
    template: '<div class="w-72"><BaseInput v-bind="args" v-model="val" /></div>',
  }),
}
