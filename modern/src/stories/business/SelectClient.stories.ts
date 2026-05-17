import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import SelectClient from '../../components/SelectClient/index.vue'
import { useClientStore } from '../../stores/clientStore'
import { mockClients } from '../mocks/storeData'

function seedClientStore() {
  setActivePinia(createPinia())
  const store = useClientStore()
  store.clients = [...mockClients]
  return store
}

const meta = {
  title: 'Business / SelectClient',
  component: SelectClient,
  tags: ['autodocs'],
  decorators: [
    () => {
      seedClientStore()
      return { template: '<story />' }
    },
  ],
  args: {
    modelValue: null,
    label: 'Client',
    disabled: false,
  },
} satisfies Meta<typeof SelectClient>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { SelectClient },
    setup() {
      seedClientStore()
      const val = ref<string | null>(null)
      return { args, val }
    },
    template: '<div class="w-72"><SelectClient v-bind="args" v-model="val" /></div>',
  }),
}

export const PreSelected: Story = {
  args: { modelValue: 'c1', label: 'Client' },
  render: (args) => ({
    components: { SelectClient },
    setup() {
      seedClientStore()
      const val = ref<string | null>(args.modelValue ?? null)
      return { args, val }
    },
    template: '<div class="w-72"><SelectClient v-bind="args" v-model="val" /></div>',
  }),
}

export const WithError: Story = {
  args: { error: 'Client is required' },
  render: (args) => ({
    components: { SelectClient },
    setup() {
      seedClientStore()
      const val = ref<string | null>(null)
      return { args, val }
    },
    template: '<div class="w-72"><SelectClient v-bind="args" v-model="val" /></div>',
  }),
}

export const Disabled: Story = {
  args: { modelValue: 'c2', disabled: true },
  render: (args) => ({
    components: { SelectClient },
    setup() {
      seedClientStore()
      const val = ref<string | null>(args.modelValue ?? null)
      return { args, val }
    },
    template: '<div class="w-72"><SelectClient v-bind="args" v-model="val" /></div>',
  }),
}
