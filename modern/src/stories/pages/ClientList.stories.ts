import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import ClientList from '../../pages/ClientsPage/components/ClientList.vue'
import NotificationToast from '../../components/NotificationToast.vue'
import { useClientStore } from '../../stores/clientStore'
import { mockClients } from '../mocks/storeData'

function seedClientStore() {
  setActivePinia(createPinia())
  const s = useClientStore()
  s.clients = [...mockClients]
  return s
}

const meta = {
  title: 'Pages / Clients / ClientList',
  component: ClientList,
  tags: ['autodocs'],
  args: {
    clients: mockClients,
    loading: false,
  },
} satisfies Meta<typeof ClientList>

export default meta
type Story = StoryObj<typeof meta>

export const WithClients: Story = {
  render: (args) => ({
    components: { ClientList, NotificationToast },
    setup() {
      seedClientStore()
      return { args }
    },
    template: `
      <div class="w-full max-w-2xl">
        <ClientList v-bind="args" @edit="console.log('edit', $event)" />
        <NotificationToast />
      </div>
    `,
  }),
}

export const EmptySearch: Story = {
  args: { clients: [], loading: false },
  render: (args) => ({
    components: { ClientList, NotificationToast },
    setup() {
      seedClientStore()
      return { args }
    },
    template: `
      <div class="w-full max-w-2xl">
        <ClientList v-bind="args" @edit="console.log('edit', $event)" />
        <NotificationToast />
      </div>
    `,
  }),
}

export const Loading: Story = {
  args: { clients: [], loading: true },
  render: (args) => ({
    components: { ClientList, NotificationToast },
    setup() {
      seedClientStore()
      return { args }
    },
    template: `
      <div class="w-full max-w-2xl">
        <ClientList v-bind="args" @edit="console.log('edit', $event)" />
        <NotificationToast />
      </div>
    `,
  }),
}
