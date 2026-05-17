import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import BaseModal from '../../components/BaseModal.vue'
import BaseButton from '../../components/BaseButton.vue'

const meta = {
  title: 'System / UI / BaseModal',
  component: BaseModal,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'fullscreen'] },
  },
  args: {
    open: true,
    title: 'Modal Title',
    size: 'md',
  },
} satisfies Meta<typeof BaseModal>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  render: (args) => ({
    components: { BaseModal, BaseButton },
    setup() {
      const open = ref(true)
      return { args, open }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center">
        <BaseButton variant="primary" @click="open = true">Open Modal</BaseButton>
        <BaseModal v-bind="args" :open="open" @close="open = false">
          <div class="p-5">
            <p class="text-sm text-text-secondary dark:text-white/70">
              This is the modal body content. It can contain any form, table, or informational text.
            </p>
          </div>
        </BaseModal>
      </div>
    `,
  }),
}

export const SmallSize: Story = {
  args: { size: 'sm', title: 'Small Modal' },
  render: (args) => ({
    components: { BaseModal, BaseButton },
    setup() {
      const open = ref(true)
      return { args, open }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center">
        <BaseButton variant="primary" @click="open = true">Open Small Modal</BaseButton>
        <BaseModal v-bind="args" :open="open" @close="open = false">
          <div class="p-5">
            <p class="text-sm text-text-secondary dark:text-white/70">Small modal content.</p>
          </div>
        </BaseModal>
      </div>
    `,
  }),
}

export const LargeSize: Story = {
  args: { size: 'lg', title: 'Large Modal' },
  render: (args) => ({
    components: { BaseModal, BaseButton },
    setup() {
      const open = ref(true)
      return { args, open }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center">
        <BaseButton variant="primary" @click="open = true">Open Large Modal</BaseButton>
        <BaseModal v-bind="args" :open="open" @close="open = false">
          <div class="p-5">
            <p class="text-sm text-text-secondary dark:text-white/70">Large modal for complex content like forms or data tables.</p>
          </div>
        </BaseModal>
      </div>
    `,
  }),
}

export const NoTitle: Story = {
  args: { title: undefined },
  render: (args) => ({
    components: { BaseModal, BaseButton },
    setup() {
      const open = ref(true)
      return { args, open }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center">
        <BaseButton variant="primary" @click="open = true">Open Titleless Modal</BaseButton>
        <BaseModal v-bind="args" :open="open" @close="open = false">
          <div class="p-5">
            <p class="text-sm text-text-secondary dark:text-white/70">Modal without a title header.</p>
          </div>
        </BaseModal>
      </div>
    `,
  }),
}
