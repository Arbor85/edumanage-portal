<template>
  <FormDialog :open="open" :title="title" :save-label="saveLabel" @cancel="$emit('cancel')" @submit="submit">
    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Customer</label>
      <SelectClient v-model="clientId" :options="clients" button-text="Select customer" />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Course <span class="text-slate-400 font-normal">(optional)</span></label>
      <SelectCourse v-model="courseId" :options="courses" button-text="Select course" />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Date</label>
      <SelectDate v-model="startsAt" />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Time</label>
      <SelectTime v-model="startTime" />
    </div>

    <div v-if="courseId">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Price</label>
      <SelectPrice v-model="price" :currencies="availableCurrencies" />
    </div>

    <p v-if="errorMessage" class="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
      {{ errorMessage }}
    </p>
  </FormDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import FormDialog from '../../../components/FormDialog.vue'
import SelectClient from '../../../components/Select/SelectClient.vue'
import SelectCourse from '../../../components/Select/SelectCourse.vue'
import SelectDate from '../../../components/SelectDate.vue'
import SelectTime from '../../../components/SelectTime.vue'
import SelectPrice from '../../../components/SelectPrice.vue'
import type { PriceModel } from '../../../components/SelectPrice.vue'
import type { Client } from '../../../types/client'
import type { Course } from '../../../types/course'
import type { MeetingWritePayload } from '../../../types/meeting'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    saveLabel: string
    clients: Client[]
    courses: Course[]
    initialClientId?: string
    initialStartsAt?: string
    initialPrice?: number
    initialCourseId?: string
  }>(),
  {
    initialClientId: '',
    initialStartsAt: '',
    initialPrice: 0,
    initialCourseId: '',
  },
)

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'save', payload: MeetingWritePayload): void
}>()

const clientId = ref('')
const startsAt = ref('')
const startTime = ref('')
const price = ref<PriceModel>({ value: 0, currency: 'USD' })
const courseId = ref('')
const errorMessage = ref('')
const isApplyingInitialValues = ref(false)

const selectedCourse = computed(() => {
  return props.courses.find((course) => course.id === courseId.value)
})

const availableCurrencies = computed(() => {
  return selectedCourse.value?.price.currency ? [selectedCourse.value.price.currency] : ['USD']
})

const parseStartsAtParts = (value: string) => {
  if (!value) {
    return { date: '', time: '' }
  }

  const parsedDate = new Date(value)
  if (!Number.isNaN(parsedDate.getTime())) {
    const year = parsedDate.getFullYear()
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
    const day = String(parsedDate.getDate()).padStart(2, '0')
    const hours = String(parsedDate.getHours()).padStart(2, '0')
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:00`,
    }
  }

  const [datePart, timePart] = value.split('T')
  return {
    date: datePart ?? '',
    time: timePart?.slice(0, 5) ?? '',
  }
}

const applyInitialValues = () => {
  isApplyingInitialValues.value = true
  clientId.value = props.initialClientId
  const initialStartsAtParts = parseStartsAtParts(props.initialStartsAt)
  startsAt.value = initialStartsAtParts.date
  startTime.value = initialStartsAtParts.time
  courseId.value = props.initialCourseId
  price.value = {
    value: props.initialPrice,
    currency: selectedCourse.value?.price.currency ?? 'USD',
  }
  errorMessage.value = ''
  isApplyingInitialValues.value = false
}

watch(
  () => [props.open, props.initialClientId, props.initialStartsAt, props.initialPrice, props.initialCourseId],
  () => {
    if (props.open) {
      applyInitialValues()
    }
  },
  { immediate: true },
)

watch(
  () => courseId.value,
  () => {
    if (isApplyingInitialValues.value || !selectedCourse.value) {
      return
    }

    price.value = {
      value: selectedCourse.value.price.value,
      currency: selectedCourse.value.price.currency,
    }
  },
)

const submit = () => {
  if (!clientId.value) {
    errorMessage.value = 'Please select a client.'
    return
  }

  if (!startsAt.value) {
    errorMessage.value = 'Please select a meeting date.'
    return
  }

  if (!startTime.value) {
    errorMessage.value = 'Please select a meeting time.'
    return
  }

  if (!Number.isFinite(price.value.value) || price.value.value < 0) {
    errorMessage.value = 'Please provide a valid price.'
    return
  }

  errorMessage.value = ''
  emit('save', {
    clientId: clientId.value,
    startsAt: `${startsAt.value}T${startTime.value}:00`,
    price: Number(price.value.value.toFixed(2)),
    courseId: courseId.value || undefined,
  })
}
</script>
