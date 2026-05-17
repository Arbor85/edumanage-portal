import type { Meta, StoryObj } from '@storybook/vue3'
import BaseBadge from '../../components/BaseBadge.vue'

const meta = {
  title: 'System / UI / BaseBadge',
  component: BaseBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'primary', 'success', 'warning', 'danger'] },
  },
  args: {
    label: 'Badge',
    variant: 'default',
  },
} satisfies Meta<typeof BaseBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { BaseBadge },
    setup() { return { args } },
    template: '<BaseBadge v-bind="args" />',
  }),
}

export const AllVariants: Story = {
  render: () => ({
    components: { BaseBadge },
    template: `
      <div class="flex flex-wrap gap-2">
        <BaseBadge label="Default" variant="default" />
        <BaseBadge label="Primary" variant="primary" />
        <BaseBadge label="Success" variant="success" />
        <BaseBadge label="Warning" variant="warning" />
        <BaseBadge label="Danger" variant="danger" />
      </div>
    `,
  }),
}
