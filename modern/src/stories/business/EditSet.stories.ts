import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import EditSet from '../../components/EditSet/index.vue'
import type { RoutineSet } from '../../types'

const meta = {
  title: 'Business / EditSet',
  component: EditSet,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EditSet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { EditSet },
    setup() {
      const set = ref<RoutineSet>({ type: 'normal', reps: 10, weight: 80, note: null })
      return { set }
    },
    template: `
      <div class="flex flex-col gap-2 p-4 bg-white dark:bg-gray-900 min-h-screen">
        <p class="text-xs text-text-secondary mb-2">Current: type={{ set.type }}, reps={{ set.reps }}, weight={{ set.weight }}kg</p>
        <EditSet :set="set" @update:set="set = $event" />
      </div>
    `,
  }),
}

export const AllTypes: Story = {
  render: () => ({
    components: { EditSet },
    setup() {
      const sets = ref<RoutineSet[]>([
        { type: 'normal',  reps: 10, weight: 80,   note: null },
        { type: 'warmup',  reps: 15, weight: 40,   note: null },
        { type: 'failure', reps: 8,  weight: 100,  note: null },
        { type: 'drop',    reps: 12, weight: 60,   note: null },
      ])
      return { sets }
    },
    template: `
      <div class="flex flex-col gap-3 p-4 bg-white dark:bg-gray-900 min-h-screen">
        <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">All set types — tap avatar to cycle</p>
        <EditSet
          v-for="(set, i) in sets"
          :key="i"
          :set="set"
          @update:set="sets[i] = $event"
        />
      </div>
    `,
  }),
}

export const Bodyweight: Story = {
  render: () => ({
    components: { EditSet },
    setup() {
      const set = ref<RoutineSet>({ type: 'normal', reps: 12, weight: null, note: null })
      return { set }
    },
    template: `
      <div class="flex flex-col gap-2 p-4 bg-white dark:bg-gray-900 min-h-screen">
        <p class="text-xs text-text-secondary mb-2">Bodyweight — weight input hidden</p>
        <EditSet :set="set" :is-bodyweight="true" @update:set="set = $event" />
      </div>
    `,
  }),
}

export const NoWeight: Story = {
  render: () => ({
    components: { EditSet },
    setup() {
      const set = ref<RoutineSet>({ type: 'normal', reps: 10, weight: null, note: null })
      return { set }
    },
    template: `
      <div class="flex flex-col gap-2 p-4 bg-white dark:bg-gray-900 min-h-screen">
        <p class="text-xs text-text-secondary mb-2">No weight set yet — click kg to open picker</p>
        <EditSet :set="set" @update:set="set = $event" />
      </div>
    `,
  }),
}

export const MultipleSetsList: Story = {
  render: () => ({
    components: { EditSet },
    setup() {
      const sets = ref<RoutineSet[]>([
        { type: 'warmup',  reps: 15, weight: 40,  note: null },
        { type: 'normal',  reps: 10, weight: 80,  note: null },
        { type: 'normal',  reps: 10, weight: 80,  note: null },
        { type: 'normal',  reps: 8,  weight: 85,  note: null },
        { type: 'failure', reps: 6,  weight: 90,  note: null },
      ])
      function addSet() {
        const last = sets.value[sets.value.length - 1]
        sets.value = [...sets.value, last ? { ...last } : { type: 'normal', reps: 10, weight: null, note: null }]
      }
      function removeSet(i: number) {
        sets.value.splice(i, 1)
      }
      return { sets, addSet, removeSet }
    },
    template: `
      <div class="flex flex-col gap-2 p-4 bg-white dark:bg-gray-900 min-h-screen max-w-sm">
        <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-1">Bench Press sets</p>
        <div v-for="(set, i) in sets" :key="i" class="flex items-center gap-2">
          <EditSet :set="set" class="flex-1" @update:set="sets[i] = $event" />
          <button
            class="text-red-400 hover:text-red-600 text-lg leading-none p-1 rounded"
            @click="removeSet(i)"
          >×</button>
        </div>
        <button
          class="text-sm text-primary font-medium text-left hover:underline mt-1 w-fit"
          @click="addSet"
        >+ Add set</button>
      </div>
    `,
  }),
}
