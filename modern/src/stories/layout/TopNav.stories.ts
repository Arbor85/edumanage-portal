import type { Meta, StoryObj } from '@storybook/vue3'
import TopNav from '../../components/layout/TopNav.vue'

const meta = {
  title: 'Layout / TopNav',
  component: TopNav,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TopNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { TopNav },
    template: '<TopNav />',
  }),
}
