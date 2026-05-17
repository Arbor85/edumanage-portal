import type { Meta, StoryObj } from '@storybook/vue3'
import DarkModeToggle from '../../components/DarkModeToggle.vue'

const meta = {
  title: 'System / UI / DarkModeToggle',
  component: DarkModeToggle,
  tags: ['autodocs'],
} satisfies Meta<typeof DarkModeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { DarkModeToggle },
    template: `
      <div class="flex items-center gap-3">
        <DarkModeToggle />
        <span class="text-sm text-text-secondary dark:text-white/60">Toggle dark mode</span>
      </div>
    `,
  }),
}
