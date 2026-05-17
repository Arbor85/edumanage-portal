import type { Meta, StoryObj } from '@storybook/vue3'
import ClientKanbanCard from '../../pages/ClientsPage/components/ClientKanbanCard.vue'
import { mockClients } from '../mocks/storeData'

const meta = {
  title: 'Pages / Clients / ClientKanbanCard',
  component: ClientKanbanCard,
  tags: ['autodocs'],
  args: {
    client: mockClients[0],
  },
} satisfies Meta<typeof ClientKanbanCard>

export default meta
type Story = StoryObj<typeof meta>

export const ActiveClient: Story = {
  args: { client: mockClients[0] },
  render: (args) => ({
    components: { ClientKanbanCard },
    setup() { return { args } },
    template: `
      <div class="w-72">
        <ClientKanbanCard v-bind="args" @edit="console.log('edit')" @delete="console.log('delete')" />
      </div>
    `,
  }),
}

export const PendingClient: Story = {
  args: { client: mockClients[2] },
  render: (args) => ({
    components: { ClientKanbanCard },
    setup() { return { args } },
    template: `
      <div class="w-72">
        <ClientKanbanCard v-bind="args" @edit="console.log('edit')" @delete="console.log('delete')" />
      </div>
    `,
  }),
}
