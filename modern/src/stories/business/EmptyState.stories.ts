import type { Meta, StoryObj } from '@storybook/vue3'
import { Inbox, SearchX, Users } from 'lucide-vue-next'
import EmptyState from '../../components/EmptyState.vue'

const meta = {
  title: 'Business / EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    title: 'No items found',
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const TitleOnly: Story = {
  render: (args) => ({
    components: { EmptyState },
    setup() { return { args } },
    template: '<EmptyState v-bind="args" />',
  }),
}

export const WithDescription: Story = {
  args: {
    title: 'No clients yet',
    description: 'Add your first client to get started managing their training.',
  },
  render: (args) => ({
    components: { EmptyState },
    setup() { return { args } },
    template: '<EmptyState v-bind="args" />',
  }),
}

export const WithAction: Story = {
  args: {
    title: 'No routines yet',
    description: 'Create a routine to start planning workouts.',
    actionLabel: 'Create Routine',
  },
  render: (args) => ({
    components: { EmptyState },
    setup() { return { args } },
    template: '<EmptyState v-bind="args" @action="console.log(\'action clicked\')" />',
  }),
}

export const WithIcon: Story = {
  args: {
    title: 'Nothing to show',
    description: 'Your search did not match any results.',
    icon: SearchX,
  },
  render: (args) => ({
    components: { EmptyState },
    setup() { return { args } },
    template: '<EmptyState v-bind="args" />',
  }),
}

export const ClientsEmpty: Story = {
  render: () => ({
    components: { EmptyState, Users },
    setup() { return { Users } },
    template: `
      <EmptyState
        :icon="Users"
        title="No clients yet"
        description="Invite your first client to start tracking their progress."
        actionLabel="Invite Client"
        @action="console.log('invite')"
      />
    `,
  }),
}

export const InboxEmpty: Story = {
  render: () => ({
    components: { EmptyState, Inbox },
    setup() { return { Inbox } },
    template: `
      <EmptyState
        :icon="Inbox"
        title="All caught up"
        description="No pending items at the moment."
      />
    `,
  }),
}
