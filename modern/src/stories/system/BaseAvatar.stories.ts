import type { Meta, StoryObj } from '@storybook/vue3'
import BaseAvatar from '../../components/BaseAvatar.vue'

const meta = {
  title: 'System / UI / BaseAvatar',
  component: BaseAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
  },
  args: {
    name: 'Alice Johnson',
    size: 'md',
  },
} satisfies Meta<typeof BaseAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const TextOnly: Story = {
  render: () => ({
    components: { BaseAvatar },
    template: `
      <div class="flex items-center gap-4">
        <BaseAvatar name="Alice Johnson" size="xs" />
        <BaseAvatar name="Alice Johnson" size="sm" />
        <BaseAvatar name="Alice Johnson" size="md" />
        <BaseAvatar name="Alice Johnson" size="lg" />
      </div>
    `,
  }),
}

export const WithImage: Story = {
  args: {
    name: 'Alice Johnson',
    src: 'https://i.pravatar.cc/150?img=1',
    size: 'md',
  },
  render: (args) => ({
    components: { BaseAvatar },
    setup() { return { args } },
    template: '<BaseAvatar v-bind="args" />',
  }),
}

export const AllColors: Story = {
  render: () => ({
    components: { BaseAvatar },
    template: `
      <div class="flex flex-wrap gap-3">
        <BaseAvatar name="Alice Johnson" size="md" />
        <BaseAvatar name="Bob Smith" size="md" />
        <BaseAvatar name="Carol White" size="md" />
        <BaseAvatar name="David Lee" size="md" />
        <BaseAvatar name="Eva Martinez" size="md" />
        <BaseAvatar name="Frank Brown" size="md" />
      </div>
    `,
  }),
}
