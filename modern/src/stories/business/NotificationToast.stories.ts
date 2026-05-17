import type { Meta, StoryObj } from '@storybook/vue3'
import NotificationToast from '../../components/NotificationToast.vue'
import { useToast } from '../../composables/useToast'
import BaseButton from '../../components/BaseButton.vue'

const meta = {
  title: 'Business / NotificationToast',
  component: NotificationToast,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NotificationToast>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  render: () => ({
    components: { NotificationToast, BaseButton },
    setup() {
      const { success } = useToast()
      return { success }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center">
        <BaseButton variant="primary" @click="success('Client saved successfully')">
          Show Success Toast
        </BaseButton>
        <NotificationToast />
      </div>
    `,
  }),
}

export const ErrorToast: Story = {
  render: () => ({
    components: { NotificationToast, BaseButton },
    setup() {
      const { error } = useToast()
      return { error }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center">
        <BaseButton variant="danger" @click="error('Something went wrong. Please try again.')">
          Show Error Toast
        </BaseButton>
        <NotificationToast />
      </div>
    `,
  }),
}

export const InfoToast: Story = {
  render: () => ({
    components: { NotificationToast, BaseButton },
    setup() {
      const { info } = useToast()
      return { info }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center">
        <BaseButton variant="secondary" @click="info('Syncing with server...')">
          Show Info Toast
        </BaseButton>
        <NotificationToast />
      </div>
    `,
  }),
}

export const MultipleToasts: Story = {
  render: () => ({
    components: { NotificationToast, BaseButton },
    setup() {
      const { success, error, info } = useToast()
      function showAll() {
        info('Saving changes...')
        setTimeout(() => success('Changes saved!'), 600)
        setTimeout(() => error('Warning: backup failed'), 1200)
      }
      return { showAll }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center">
        <BaseButton variant="primary" @click="showAll">
          Show Multiple Toasts
        </BaseButton>
        <NotificationToast />
      </div>
    `,
  }),
}
