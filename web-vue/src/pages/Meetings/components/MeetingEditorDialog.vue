<template>
  <div v-if="open" class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4" @click.self="$emit('cancel')">
    <div class="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
        <button
          type="button"
          @click="$emit('cancel')"
          class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          ✕
        </button>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
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
          <label for="meeting-price" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Price ($)</label>
          <PriceInput id="meeting-price" v-model="price" :min="0" step="0.01" currency="$" placeholder="0.00" />
        </div>

        <p v-if="errorMessage" class="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          {{ errorMessage }}
        </p>

        <div class="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="$emit('cancel')"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
          >
            {{ saveLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SelectClient from '../../../components/Select/SelectClient.vue'
import SelectCourse from '../../../components/Select/SelectCourse.vue'
import SelectDate from '../../../components/SelectDate.vue'
import PriceInput from '../../../components/PriceInput.vue'
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
const price = ref(0)
const courseId = ref('')
const errorMessage = ref('')

const applyInitialValues = () => {
  clientId.value = props.initialClientId
  startsAt.value = props.initialStartsAt ? props.initialStartsAt.split('T')[0] ?? '' : ''
  price.value = props.initialPrice
  courseId.value = props.initialCourseId
  errorMessage.value = ''
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

const submit = () => {
  if (!clientId.value) {
    errorMessage.value = 'Please select a client.'
    return
  }

  if (!startsAt.value) {
    errorMessage.value = 'Please select a meeting date.'
    return
  }

  if (!Number.isFinite(price.value) || price.value < 0) {
    errorMessage.value = 'Please provide a valid price.'
    return
  }

  errorMessage.value = ''
  emit('save', {
    clientId: clientId.value,
    startsAt: startsAt.value,
    price: Number(price.value.toFixed(2)),
    courseId: courseId.value || undefined,
  })
}
</script>
