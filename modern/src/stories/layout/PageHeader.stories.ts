import type { Meta, StoryObj } from '@storybook/vue3'
import PageHeader from '../../components/layout/PageHeader.vue'
import BaseButton from '../../components/BaseButton.vue'
import { Plus } from 'lucide-vue-next'

const meta = {
  title: 'Layout / PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  args: {
    title: 'Clients',
  },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { PageHeader },
    setup() { return { args } },
    template: '<div class="p-6 bg-surface-muted"><PageHeader v-bind="args" /></div>',
  }),
}

export const WithSubtitle: Story = {
  args: { title: 'Clients', subtitle: '5 active clients' },
  render: (args) => ({
    components: { PageHeader },
    setup() { return { args } },
    template: '<div class="p-6 bg-surface-muted"><PageHeader v-bind="args" /></div>',
  }),
}

export const WithBackButton: Story = {
  args: { title: 'Edit Routine', backTo: '/routines' },
  render: (args) => ({
    components: { PageHeader },
    setup() { return { args } },
    template: '<div class="p-6 bg-surface-muted"><PageHeader v-bind="args" /></div>',
  }),
}

export const WithActionSlot: Story = {
  args: { title: 'Clients', subtitle: '5 active clients' },
  render: (args) => ({
    components: { PageHeader, BaseButton, Plus },
    setup() { return { args, Plus } },
    template: `
      <div class="p-6 bg-surface-muted">
        <PageHeader v-bind="args">
          <BaseButton variant="primary" size="sm">
            <Plus class="w-4 h-4" />
            Add Client
          </BaseButton>
        </PageHeader>
      </div>
    `,
  }),
}
