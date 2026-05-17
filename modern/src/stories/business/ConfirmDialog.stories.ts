import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import BaseButton from '../../components/BaseButton.vue'

const meta = {
  title: 'Business / ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    title: 'Delete client?',
    message: 'This action cannot be undone. The client and all their data will be permanently removed.',
    confirmLabel: 'Delete',
    variant: 'danger',
  },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const DangerVariant: Story = {
  render: (args) => ({
    components: { ConfirmDialog, BaseButton },
    setup() {
      const open = ref(true)
      return { args, open }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center">
        <BaseButton variant="danger" @click="open = true">Delete client</BaseButton>
        <ConfirmDialog
          v-bind="args"
          :open="open"
          @confirm="open = false; console.log('confirmed')"
          @cancel="open = false"
        />
      </div>
    `,
  }),
}

export const PrimaryVariant: Story = {
  args: {
    title: 'Archive plan?',
    message: 'This plan will be moved to the archive. You can restore it later.',
    confirmLabel: 'Archive',
    variant: 'primary',
  },
  render: (args) => ({
    components: { ConfirmDialog, BaseButton },
    setup() {
      const open = ref(true)
      return { args, open }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center">
        <BaseButton variant="secondary" @click="open = true">Archive plan</BaseButton>
        <ConfirmDialog
          v-bind="args"
          :open="open"
          @confirm="open = false; console.log('confirmed')"
          @cancel="open = false"
        />
      </div>
    `,
  }),
}

export const Closed: Story = {
  args: { open: false },
  render: (args) => ({
    components: { ConfirmDialog },
    setup() { return { args } },
    template: `
      <div>
        <ConfirmDialog v-bind="args" @confirm="console.log('confirmed')" @cancel="console.log('cancelled')" />
        <p class="text-xs text-text-secondary text-center">Dialog is closed (open=false)</p>
      </div>
    `,
  }),
}
