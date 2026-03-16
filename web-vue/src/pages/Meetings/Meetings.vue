<template>
  <div class="w-full max-w-7xl pb-24">
    <div class="mb-5">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Meetings</h1>
    </div>

    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <SearchInput v-model="searchQuery" placeholder="Search by client, date or price" />

      <div class="flex items-center gap-2 sm:shrink-0">
        <div class="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-600">
          <button
            type="button"
            @click="viewMode = 'list'"
            class="px-3 py-1.5 text-xs font-medium"
            :class="viewMode === 'list' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
          >
            List
          </button>
          <button
            type="button"
            @click="viewMode = 'calendar'"
            class="border-l border-slate-300 px-3 py-1.5 text-xs font-medium dark:border-slate-600"
            :class="viewMode === 'calendar' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
          >
            Calendar
          </button>
        </div>

        <button
          type="button"
          @click="loadMeetings"
          :disabled="isLoading"
          aria-label="Refresh meetings"
          title="Refresh meetings"
          class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="h-4 w-4"
            :class="isLoading ? 'animate-spin' : ''"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
        </button>
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="mb-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="isLoading"
      class="mb-3 flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-8 dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="inline-flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
        <svg class="h-5 w-5 animate-spin text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span>Loading meetings...</span>
      </div>
    </div>

    <div
      v-else-if="viewMode === 'list'"
      class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            <tr>
              <th class="px-4 py-3 font-semibold">Date</th>
              <th class="px-4 py-3 font-semibold">Time</th>
              <th class="px-4 py-3 font-semibold">Client</th>
              <th class="px-4 py-3 font-semibold">Price</th>
              <th class="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="meeting in paginatedMeetings" :key="meeting.id" class="border-t border-slate-200 dark:border-slate-700">
              <td class="px-4 py-3 text-slate-900 dark:text-slate-100">{{ formatDate(meeting.startsAt) }}</td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ formatTime(meeting.startsAt) }}</td>
              <td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{{ getClientName(meeting.clientId) }}</td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ formatPrice(meeting.price) }}</td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    @click="requestDeleteMeeting(meeting)"
                    class="inline-flex items-center justify-center gap-2 rounded-md border border-rose-300 bg-white p-2 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-700 dark:text-rose-300 dark:hover:bg-rose-900/30"
                    aria-label="Delete meeting"
                    title="Delete meeting"
                  >
                    <Trash2 :size="16" />
                  </button>
                  <button
                    type="button"
                    @click="openEditDialog(meeting)"
                    class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  >
                    <Edit2 :size="14" />
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredMeetings.length === 0" class="border-t border-slate-200 px-4 py-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
        No meetings found.
      </div>

      <div
        v-else-if="totalPages > 1"
        class="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700"
      >
        <p class="text-xs text-slate-600 dark:text-slate-300">
          Page {{ currentPage }} of {{ totalPages }}
        </p>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="goToPreviousPage"
            :disabled="currentPage === 1"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Previous
          </button>
          <button
            type="button"
            @click="goToNextPage"
            :disabled="currentPage === totalPages"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <CalendarView v-else>
      <template #day="{ day, date }">
        <div class="flex h-full min-h-[96px] flex-col">
          <div class="mb-1 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ day }}</span>
            <button
              type="button"
              @click.stop="openCreateDialogForDay(date)"
              class="inline-flex h-5 w-5 items-center justify-center rounded border border-emerald-300 text-xs font-semibold leading-none text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
              title="Add meeting on this day"
              aria-label="Add meeting on this day"
            >
              +
            </button>
          </div>

          <ul class="space-y-1 overflow-hidden">
            <li
              v-for="meeting in getMeetingsForDay(date).slice(0, 2)"
              :key="meeting.id"
            >
              <button
                type="button"
                @click.stop="openEditDialog(meeting)"
                class="w-full truncate rounded bg-emerald-50 px-1.5 py-1 text-left text-[11px] text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
              >
                {{ formatTime(meeting.startsAt) }} {{ getClientName(meeting.clientId) }}
              </button>
            </li>
          </ul>

          <p
            v-if="getMeetingsForDay(date).length > 2"
            class="mt-1 text-[11px] text-slate-500 dark:text-slate-400"
          >
            +{{ getMeetingsForDay(date).length - 2 }} more
          </p>
        </div>
      </template>
    </CalendarView>

    <div class="fixed bottom-0 left-56 right-0 z-30 px-6 pb-3">
      <div class="mx-auto w-full max-w-7xl">
        <DialogActionPanel primary-label="Add meeting" @primary-click="openCreateDialog" />
      </div>
    </div>

    <MeetingEditorDialog
      :open="showDialog"
      :title="dialogMode === 'edit' ? 'Edit meeting' : 'Add meeting'"
      :save-label="dialogMode === 'edit' ? 'Save changes' : 'Add meeting'"
      :clients="clients"
      :courses="courses"
      :initial-client-id="editingClientId"
      :initial-starts-at="editingStartsAt"
      :initial-price="editingPrice"
      :initial-course-id="editingCourseId"
      @cancel="closeDialog"
      @save="saveMeeting"
    />

    <ConfirmDialog
      :open="showDeleteDialog"
      title="Delete meeting"
      :message="deleteDialogMessage"
      confirm-label="Delete"
      cancel-label="Cancel"
      @confirm="confirmDeleteMeeting"
      @cancel="closeDeleteDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { Edit2, Trash2 } from 'lucide-vue-next'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import DialogActionPanel from '../../components/DialogActionPanel.vue'
import SearchInput from '../../components/SearchInput.vue'
import { useLocalStorageState } from '../../composables/useLocalStorageState'
import { usePageTitle } from '../../composables/usePageTitle'
import { useClientsApi } from '../../services/clientsApi'
import { useMeetingsApi } from '../../services/meetingsApi'
import { useCoursesApi } from '../../services/coursesApi'
import type { Client } from '../../types/client'
import type { Course } from '../../types/course'
import type { Meeting, MeetingWritePayload } from '../../types/meeting'
import CalendarView from '../../components/CalendarView.vue'
import MeetingEditorDialog from './components/MeetingEditorDialog.vue'

usePageTitle('Meetings')

const clientsApi = useClientsApi()
const meetingsApi = useMeetingsApi()
const coursesApi = useCoursesApi()
const { isLoading: isAuthLoading, isAuthenticated } = useAuth0()

const meetings = ref<Meeting[]>([])
const clients = ref<Client[]>([])
const courses = ref<Course[]>([])
const searchQuery = ref('')
const viewMode = useLocalStorageState<'list' | 'calendar'>('meetings:viewMode', 'list')
const isLoading = ref(false)
const errorMessage = ref('')
const hasLoadedInitially = ref(false)

const showDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingMeetingId = ref<string | null>(null)
const editingClientId = ref('')
const editingStartsAt = ref('')
const editingPrice = ref(0)
const editingCourseId = ref('')

const showDeleteDialog = ref(false)
const pendingDeleteMeeting = ref<Meeting | null>(null)

const currentPage = ref(1)
const pageSize = 20

const sortMeetings = (items: Meeting[]) => {
  return [...items].sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
}

const loadMeetings = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await meetingsApi.listMeetings()
    meetings.value = sortMeetings(response)
  } catch {
    errorMessage.value = 'Failed to load meetings'
  } finally {
    isLoading.value = false
  }
}

const loadClients = async () => {
  try {
    clients.value = await clientsApi.listClients()
  } catch {
    clients.value = []
  }
}

const loadCourses = async () => {
  try {
    courses.value = await coursesApi.listCourses()
  } catch {
    courses.value = []
  }
}

const getClientName = (clientId: string) => {
  return clients.value.find((client) => client.invitationCode === clientId)?.name || 'Unknown client'
}

const filteredMeetings = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()

  return meetings.value.filter((meeting) => {
    if (!normalizedQuery) {
      return true
    }

    const clientName = getClientName(meeting.clientId).toLowerCase()
    const dateText = formatDate(meeting.startsAt).toLowerCase()
    const timeText = formatTime(meeting.startsAt).toLowerCase()
    const priceText = meeting.price.toFixed(2)

    return (
      clientName.includes(normalizedQuery)
      || dateText.includes(normalizedQuery)
      || timeText.includes(normalizedQuery)
      || priceText.includes(normalizedQuery)
    )
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredMeetings.value.length / pageSize))
})

const paginatedMeetings = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize
  return filteredMeetings.value.slice(startIndex, startIndex + pageSize)
})

const meetingsByDay = computed<Record<string, Meeting[]>>(() => {
  const grouped: Record<string, Meeting[]> = {}

  for (const meeting of filteredMeetings.value) {
    const dayKey = toDayKey(new Date(meeting.startsAt))

    if (!grouped[dayKey]) {
      grouped[dayKey] = []
    }

    grouped[dayKey].push(meeting)
  }

  return grouped
})

watch(filteredMeetings, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }

  if (currentPage.value < 1) {
    currentPage.value = 1
  }
})

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatTime = (isoDate: string) => {
  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) {
    return '--:--'
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const toDayKey = (date: Date) => {
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`
}

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
  }
}

const getMeetingsForDay = (date: Date) => {
  const dayKey = toDayKey(date)
  return dayKey ? meetingsByDay.value[dayKey] ?? [] : []
}

const openCreateDialogForDay = (date: Date) => {
  const prefilledDate = new Date(date)
  prefilledDate.setHours(9, 0, 0, 0)

  dialogMode.value = 'create'
  editingMeetingId.value = null
  editingClientId.value = ''
  editingStartsAt.value = prefilledDate.toISOString()
  editingPrice.value = 0
  editingCourseId.value = ''
  showDialog.value = true
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  editingMeetingId.value = null
  editingClientId.value = ''
  editingStartsAt.value = ''
  editingPrice.value = 0
  editingCourseId.value = ''
  showDialog.value = true
}

const openEditDialog = (meeting: Meeting) => {
  dialogMode.value = 'edit'
  editingMeetingId.value = meeting.id
  editingClientId.value = meeting.clientId
  editingStartsAt.value = meeting.startsAt
  editingPrice.value = meeting.price
  editingCourseId.value = meeting.courseId ?? ''
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  dialogMode.value = 'create'
  editingMeetingId.value = null
  editingClientId.value = ''
  editingStartsAt.value = ''
  editingPrice.value = 0
  editingCourseId.value = ''
}

const saveMeeting = async (payload: MeetingWritePayload) => {
  errorMessage.value = ''

  try {
    if (dialogMode.value === 'edit' && editingMeetingId.value) {
      const updatedMeeting = await meetingsApi.editMeeting(editingMeetingId.value, payload)
      meetings.value = sortMeetings(
        meetings.value.map((meeting) => (meeting.id === updatedMeeting.id ? updatedMeeting : meeting)),
      )
    } else {
      const createdMeeting = await meetingsApi.addMeeting(payload)
      meetings.value = sortMeetings([createdMeeting, ...meetings.value])
    }

    closeDialog()
  } catch {
    errorMessage.value = 'Failed to save meeting'
  }
}

const deleteDialogMessage = computed(() => {
  if (!pendingDeleteMeeting.value) {
    return 'Are you sure you want to delete this meeting?'
  }

  return `Delete meeting with ${getClientName(pendingDeleteMeeting.value.clientId)} at ${formatTime(pendingDeleteMeeting.value.startsAt)}?`
})

const requestDeleteMeeting = (meeting: Meeting) => {
  pendingDeleteMeeting.value = meeting
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  pendingDeleteMeeting.value = null
}

const confirmDeleteMeeting = async () => {
  const meeting = pendingDeleteMeeting.value

  if (!meeting) {
    return
  }

  errorMessage.value = ''

  try {
    await meetingsApi.deleteMeeting(meeting.id)
    meetings.value = meetings.value.filter((entry) => entry.id !== meeting.id)
    closeDeleteDialog()
  } catch {
    errorMessage.value = 'Failed to delete meeting'
  }
}

watch(searchQuery, () => {
  currentPage.value = 1
})

watch(
  [isAuthLoading, isAuthenticated],
  async ([authLoading, authenticated]) => {
    if (authLoading || !authenticated || hasLoadedInitially.value) {
      return
    }

    hasLoadedInitially.value = true
    await loadClients()
    await loadCourses()
    await loadMeetings()
  },
  { immediate: true },
)
</script>
