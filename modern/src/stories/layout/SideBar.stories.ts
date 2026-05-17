import type { Meta, StoryObj } from '@storybook/vue3'
import SideBar from '../../components/layout/SideBar.vue'

const meta = {
  title: 'Layout / SideBar',
  component: SideBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SideBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { SideBar },
    template: `
      <div class="flex">
        <SideBar />
        <div class="flex-1 bg-surface-muted min-h-screen p-8">
          <p class="text-text-secondary dark:text-white/40 text-sm">Page content area</p>
        </div>
      </div>
    `,
  }),
}
