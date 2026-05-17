import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import ListSearchBar from '../../components/ListSearchBar.vue'

const meta = {
  title: 'System / UI / ListSearchBar',
  component: ListSearchBar,
  tags: ['autodocs'],
  args: {
    modelValue: '',
    placeholder: 'Search...',
    loading: false,
  },
} satisfies Meta<typeof ListSearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { ListSearchBar },
    setup() {
      const val = ref(args.modelValue ?? '')
      return { args, val }
    },
    template: '<div class="w-80"><ListSearchBar v-bind="args" v-model="val" /></div>',
  }),
}

export const WithValue: Story = {
  args: { modelValue: 'Alice' },
  render: (args) => ({
    components: { ListSearchBar },
    setup() {
      const val = ref(args.modelValue ?? '')
      return { args, val }
    },
    template: '<div class="w-80"><ListSearchBar v-bind="args" v-model="val" /></div>',
  }),
}

export const Loading: Story = {
  args: { loading: true },
  render: (args) => ({
    components: { ListSearchBar },
    setup() {
      const val = ref('')
      return { args, val }
    },
    template: '<div class="w-80"><ListSearchBar v-bind="args" v-model="val" /></div>',
  }),
}

export const CustomPlaceholder: Story = {
  args: { placeholder: 'Search by name or email...' },
  render: (args) => ({
    components: { ListSearchBar },
    setup() {
      const val = ref('')
      return { args, val }
    },
    template: '<div class="w-80"><ListSearchBar v-bind="args" v-model="val" /></div>',
  }),
}
