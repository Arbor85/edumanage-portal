import type { Meta, StoryObj } from '@storybook/vue3'
import BaseSpinner from '../../components/BaseSpinner.vue'

const meta = {
  title: 'System / UI / BaseSpinner',
  component: BaseSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: {
    size: 'md',
  },
} satisfies Meta<typeof BaseSpinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { BaseSpinner },
    setup() { return { args } },
    template: '<BaseSpinner v-bind="args" />',
  }),
}

export const AllSizes: Story = {
  render: () => ({
    components: { BaseSpinner },
    template: `
      <div class="flex items-center gap-6">
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner size="sm" />
          <span class="text-xs text-text-secondary">sm</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner size="md" />
          <span class="text-xs text-text-secondary">md</span>
        </div>
        <div class="flex flex-col items-center gap-2">
          <BaseSpinner size="lg" />
          <span class="text-xs text-text-secondary">lg</span>
        </div>
      </div>
    `,
  }),
}
