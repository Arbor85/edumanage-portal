import type { Meta, StoryObj } from '@storybook/vue3'
import BaseButton from '../../components/BaseButton.vue'

const meta = {
  title: 'System / UI / BaseButton',
  component: BaseButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'danger', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    fullWidth: false,
  },
} satisfies Meta<typeof BaseButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { BaseButton },
    setup() { return { args } },
    template: '<BaseButton v-bind="args">Click me</BaseButton>',
  }),
}

export const AllVariants: Story = {
  render: () => ({
    components: { BaseButton },
    template: `
      <div class="flex flex-wrap gap-3">
        <BaseButton variant="primary">Primary</BaseButton>
        <BaseButton variant="secondary">Secondary</BaseButton>
        <BaseButton variant="danger">Danger</BaseButton>
        <BaseButton variant="ghost">Ghost</BaseButton>
      </div>
    `,
  }),
}

export const AllSizes: Story = {
  render: () => ({
    components: { BaseButton },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <BaseButton variant="primary" size="sm">Small</BaseButton>
        <BaseButton variant="primary" size="md">Medium</BaseButton>
        <BaseButton variant="primary" size="lg">Large</BaseButton>
      </div>
    `,
  }),
}

export const Loading: Story = {
  args: { variant: 'primary', loading: true },
  render: (args) => ({
    components: { BaseButton },
    setup() { return { args } },
    template: '<BaseButton v-bind="args">Saving...</BaseButton>',
  }),
}

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true },
  render: (args) => ({
    components: { BaseButton },
    setup() { return { args } },
    template: '<BaseButton v-bind="args">Disabled</BaseButton>',
  }),
}

export const FullWidth: Story = {
  args: { variant: 'primary', fullWidth: true },
  render: (args) => ({
    components: { BaseButton },
    setup() { return { args } },
    template: '<div class="w-64"><BaseButton v-bind="args">Full Width</BaseButton></div>',
  }),
}
