<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { MeetingOut } from '../types'
import { useMeetingStore } from '../stores/meetingStore'
import { useClientStore } from '../stores/clientStore'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import ListSearchBar from '../components/ListSearchBar.vue'
import BaseButton from '../components/BaseButton.vue'
import ViewToggle from '../components/ViewToggle.vue'
import MeetingList from './MeetingsPage/components/MeetingList.vue'
import MeetingCalendar from './MeetingsPage/components/MeetingCalendar.vue'
import MeetingFormModal from './MeetingsPage/components/MeetingFormModal.vue'

const meetingStore = useMeetingStore()
const clientStore = useClientStore()

const search = ref('')
const view = ref<'list' | 'calendar'>('list')
const isCreateOpen = ref(false)
const editTarget = ref<MeetingOut | null>(null)
const prefilledDate = ref('')

onMounted(() => {
  meetingStore.fetch()
  clientStore.fetch()
})

const filtered = () =>
  meetingStore.meetings.filter((m) =>
    !search.value || m.title?.toLowerCase().includes(search.value.toLowerCase())
  )

function onCalendarCreate(date: string) {
  prefilledDate.value = date
  isCreateOpen.value = true
}
</script>

<template>
  <AppLayout>
    <PageHeader title="Meetings" subtitle="Schedule and track client sessions.">
      <BaseButton variant="primary" @click="isCreateOpen = true">+ Schedule</BaseButton>
    </PageHeader>

    <div class="mb-4 flex items-center gap-3">
      <div class="flex-1">
        <ListSearchBar v-model="search" placeholder="Search meetings..." :loading="meetingStore.isLoading" @refresh="meetingStore.fetch()" />
      </div>
      <ViewToggle
        v-model="view"
        :options="[{ value: 'list', label: 'List' }, { value: 'calendar', label: 'Calendar' }]"
        storage-key="meetings-view"
      />
    </div>

    <MeetingList v-if="view === 'list'" :meetings="filtered()" :loading="meetingStore.isLoading" @edit="editTarget = $event" />
    <MeetingCalendar v-else :meetings="filtered()" @edit="editTarget = $event" @create="onCalendarCreate" />

    <MeetingFormModal
      :open="isCreateOpen || editTarget !== null"
      :meeting="editTarget"
      :prefilled-date="prefilledDate"
      @close="isCreateOpen = false; editTarget = null; prefilledDate = ''"
    />
  </AppLayout>
</template>
