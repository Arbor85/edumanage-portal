import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import ProcessWizard from '../../components/ProcessWizard/index.vue'
import BaseButton from '../../components/BaseButton.vue'

const meta = {
  title: 'Business / ProcessWizard',
  component: ProcessWizard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ProcessWizard>

export default meta
type Story = StoryObj<typeof meta>

const SAMPLE_STEPS = [
  { id: 0, label: 'Bench Press' },
  { id: 1, label: 'Overhead Press' },
  { id: 2, label: 'Incline Dumbbell Press' },
]

export const Default: Story = {
  render: () => ({
    components: { ProcessWizard, BaseButton },
    setup() {
      const active = ref(0)
      const steps = ref(SAMPLE_STEPS)
      return { active, steps }
    },
    template: `
      <div class="h-screen bg-white dark:bg-gray-900 flex flex-col">
        <div class="flex-1 min-h-0 overflow-hidden">
          <ProcessWizard v-model="active" :steps="steps" class="h-full">
            <template #add-step>
              <button
                type="button"
                class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-primary font-medium hover:bg-primary/10 transition-colors"
                @click="steps.push({ id: steps.length, label: 'New exercise ' + (steps.length + 1) }); active = steps.length - 1"
              >
                + Add exercise
              </button>
            </template>
            <template #step-content="{ index }">
              <div class="flex flex-col gap-4">
                <h2 class="text-lg font-semibold text-text-primary dark:text-white">{{ steps[index]?.label }}</h2>
                <p class="text-sm text-text-secondary">Step {{ index + 1 }} of {{ steps.length }}. Content area for this exercise goes here.</p>
                <div class="flex gap-2">
                  <button
                    v-if="index > 0"
                    class="text-sm text-primary font-medium"
                    @click="active = index - 1"
                  >← Previous</button>
                  <button
                    v-if="index < steps.length - 1"
                    class="text-sm text-primary font-medium ml-auto"
                    @click="active = index + 1"
                  >Next →</button>
                </div>
              </div>
            </template>
          </ProcessWizard>
        </div>
      </div>
    `,
  }),
}

export const ManySteps: Story = {
  render: () => ({
    components: { ProcessWizard },
    setup() {
      const active = ref(0)
      const steps = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        label: ['Squat', 'Deadlift', 'Bench Press', 'Overhead Press', 'Barbell Row', 'Pull-up', 'Dip', 'Lunge', 'Romanian Deadlift', 'Face Pull', 'Lat Pulldown', 'Cable Row'][i],
      }))
      return { active, steps }
    },
    template: `
      <div class="h-screen bg-white dark:bg-gray-900">
        <ProcessWizard v-model="active" :steps="steps" class="h-full">
          <template #step-content="{ index, step }">
            <div class="flex flex-col gap-2">
              <h2 class="text-lg font-semibold text-text-primary dark:text-white">{{ step?.label }}</h2>
              <p class="text-sm text-text-secondary">Exercise {{ index + 1 }}</p>
            </div>
          </template>
        </ProcessWizard>
      </div>
    `,
  }),
}

export const SingleStep: Story = {
  render: () => ({
    components: { ProcessWizard },
    setup() {
      const active = ref(0)
      const steps = [{ id: 0, label: 'Bench Press' }]
      return { active, steps }
    },
    template: `
      <div class="h-screen bg-white dark:bg-gray-900">
        <ProcessWizard v-model="active" :steps="steps" class="h-full">
          <template #step-content="{ step }">
            <div class="flex flex-col gap-2">
              <h2 class="text-lg font-semibold text-text-primary dark:text-white">{{ step?.label }}</h2>
              <p class="text-sm text-text-secondary">Only one exercise in this routine.</p>
            </div>
          </template>
        </ProcessWizard>
      </div>
    `,
  }),
}
