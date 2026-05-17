import type { Meta, StoryObj } from '@storybook/vue3'
import ProgressRing from '../../components/ProgressRing.vue'

const meta = {
  title: 'System / UI / ProgressRing',
  component: ProgressRing,
  tags: ['autodocs'],
  argTypes: {
    percent: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    size: { control: 'number' },
    strokeWidth: { control: 'number' },
  },
  args: {
    percent: 60,
    size: 120,
    strokeWidth: 8,
  },
} satisfies Meta<typeof ProgressRing>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { ProgressRing },
    setup() { return { args } },
    template: '<ProgressRing v-bind="args" />',
  }),
}

export const Zero: Story = {
  args: { percent: 0 },
  render: (args) => ({
    components: { ProgressRing },
    setup() { return { args } },
    template: '<ProgressRing v-bind="args" />',
  }),
}

export const Full: Story = {
  args: { percent: 100 },
  render: (args) => ({
    components: { ProgressRing },
    setup() { return { args } },
    template: '<ProgressRing v-bind="args" />',
  }),
}

export const WithLabel: Story = {
  args: { percent: 72, label: 'Complete' },
  render: (args) => ({
    components: { ProgressRing },
    setup() { return { args } },
    template: '<ProgressRing v-bind="args" />',
  }),
}

export const AllVariants: Story = {
  render: () => ({
    components: { ProgressRing },
    template: `
      <div class="flex items-center gap-6">
        <div class="flex flex-col items-center gap-2">
          <ProgressRing :percent="0" />
          <span class="text-xs text-text-secondary">0%</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <ProgressRing :percent="45" />
          <span class="text-xs text-text-secondary">45%</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <ProgressRing :percent="100" />
          <span class="text-xs text-text-secondary">100%</span>
        </div>
      </div>
    `,
  }),
}
