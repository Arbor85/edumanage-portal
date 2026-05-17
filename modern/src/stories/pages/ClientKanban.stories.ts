import type { Meta, StoryObj } from '@storybook/vue3'
import ClientKanban from '../../pages/ClientsPage/components/ClientKanban.vue'
import { mockClients } from '../mocks/storeData'

const meta = {
  title: 'Pages / Clients / ClientKanban',
  component: ClientKanban,
  tags: ['autodocs'],
  args: {
    clients: mockClients,
    loading: false,
  },
} satisfies Meta<typeof ClientKanban>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { ClientKanban },
    setup() { return { args } },
    template: `
      <div class="w-full max-w-2xl">
        <ClientKanban v-bind="args" @edit="console.log('edit', $event)" @delete="console.log('delete', $event)" />
      </div>
    `,
  }),
}

export const Loading: Story = {
  args: { clients: [], loading: true },
  render: (args) => ({
    components: { ClientKanban },
    setup() { return { args } },
    template: `
      <div class="w-full max-w-2xl">
        <ClientKanban v-bind="args" />
      </div>
    `,
  }),
}

export const Empty: Story = {
  args: { clients: [], loading: false },
  render: (args) => ({
    components: { ClientKanban },
    setup() { return { args } },
    template: `
      <div class="w-full max-w-2xl">
        <ClientKanban v-bind="args" />
      </div>
    `,
  }),
}
