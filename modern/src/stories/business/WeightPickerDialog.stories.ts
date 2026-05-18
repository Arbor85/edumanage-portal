import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import WeightPickerDialog from '../../components/WeightPickerDialog/index.vue'
import BaseButton from '../../components/BaseButton.vue'

const meta = {
  title: 'Business / WeightPickerDialog',
  component: WeightPickerDialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof WeightPickerDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  render: () => ({
    components: { WeightPickerDialog, BaseButton },
    setup() {
      const open = ref(true)
      const weight = ref<number | null>(null)
      return { open, weight }
    },
    template: `
      <div class="min-h-screen bg-surface-muted dark:bg-gray-900 flex items-center justify-center gap-4">
        <BaseButton variant="primary" @click="open = true">Open picker</BaseButton>
        <span v-if="weight" class="text-sm text-text-secondary">Selected: {{ weight }}kg</span>
        <WeightPickerDialog
          :open="open"
          :model-value="weight"
          @update:model-value="weight = $event; open = false"
          @close="open = false"
        />
      </div>
    `,
  }),
}

export const PreloadedLight: Story = {
  render: () => ({
    components: { WeightPickerDialog, BaseButton },
    setup() {
      const open = ref(true)
      const weight = ref<number | null>(60)
      return { open, weight }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center gap-4">
        <BaseButton variant="secondary" @click="open = true">60 kg</BaseButton>
        <WeightPickerDialog
          :open="open"
          :model-value="weight"
          @update:model-value="weight = $event; open = false"
          @close="open = false"
        />
      </div>
    `,
  }),
}

export const PreloadedHeavy: Story = {
  render: () => ({
    components: { WeightPickerDialog, BaseButton },
    setup() {
      const open = ref(true)
      const weight = ref<number | null>(142.5)
      return { open, weight }
    },
    template: `
      <div class="min-h-screen bg-surface-muted flex items-center justify-center gap-4">
        <BaseButton variant="secondary" @click="open = true">142.5 kg</BaseButton>
        <WeightPickerDialog
          :open="open"
          :model-value="weight"
          @update:model-value="weight = $event; open = false"
          @close="open = false"
        />
      </div>
    `,
  }),
}

export const Interactive: Story = {
  render: () => ({
    components: { WeightPickerDialog, BaseButton },
    setup() {
      const open = ref(false)
      const weight = ref<number | null>(null)
      return { open, weight }
    },
    template: `
      <div class="min-h-screen bg-surface-muted dark:bg-gray-900 flex flex-col items-center justify-center gap-6">
        <div class="text-center">
          <p class="text-xs text-text-secondary mb-1">Current weight</p>
          <p class="text-4xl font-bold text-text-primary dark:text-white tabular-nums">
            {{ weight !== null ? weight + ' kg' : '—' }}
          </p>
        </div>
        <BaseButton variant="primary" @click="open = true">
          {{ weight ? 'Change weight' : 'Set weight' }}
        </BaseButton>
        <WeightPickerDialog
          :open="open"
          :model-value="weight"
          @update:model-value="weight = $event; open = false"
          @close="open = false"
        />
      </div>
    `,
  }),
}
