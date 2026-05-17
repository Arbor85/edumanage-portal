import type { Meta, StoryObj } from '@storybook/vue3'
import CountdownTimer from '../../components/CountdownTimer.vue'

const meta = {
  title: 'System / UI / CountdownTimer',
  component: CountdownTimer,
  tags: ['autodocs'],
  args: {
    seconds: 60,
    autoStart: false,
  },
} satisfies Meta<typeof CountdownTimer>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {
  args: { seconds: 90, autoStart: false },
  render: (args) => ({
    components: { CountdownTimer },
    setup() { return { args } },
    template: '<CountdownTimer v-bind="args" />',
  }),
}

export const AutoStart: Story = {
  args: { seconds: 30, autoStart: true },
  render: (args) => ({
    components: { CountdownTimer },
    setup() { return { args } },
    template: '<CountdownTimer v-bind="args" />',
  }),
}

export const LongTimer: Story = {
  args: { seconds: 300, autoStart: false },
  render: (args) => ({
    components: { CountdownTimer },
    setup() { return { args } },
    template: '<CountdownTimer v-bind="args" />',
  }),
}
