import type { Meta, StoryObj } from '@storybook/vue3'
import SkeletonBlock from '../../components/SkeletonBlock.vue'

const meta = {
  title: 'System / UI / SkeletonBlock',
  component: SkeletonBlock,
  tags: ['autodocs'],
  args: {
    width: '100%',
    height: '1rem',
    rounded: true,
  },
} satisfies Meta<typeof SkeletonBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { SkeletonBlock },
    setup() { return { args } },
    template: '<div class="w-72"><SkeletonBlock v-bind="args" /></div>',
  }),
}

export const ListPattern: Story = {
  render: () => ({
    components: { SkeletonBlock },
    template: `
      <div class="w-80 space-y-3">
        <div v-for="i in 4" :key="i" class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-surface-dark">
          <SkeletonBlock width="40px" height="40px" class="rounded-full flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <SkeletonBlock height="0.75rem" width="60%" />
            <SkeletonBlock height="0.65rem" width="40%" />
          </div>
        </div>
      </div>
    `,
  }),
}

export const CardPattern: Story = {
  render: () => ({
    components: { SkeletonBlock },
    template: `
      <div class="w-72 p-5 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-surface-dark space-y-3">
        <SkeletonBlock height="2rem" width="40%" />
        <SkeletonBlock height="0.75rem" />
        <SkeletonBlock height="0.75rem" width="80%" />
        <SkeletonBlock height="0.75rem" width="65%" />
      </div>
    `,
  }),
}
