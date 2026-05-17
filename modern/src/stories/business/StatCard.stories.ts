import type { Meta, StoryObj } from '@storybook/vue3'
import { Users, Dumbbell, Calendar, TrendingUp } from 'lucide-vue-next'
import StatCard from '../../components/StatCard.vue'

const meta = {
  title: 'Business / StatCard',
  component: StatCard,
  tags: ['autodocs'],
  args: {
    label: 'Total Clients',
    value: 42,
  },
} satisfies Meta<typeof StatCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { StatCard },
    setup() { return { args } },
    template: '<div class="w-56"><StatCard v-bind="args" /></div>',
  }),
}

export const WithPositiveDelta: Story = {
  args: { label: 'Total Clients', value: 42, delta: '+12%', deltaPositive: true, icon: Users },
  render: (args) => ({
    components: { StatCard },
    setup() { return { args } },
    template: '<div class="w-56"><StatCard v-bind="args" /></div>',
  }),
}

export const WithNegativeDelta: Story = {
  args: { label: 'Sessions', value: 18, delta: '-3%', deltaPositive: false, icon: Calendar },
  render: (args) => ({
    components: { StatCard },
    setup() { return { args } },
    template: '<div class="w-56"><StatCard v-bind="args" /></div>',
  }),
}

export const WithIcon: Story = {
  args: { label: 'Exercises', value: 134, icon: Dumbbell, iconBg: 'bg-primary/10' },
  render: (args) => ({
    components: { StatCard },
    setup() { return { args } },
    template: '<div class="w-56"><StatCard v-bind="args" /></div>',
  }),
}

export const AllVariants: Story = {
  render: () => ({
    components: { StatCard, Users, Dumbbell, Calendar, TrendingUp },
    setup() {
      return { Users, Dumbbell, Calendar, TrendingUp }
    },
    template: `
      <div class="grid grid-cols-2 gap-4 w-[480px]">
        <StatCard label="Total Clients" value="42" :icon="Users" delta="+12%" :deltaPositive="true" />
        <StatCard label="Exercises" value="134" :icon="Dumbbell" iconBg="bg-blue-500/10" />
        <StatCard label="Meetings" value="8" :icon="Calendar" delta="-1" :deltaPositive="false" />
        <StatCard label="Revenue" value="$2,840" :icon="TrendingUp" iconBg="bg-violet-500/10" delta="+5%" :deltaPositive="true" />
      </div>
    `,
  }),
}
