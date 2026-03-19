<template>
  <FormDialog :open="open" :title="title" :save-label="saveLabel" @cancel="$emit('cancel')" @submit="submit">
    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
      <input
        v-model="name"
        type="text"
        placeholder="Course name"
        class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Type</label>
      <div class="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-600">
        <button
          type="button"
          @click="courseType = 'Individual'"
          class="px-4 py-2 text-sm font-medium"
          :class="courseType === 'Individual' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
        >
          Individual
        </button>
        <button
          type="button"
          @click="courseType = 'Group'"
          class="border-l border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-600"
          :class="courseType === 'Group' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
        >
          Group
        </button>
      </div>
    </div>

    <div v-if="courseType === 'Group'">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Group size</label>
      <input
        v-model.number="size"
        type="number"
        min="2"
        placeholder="Max participants"
        class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Price</label>
      <SelectPrice v-model="price" />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Description</label>
      <textarea
        v-model="description"
        rows="3"
        placeholder="Optional description"
        class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
    </div>

    <p v-if="errorMessage" class="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
      {{ errorMessage }}
    </p>
  </FormDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import FormDialog from '../../../components/FormDialog.vue'
import SelectPrice from '../../../components/SelectPrice.vue'
import type { Course, CourseType, CourseWritePayload } from '../../../types/course'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    saveLabel: string
    initial?: Course | null
  }>(),
  {
    initial: null,
  },
)

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'save', payload: CourseWritePayload): void
}>()

const name = ref('')
const courseType = ref<CourseType>('Individual')
const size = ref<number | null>(null)
const price = ref({ value: 0, currency: 'PLN' })
const description = ref('')
const errorMessage = ref('')

const applyInitial = () => {
  name.value = props.initial?.name ?? ''
  courseType.value = props.initial?.type ?? 'Individual'
  size.value = props.initial?.size ?? null
  price.value = props.initial?.price
    ? { value: props.initial.price.value, currency: props.initial.price.currency }
    : { value: 0, currency: 'PLN' }
  description.value = props.initial?.description ?? ''
  errorMessage.value = ''
}

watch(() => [props.open, props.initial], () => {
  if (props.open) applyInitial()
}, { immediate: true })

const submit = () => {
  if (!name.value.trim()) {
    errorMessage.value = 'Please enter a course name.'
    return
  }

  if (courseType.value === 'Group' && (!size.value || size.value < 2)) {
    errorMessage.value = 'Group size must be at least 2.'
    return
  }

  if (!Number.isFinite(price.value.value) || price.value.value < 0) {
    errorMessage.value = 'Please enter a valid price.'
    return
  }

  if (!price.value.currency.trim()) {
    errorMessage.value = 'Please enter a currency.'
    return
  }

  errorMessage.value = ''
  emit('save', {
    name: name.value.trim(),
    type: courseType.value,
    size: courseType.value === 'Group' ? (size.value ?? undefined) : undefined,
    price: {
      value: Number(price.value.value.toFixed(2)),
      currency: price.value.currency.trim().toUpperCase(),
    },
    description: description.value.trim() || undefined,
  })
}
</script>
