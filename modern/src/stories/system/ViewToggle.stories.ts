import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import ViewToggle from '../../components/ViewToggle.vue'

const listKanban = [
  { value: 'list', label: 'List' },
  { value: 'kanban', label: 'Kanban' },
]

const listCalendar = [
  { value: 'list', label: 'List' },
  { value: 'calendar', label: 'Calendar' },
]

const meta = {
  title: 'System / UI / ViewToggle',
  component: ViewToggle,
  tags: ['autodocs'],
  args: {
    modelValue: 'list',
    options: listKanban,
  },
} satisfies Meta<typeof ViewToggle>

export default meta
type Story = StoryObj<typeof meta>

export const ListActive: Story = {
  render: (args) => ({
    components: { ViewToggle },
    setup() {
      const view = ref('list')
      return { args, view }
    },
    template: '<ViewToggle :options="args.options" v-model="view" />',
  }),
  args: { options: listKanban },
}

export const KanbanActive: Story = {
  render: (args) => ({
    components: { ViewToggle },
    setup() {
      const view = ref('kanban')
      return { args, view }
    },
    template: '<ViewToggle :options="args.options" v-model="view" />',
  }),
  args: { options: listKanban },
}

export const CalendarActive: Story = {
  render: (args) => ({
    components: { ViewToggle },
    setup() {
      const view = ref('calendar')
      return { args, view }
    },
    template: '<ViewToggle :options="args.options" v-model="view" />',
  }),
  args: { options: listCalendar },
}
