import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import ClientFormModal from '../../pages/ClientsPage/components/ClientFormModal.vue'
import NotificationToast from '../../components/NotificationToast.vue'
import BaseButton from '../../components/BaseButton.vue'
import { useClientStore } from '../../stores/clientStore'
import { mockClients } from '../mocks/storeData'

function seedClientStore() {
  setActivePinia(createPinia())
  const s = useClientStore()
  s.clients = [...mockClients]
  return s
}

const meta = {
  title: 'Pages / Clients / ClientFormModal',
  component: ClientFormModal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    client: null,
  },
} satisfies Meta<typeof ClientFormModal>

export default meta
type Story = StoryObj<typeof meta>

export const CreateMode: Story = {
  args: { client: null },
  render: (args) => ({
    components: { ClientFormModal, NotificationToast, BaseButton },
    setup() {
      seedClientStore()
      const open = ref(true)
      return { args, open }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center">
        <BaseButton variant="primary" @click="open = true">Open Create Modal</BaseButton>
        <ClientFormModal :open="open" :client="null" @close="open = false" />
        <NotificationToast />
      </div>
    `,
  }),
}

export const EditMode: Story = {
  args: { client: mockClients[0] },
  render: (args) => ({
    components: { ClientFormModal, NotificationToast, BaseButton },
    setup() {
      seedClientStore()
      const open = ref(true)
      return { args, open }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center">
        <BaseButton variant="secondary" @click="open = true">Open Edit Modal</BaseButton>
        <ClientFormModal :open="open" :client="args.client" @close="open = false" />
        <NotificationToast />
      </div>
    `,
  }),
}
