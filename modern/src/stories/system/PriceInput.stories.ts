import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import PriceInput from '../../components/PriceInput.vue'
import type { CoursePrice } from '../../types'

const meta = {
  title: 'System / UI / PriceInput',
  component: PriceInput,
  tags: ['autodocs'],
  args: {
    modelValue: null,
  },
} satisfies Meta<typeof PriceInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { PriceInput },
    setup() {
      const price = ref<CoursePrice | null>(null)
      return { args, price }
    },
    template: '<div class="w-72"><PriceInput v-bind="args" v-model="price" /></div>',
  }),
}

export const WithValue: Story = {
  args: { modelValue: { value: 49.99, currency: 'USD' } },
  render: (args) => ({
    components: { PriceInput },
    setup() {
      const price = ref<CoursePrice | null>(args.modelValue ?? null)
      return { args, price }
    },
    template: '<div class="w-72"><PriceInput v-model="price" /></div>',
  }),
}

export const EuroCurrency: Story = {
  args: { modelValue: { value: 35, currency: 'EUR' } },
  render: (args) => ({
    components: { PriceInput },
    setup() {
      const price = ref<CoursePrice | null>(args.modelValue ?? null)
      return { args, price }
    },
    template: '<div class="w-72"><PriceInput v-model="price" /></div>',
  }),
}
