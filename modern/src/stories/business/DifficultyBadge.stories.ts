import type { Meta, StoryObj } from '@storybook/vue3'
import DifficultyBadge from '../../components/DifficultyBadge.vue'

const meta = {
  title: 'Business / DifficultyBadge',
  component: DifficultyBadge,
  tags: ['autodocs'],
  argTypes: {
    level: { control: 'select', options: ['Beginner', 'Intermediate', 'Advanced', null] },
  },
  args: {
    level: 'Beginner',
  },
} satisfies Meta<typeof DifficultyBadge>

export default meta
type Story = StoryObj<typeof meta>

export const AllLevels: Story = {
  render: () => ({
    components: { DifficultyBadge },
    template: `
      <div class="flex gap-2">
        <DifficultyBadge level="Beginner" />
        <DifficultyBadge level="Intermediate" />
        <DifficultyBadge level="Advanced" />
      </div>
    `,
  }),
}

export const Beginner: Story = {
  args: { level: 'Beginner' },
  render: (args) => ({
    components: { DifficultyBadge },
    setup() { return { args } },
    template: '<DifficultyBadge v-bind="args" />',
  }),
}

export const Intermediate: Story = {
  args: { level: 'Intermediate' },
  render: (args) => ({
    components: { DifficultyBadge },
    setup() { return { args } },
    template: '<DifficultyBadge v-bind="args" />',
  }),
}

export const Advanced: Story = {
  args: { level: 'Advanced' },
  render: (args) => ({
    components: { DifficultyBadge },
    setup() { return { args } },
    template: '<DifficultyBadge v-bind="args" />',
  }),
}

export const Null: Story = {
  args: { level: null },
  render: (args) => ({
    components: { DifficultyBadge },
    setup() { return { args } },
    template: `
      <div>
        <DifficultyBadge v-bind="args" />
        <span class="text-xs text-text-secondary ml-2">(renders nothing when null)</span>
      </div>
    `,
  }),
}
