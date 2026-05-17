import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import PaginationBar from '../../components/PaginationBar.vue'

const meta = {
  title: 'System / UI / PaginationBar',
  component: PaginationBar,
  tags: ['autodocs'],
  args: {
    page: 1,
    pageSize: 10,
    total: 55,
  },
} satisfies Meta<typeof PaginationBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { PaginationBar },
    setup() {
      const page = ref(args.page)
      return { args, page }
    },
    template: '<PaginationBar v-bind="args" :page="page" @update:page="page = $event" />',
  }),
}

export const LastPage: Story = {
  args: { page: 6, pageSize: 10, total: 55 },
  render: (args) => ({
    components: { PaginationBar },
    setup() {
      const page = ref(args.page)
      return { args, page }
    },
    template: '<PaginationBar v-bind="args" :page="page" @update:page="page = $event" />',
  }),
}

export const Hidden: Story = {
  args: { page: 1, pageSize: 10, total: 5 },
  render: (args) => ({
    components: { PaginationBar },
    setup() { return { args } },
    template: `
      <div>
        <PaginationBar v-bind="args" />
        <p class="text-xs text-text-secondary mt-2 text-center">Nothing renders when total ≤ pageSize</p>
      </div>
    `,
  }),
}
