import type { Meta, StoryObj } from '@storybook/vue3'
import BottomNav from '../../components/layout/BottomNav.vue'

const meta = {
  title: 'Layout / BottomNav',
  component: BottomNav,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BottomNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { BottomNav },
    template: `
      <div class="relative min-h-[200px] bg-surface-muted">
        <p class="p-4 text-sm text-text-secondary">Page content (bottom nav appears below on mobile)</p>
        <BottomNav />
      </div>
    `,
  }),
}
