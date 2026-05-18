<script setup lang="ts">
import { ref, watch } from 'vue'
import { usePageTitle } from '../../../composables/usePageTitle'
import type { MeetingOut, MeetingCreate, MeetingUpdate } from '../../../types'
import { useMeetingStore } from '../../../stores/meetingStore'
import { useToast } from '../../../composables/useToast'
import BaseModal from '../../../components/BaseModal.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseDatePicker from '../../../components/BaseDatePicker.vue'
import BaseTextarea from '../../../components/BaseTextarea.vue'
import BaseButton from '../../../components/BaseButton.vue'
import SelectClient from '../../../components/SelectClient/index.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'

const props = defineProps<{ open: boolean; meeting: MeetingOut | null; prefilledDate?: string }>()
const emit = defineEmits<{ close: [] }>()

usePageTitle(() => props.meeting ? 'Edit Meeting' : 'Schedule Meeting', () => props.open)

const meetingStore = useMeetingStore()
const toast = useToast()

const form = ref({ title: '', clientId: null as string | null, date: '', note: '' })
const saving = ref(false)
const confirmDelete = ref(false)

watch(() => props.open, (val) => {
  if (val) {
    if (props.meeting) {
      form.value = {
        title: props.meeting.title ?? '',
        clientId: props.meeting.clientId,
        date: props.meeting.date?.slice(0, 16) ?? '',
        note: props.meeting.note ?? ''
      }
    } else {
      form.value = { title: '', clientId: null, date: props.prefilledDate ? `${props.prefilledDate}T09:00` : '', note: '' }
    }
  }
})

async function save() {
  saving.value = true
  try {
    if (props.meeting?.id) {
      await meetingStore.update(props.meeting.id, form.value as MeetingUpdate)
      toast.success('Meeting updated')
    } else {
      await meetingStore.create(form.value as MeetingCreate)
      toast.success('Meeting scheduled')
    }
    emit('close')
  } catch {
    toast.error('Failed to save meeting')
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!props.meeting?.id) return
  try {
    await meetingStore.remove(props.meeting.id)
    toast.success('Meeting deleted')
    confirmDelete.value = false
    emit('close')
  } catch {
    toast.error('Failed to delete meeting')
  }
}
</script>

<template>
  <BaseModal :open="open" :title="meeting ? 'Edit Meeting' : 'Schedule Meeting'" size="md" @close="emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="save">
      <BaseInput v-model="form.title" label="Title" placeholder="e.g. Weekly Check-in" />
      <SelectClient v-model="form.clientId" label="Client" />
      <BaseDatePicker v-model="form.date" label="Date & Time" mode="datetime" />
      <BaseTextarea v-model="form.note" label="Notes" :rows="2" />
    </form>

    <template #footer>
      <div class="flex items-center gap-2">
        <BaseButton v-if="meeting" variant="danger" @click="confirmDelete = true">Delete</BaseButton>
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">{{ meeting ? 'Save' : 'Schedule' }}</BaseButton>
      </div>
    </template>
  </BaseModal>

  <ConfirmDialog
    :open="confirmDelete"
    title="Delete Meeting"
    message="Delete this meeting?"
    confirm-label="Delete"
    variant="danger"
    @confirm="doDelete"
    @cancel="confirmDelete = false"
  />
</template>
