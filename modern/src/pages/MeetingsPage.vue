<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageTitle } from '../composables/usePageTitle'
usePageTitle('Meetings')
import type { MeetingOut } from '../types'
import { useMeetingStore } from '../stores/meetingStore'
import { useClientStore } from '../stores/clientStore'
import { useToast } from '../composables/useToast'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import ListSearchBar from '../components/ListSearchBar.vue'
import BaseButton from '../components/BaseButton.vue'
import ViewToggle from '../components/ViewToggle.vue'
import MeetingList from './MeetingsPage/components/MeetingList.vue'
import MeetingCalendar from './MeetingsPage/components/MeetingCalendar.vue'
import MeetingFormModal from './MeetingsPage/components/MeetingFormModal.vue'

const route = useRoute()
const router = useRouter()
const meetingStore = useMeetingStore()
const clientStore = useClientStore()
const toast = useToast()

const search = ref('')
const view = ref<'list' | 'calendar'>('list')
const isCreateOpen = ref(false)
const editTarget = ref<MeetingOut | null>(null)
const prefilledDate = ref('')

onMounted(() => {
  meetingStore.fetch()
  clientStore.fetch()
})

function openEdit(meeting: MeetingOut) {
  editTarget.value = meeting
  router.push({ query: { edit: meeting.id! } })
}

function openCreate() {
  isCreateOpen.value = true
  router.push({ query: { new: '1' } })
}

watch(() => route.query, async (query) => {
  if (query.edit) {
    if (editTarget.value?.id === query.edit) return
    try {
      editTarget.value = await meetingStore.get(query.edit as string)
      isCreateOpen.value = false
      prefilledDate.value = ''
    } catch {
      toast.error('Meeting not found')
      router.replace({ query: {} })
    }
  } else if (query.new) {
    if (isCreateOpen.value) return
    isCreateOpen.value = true
    editTarget.value = null
  } else {
    isCreateOpen.value = false
    editTarget.value = null
    prefilledDate.value = ''
  }
}, { immediate: true })

const filtered = () =>
  meetingStore.meetings.filter((m) =>
    !search.value || m.title?.toLowerCase().includes(search.value.toLowerCase())
  )

function onCalendarCreate(date: string) {
  prefilledDate.value = date
  openCreate()
}
</script>

<template>
  <AppLayout>
    <PageHeader title="Meetings" subtitle="Schedule and track client sessions.">
      <BaseButton variant="primary" @click="openCreate">+ Schedule</BaseButton>
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

    <Transition name="fade" mode="out-in">
      <MeetingList v-if="view === 'list'" key="list" :meetings="filtered()" :loading="meetingStore.isLoading" @edit="openEdit" />
      <MeetingCalendar v-else key="calendar" :meetings="filtered()" @edit="openEdit" @create="onCalendarCreate" />
    </Transition>

    <MeetingFormModal
      :open="isCreateOpen || editTarget !== null"
      :meeting="editTarget"
      :prefilled-date="prefilledDate"
      @close="router.replace({ query: {} })"
    />
  </AppLayout>
</template>
