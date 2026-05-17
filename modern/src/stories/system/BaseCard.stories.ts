import type { Meta, StoryObj } from '@storybook/vue3'
import BaseCard from '../../components/BaseCard.vue'

const meta = {
  title: 'System / UI / BaseCard',
  component: BaseCard,
  tags: ['autodocs'],
  argTypes: {
    padding: { control: 'select', options: ['none', 'sm', 'md'] },
    hoverable: { control: 'boolean' },
  },
  args: {
    padding: 'md',
    hoverable: false,
  },
} satisfies Meta<typeof BaseCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { BaseCard },
    setup() { return { args } },
    template: `
      <div class="w-72">
        <BaseCard v-bind="args">
          <p class="text-text-primary dark:text-white text-sm">This is a card with default padding and content.</p>
        </BaseCard>
      </div>
    `,
  }),
}

export const SmallPadding: Story = {
  args: { padding: 'sm' },
  render: (args) => ({
    components: { BaseCard },
    setup() { return { args } },
    template: `
      <div class="w-72">
        <BaseCard v-bind="args">
          <p class="text-text-primary dark:text-white text-sm">Small padding card.</p>
        </BaseCard>
      </div>
    `,
  }),
}

export const NoPadding: Story = {
  args: { padding: 'none' },
  render: (args) => ({
    components: { BaseCard },
    setup() { return { args } },
    template: `
      <div class="w-72">
        <BaseCard v-bind="args">
          <img src="https://placehold.co/288x120" alt="card image" class="w-full rounded-t-2xl" />
          <div class="p-4">
            <p class="text-text-primary dark:text-white text-sm">Card with image header, no padding on card.</p>
          </div>
        </BaseCard>
      </div>
    `,
  }),
}

export const Hoverable: Story = {
  args: { hoverable: true },
  render: (args) => ({
    components: { BaseCard },
    setup() { return { args } },
    template: `
      <div class="w-72">
        <BaseCard v-bind="args">
          <p class="text-text-primary dark:text-white text-sm">Hover over me to see the shadow effect.</p>
        </BaseCard>
      </div>
    `,
  }),
}
