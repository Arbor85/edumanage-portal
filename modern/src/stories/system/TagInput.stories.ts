import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TagInput from '../../components/TagInput.vue'

const meta = {
  title: 'System / UI / TagInput',
  component: TagInput,
  tags: ['autodocs'],
  args: {
    modelValue: [],
    placeholder: 'Add tag...',
  },
} satisfies Meta<typeof TagInput>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  render: (args) => ({
    components: { TagInput },
    setup() {
      const tags = ref<string[]>([])
      return { args, tags }
    },
    template: '<div class="w-80"><TagInput v-bind="args" v-model="tags" /></div>',
  }),
}

export const WithTags: Story = {
  args: { modelValue: ['strength', 'compound', 'beginner'] },
  render: (args) => ({
    components: { TagInput },
    setup() {
      const tags = ref<string[]>([...(args.modelValue ?? [])])
      return { args, tags }
    },
    template: '<div class="w-80"><TagInput v-bind="args" v-model="tags" /></div>',
  }),
}
