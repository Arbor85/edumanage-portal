<template>
  <div class="w-full max-w-7xl pb-24">
    <div class="mb-5">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Plans</h1>
    </div>

    <div class="mb-4 flex flex-col gap-3">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">

        <SearchInput v-model="searchQuery" placeholder="Search by plan, client, workout or excercise" />

        <div class="flex items-center gap-2 sm:shrink-0">
          <div class="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-600">
            <button
              type="button"
              @click="viewMode = 'tile'"
              class="px-3 py-1.5 text-xs font-medium"
              :class="viewMode === 'tile' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
            >
              Tile
            </button>
            <button
              type="button"
              @click="viewMode = 'list'"
              class="border-l border-slate-300 px-3 py-1.5 text-xs font-medium dark:border-slate-600"
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
            @click="loadPlans"
            :disabled="isLoading"
            aria-label="Refresh plans"
            title="Refresh plans"
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

      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <FilterOption
          v-model="selectedClientNames"
          title="Clients"
          :options="clientFilterOptions"
          all-label="All clients"
        />
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
        <span>Loading plans...</span>
      </div>
    </div>

    <div v-else-if="viewMode === 'tile'" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="plan in filteredPlans"
        :key="plan.id"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="mb-3 flex items-start justify-between gap-3">
          <div>
            <p class="font-semibold text-slate-900 dark:text-slate-100">{{ plan.name }}</p>
            <div class="mt-1">
              <CustomerDisplay :name="getPlanClientName(plan)" :image-url="getPlanClientImage(plan)" />
            </div>
          </div>
          <div class="flex shrink-0 flex-col items-end gap-1">
            <span :class="statusBadgeClass(plan)" class="rounded-full px-2 py-0.5 text-[10px] font-medium">
              {{ plan.status ?? 'Draft' }}
            </span>
            <span class="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              {{ plan.workouts.length }} workout{{ plan.workouts.length === 1 ? '' : 's' }}
            </span>
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="workout in plan.workouts.slice(0, 3)"
            :key="`${plan.id}-${workout.id}`"
            class="rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-200"
          >
            <p class="font-medium">{{ workout.name }}</p>
            <p class="text-[11px] text-slate-600 dark:text-slate-400">{{ formatDate(workout.date) }} • {{ workout.excercises.length }} exc.</p>
          </div>

          <p v-if="plan.workouts.length > 3" class="text-xs text-slate-500 dark:text-slate-400">
            +{{ plan.workouts.length - 3 }} more
          </p>

          <p v-if="plan.workouts.length === 0" class="text-xs text-slate-500 dark:text-slate-400">
            No workouts scheduled.
          </p>
        </div>

        <div class="mt-4 flex justify-end gap-2">
          <button
            type="button"
            @click="confirmDelete(plan)"
            class="inline-flex items-center justify-center gap-2 rounded-md border border-rose-300 bg-white p-2 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-700 dark:text-rose-300 dark:hover:bg-rose-900/30"
            aria-label="Delete plan"
            title="Delete plan"
          >
            <Trash2 :size="16" />
          </button>
          <button
            type="button"
            @click="openCloneDialog(plan)"
            class="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            aria-label="Clone plan"
            title="Clone plan"
          >
            <Copy :size="16" />
          </button>
          <button
            v-if="(plan.status ?? 'Draft') !== 'Published'"
            type="button"
            :disabled="updatingStatusPlanId === plan.id"
            @click="planToPublish = plan"
            class="inline-flex items-center gap-1.5 rounded-md border border-emerald-500 bg-white px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-emerald-900/20"
          >
            <Send :size="13" />
            Publish
          </button>
          <button
            type="button"
            @click="openEditDialog(plan)"
            class="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            <Edit2 :size="14" />
            Edit
          </button>
        </div>
      </article>

      <div
        v-if="filteredPlans.length === 0"
        class="md:col-span-2 xl:col-span-3 rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        <p class="mb-2">No plans found for selected filters.</p>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="loadPlans"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Refresh list
          </button>
          <button
            type="button"
            @click="openCreateDialog"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
          >
            Create plan
          </button>
        </div>
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
              <th class="px-4 py-3 font-semibold">Plan</th>
              <th class="px-4 py-3 font-semibold">Client</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 font-semibold">Workouts</th>
              <th class="px-4 py-3 font-semibold">Details</th>
              <th class="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plan in filteredPlans" :key="plan.id" class="border-t border-slate-200 dark:border-slate-700">
              <td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{{ plan.name }}</td>
              <td class="px-4 py-3">
                <CustomerDisplay :name="getPlanClientName(plan)" :image-url="getPlanClientImage(plan)" />
              </td>
              <td class="px-4 py-3">
                <span :class="statusBadgeClass(plan)" class="rounded-full px-2 py-0.5 text-[11px] font-medium">
                  {{ plan.status ?? 'Draft' }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ plan.workouts.length }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="workout in plan.workouts.slice(0, 3)"
                    :key="`${plan.id}-list-${workout.id}`"
                    class="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  >
                    {{ workout.name }}
                  </span>
                  <span
                    v-if="plan.workouts.length > 3"
                    class="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  >
                    +{{ plan.workouts.length - 3 }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    @click="confirmDelete(plan)"
                    class="inline-flex items-center justify-center gap-2 rounded-md border border-rose-300 bg-white p-2 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-700 dark:text-rose-300 dark:hover:bg-rose-900/30"
                    aria-label="Delete plan"
                    title="Delete plan"
                  >
                    <Trash2 :size="16" />
                  </button>
                  <button
                    type="button"
                    @click="openCloneDialog(plan)"
                    class="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                    aria-label="Clone plan"
                    title="Clone plan"
                  >
                    <Copy :size="16" />
                  </button>
                  <button
                    v-if="(plan.status ?? 'Draft') !== 'Published'"
                    type="button"
                    :disabled="updatingStatusPlanId === plan.id"
                    @click="planToPublish = plan"
                    class="inline-flex items-center gap-1.5 rounded-md border border-emerald-500 bg-white px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-emerald-900/20"
                  >
                    <Send :size="13" />
                    Publish
                  </button>
                  <button
                    type="button"
                    @click="openEditDialog(plan)"
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

      <div
        v-if="filteredPlans.length === 0"
        class="border-t border-slate-200 px-4 py-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
      >
        <p class="mb-2">No plans found for selected filters.</p>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="loadPlans"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Refresh list
          </button>
          <button
            type="button"
            @click="openCreateDialog"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
          >
            Create plan
          </button>
        </div>
      </div>
    </div>

    <CalendarView v-else v-model="currentDate">
      <template #day="{ day, date }">
        <div class="mb-1 text-xs font-medium text-slate-900 dark:text-slate-100">
          {{ day }}
        </div>
        <div class="space-y-1">
          <div
            v-for="entry in getWorkoutsForDay(date)"
            :key="`${entry.planId}-${entry.workout.id}`"
            class="cursor-pointer rounded bg-emerald-100 px-1.5 py-1 text-[10px] text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-800"
            :title="`${entry.clientName} • ${entry.planName} • ${entry.workout.name}`"
            @click="openEditDialogById(entry.planId)"
          >
            <div class="mb-0.5 flex min-w-0 items-center gap-1">
              <img
                v-if="entry.clientImageUrl"
                :src="entry.clientImageUrl"
                :alt="entry.clientName"
                class="h-3.5 w-3.5 rounded-full object-cover"
              />
              <span
                v-else
                class="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-200 text-[8px] font-semibold uppercase text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
              >
                {{ (entry.clientName[0] || '?').toUpperCase() }}
              </span>
              <span class="truncate font-medium">{{ entry.clientName }}</span>
            </div>
            <p class="truncate font-semibold">{{ entry.planName }}</p>
            <p class="truncate">{{ entry.workout.name }}</p>
          </div>
        </div>
      </template>

      <template #footer>
        <div
          v-if="planCalendarEmpty"
          class="mt-4 rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          No workouts scheduled in this month for selected filters.
        </div>
      </template>
    </CalendarView>

    <div class="fixed bottom-0 left-56 right-0 z-30 px-6 pb-3">
      <div class="mx-auto w-full max-w-7xl">
        <DialogActionPanel primary-label="Create plan" @primary-click="openCreateDialog" />
      </div>
    </div>

    <PlanEditorDialog
      :open="showDialog"
      :is-editing="isEditing"
      :current-status="currentEditingPlanStatus"
      :status-updating="updatingStatusPlanId === editingPlanId"
      :clients="clients"
      :routines="routines"
      :excercises="excercises"
      :initial-name="dialogInitialData.name"
      :initial-client-id="dialogInitialData.clientId"
      :initial-workouts="dialogInitialData.workouts"
      @cancel="cancelDialog"
      @save="savePlan"
      @save-and-publish="saveAndPublish"
      @revoke="revokeCurrentPlan"
    />

    <ConfirmDialog
      :open="!!planToDelete"
      title="Delete plan"
      :message="planToDelete ? `Are you sure you want to delete the plan '${planToDelete.name}'?` : ''"
      @confirm="deletePlan"
      @cancel="planToDelete = null"
    />

    <ConfirmDialog
      :open="!!planToPublish"
      title="Publish plan"
      :message="planToPublish ? `Send '${planToPublish.name}' to ${getPlanClientName(planToPublish)}? The client will be able to see this plan.` : ''"
      confirm-label="Publish"
      confirm-variant="primary"
      @confirm="confirmPublish"
      @cancel="planToPublish = null"
    />

    <NotificationToast
      v-model:open="notificationOpen"
      :title="notificationTitle"
      :message="notificationMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { Copy, Edit2, Send, Trash2 } from 'lucide-vue-next'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import CustomerDisplay from '../../components/CustomerDisplay.vue'
import DialogActionPanel from '../../components/DialogActionPanel.vue'
import FilterOption from '../../components/FilterOption.vue'
import NotificationToast from '../../components/NotificationToast.vue'
import CalendarView from '../../components/CalendarView.vue'
import SearchInput from '../../components/SearchInput.vue'
import PlanEditorDialog from './components/PlanEditorDialog.vue'
import { useLocalStorageState } from '../../composables/useLocalStorageState'
import { usePageTitle } from '../../composables/usePageTitle'
import { useClientsApi } from '../../services/clientsApi'
import { useExcercisesApi } from '../../services/excercisesApi'
import { usePlansApi } from '../../services/plansApi'
import { useRoutinesApi } from '../../services/routinesApi'
import type { Client } from '../../types/client'
import type { Excercise } from '../../types/excercise'
import type { Plan, PlanStatus, PlanWorkout } from '../../types/plan'
import type { Routine } from '../../types/routine'

usePageTitle('Plans')

const plansApi = usePlansApi()
const clientsApi = useClientsApi()
const routinesApi = useRoutinesApi()
const excercisesApi = useExcercisesApi()

const plans = ref<Plan[]>([])
const clients = ref<Client[]>([])
const routines = ref<Routine[]>([])
const excercises = ref<Excercise[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const selectedClientNames = ref<string[]>([])
const viewMode = useLocalStorageState<'tile' | 'list' | 'calendar'>('plans:viewMode', 'list')
const currentDate = ref(new Date())

const showDialog = ref(false)
const isEditing = ref(false)
const editingPlanId = ref<string | null>(null)
const planToDelete = ref<Plan | null>(null)
const updatingStatusPlanId = ref<string | null>(null)
const planToPublish = ref<Plan | null>(null)
const notificationOpen = ref(false)
const notificationTitle = ref('')
const notificationMessage = ref('')

const dialogInitialData = ref<{
  name: string
  clientId: string
  workouts: PlanWorkout[]
}>({
  name: '',
  clientId: '',
  workouts: [],
})

const currentEditingPlanStatus = computed<PlanStatus>(() => {
  if (!isEditing.value || !editingPlanId.value) {
    return 'Draft'
  }

  const currentPlan = plans.value.find((plan) => plan.id === editingPlanId.value)
  return currentPlan?.status ?? 'Draft'
})

const getPlanClientName = (plan: Plan) => {
  return plan.client?.name || plan.clientName
}

const getPlanClientImage = (plan: Plan) => {
  return plan.client?.imageUrl || ''
}

const getPlanClientId = (plan: Plan) => {
  if (plan.clientId) {
    return plan.clientId
  }

  if (plan.client?.id) {
    return plan.client.id
  }

  const clientName = getPlanClientName(plan)
  return clients.value.find((client) => client.name === clientName)?.invitationCode || ''
}

const clientFilterOptions = computed(() => {
  const fromPlans = plans.value.map((plan) => getPlanClientName(plan))
  const fromClients = clients.value.map((client) => client.name)
  return Array.from(new Set([...fromPlans, ...fromClients])).sort((left, right) => left.localeCompare(right))
})

const filteredPlans = computed(() => {
  const normalizedQuery = searchQuery.value.trim().toLowerCase()
  const normalizedClientNames = selectedClientNames.value.map((name) => name.toLowerCase())

  return plans.value.filter((plan) => {
    const workoutsText = plan.workouts
      .map((workout) => {
        const excercisesText = workout.excercises.map((item) => item.name).join(' ')
        return `${workout.name} ${excercisesText}`
      })
      .join(' ')
      .toLowerCase()

    const matchesSearch =
      !normalizedQuery ||
      plan.name.toLowerCase().includes(normalizedQuery) ||
      getPlanClientName(plan).toLowerCase().includes(normalizedQuery) ||
      workoutsText.includes(normalizedQuery)

    const matchesClient =
      normalizedClientNames.length === 0 || normalizedClientNames.includes(getPlanClientName(plan).toLowerCase())

    return matchesSearch && matchesClient
  })
})

const getWorkoutsForDay = (date: Date) => {
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const result: Array<{ planId: string; clientName: string; clientImageUrl: string; planName: string; workout: PlanWorkout }> = []

  for (const plan of filteredPlans.value) {
    for (const workout of plan.workouts) {
      if (workout.date.split('T')[0] === dateKey) {
        result.push({
          planId: plan.id,
          clientName: getPlanClientName(plan),
          clientImageUrl: getPlanClientImage(plan),
          planName: plan.name,
          workout,
        })
      }
    }
  }

  return result
}

const planCalendarEmpty = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  return filteredPlans.value.every((plan) =>
    plan.workouts.every((workout) => {
      const d = new Date(workout.date)
      return d.getFullYear() !== year || d.getMonth() !== month
    }),
  )
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const showSuccessNotification = async (title: string, message: string) => {
  notificationTitle.value = title
  notificationMessage.value = message
  notificationOpen.value = false
  await nextTick()
  notificationOpen.value = true
}

const openCreateDialog = () => {
  isEditing.value = false
  editingPlanId.value = null
  dialogInitialData.value = {
    name: '',
    clientId: '',
    workouts: [],
  }
  showDialog.value = true
}

const openEditDialog = (plan: Plan) => {
  isEditing.value = true
  editingPlanId.value = plan.id
  dialogInitialData.value = {
    name: plan.name,
    clientId: getPlanClientId(plan),
    workouts: clonePlanWorkouts(plan.workouts),
  }
  showDialog.value = true
}

const clonePlanWorkouts = (workouts: PlanWorkout[]): PlanWorkout[] => {
  return workouts.map((workout) => ({
    ...workout,
    excercises: workout.excercises.map((excercise) => ({
      ...excercise,
      sets: excercise.sets.map((setItem) => ({ ...setItem })),
    })),
  }))
}

const openCloneDialog = (plan: Plan) => {
  isEditing.value = false
  editingPlanId.value = null
  dialogInitialData.value = {
    name: plan.name,
    clientId: getPlanClientId(plan),
    workouts: clonePlanWorkouts(plan.workouts),
  }
  showDialog.value = true
}

const cancelDialog = () => {
  showDialog.value = false
  isEditing.value = false
  editingPlanId.value = null
}
const savePlan = async (payload: { name: string; clientId?: string; workouts: PlanWorkout[] }) => {

  errorMessage.value = ''

  try {
    const derivedName = payload.name.trim() ||
      payload.workouts.map((workout) => workout.name).join(' + ') ||
      'Untitled Plan'
    const writePayload = {
      name: derivedName,
      clientId: payload.clientId?.trim() || undefined,
      workouts: payload.workouts,
    }

    if (isEditing.value && editingPlanId.value) {
      const updatedPlan = await plansApi.editPlan(editingPlanId.value, writePayload)
      const index = plans.value.findIndex((plan) => plan.id === updatedPlan.id)
      if (index !== -1) {
        plans.value[index] = updatedPlan
      }
      cancelDialog()
      await showSuccessNotification('Plan updated', `Changes for **${updatedPlan.name}** were saved successfully.`)
    } else {
      const newPlan = await plansApi.addPlan(writePayload)
      plans.value.push(newPlan)
      cancelDialog()
      await showSuccessNotification('Plan added', `Plan **${newPlan.name}** was added successfully.`)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save plan'
  }
}

const saveAndPublish = async (payload: { name: string; clientId?: string; workouts: PlanWorkout[] }) => {
  errorMessage.value = ''

  try {
    const derivedName = payload.name.trim() ||
      payload.workouts.map((workout) => workout.name).join(' + ') ||
      'Untitled Plan'
    const writePayload = {
      name: derivedName,
      clientId: payload.clientId?.trim() || undefined,
      workouts: payload.workouts,
    }

    let savedPlan: Plan
    if (isEditing.value && editingPlanId.value) {
      savedPlan = await plansApi.editPlan(editingPlanId.value, writePayload)
      const index = plans.value.findIndex((plan) => plan.id === savedPlan.id)
      if (index !== -1) plans.value[index] = savedPlan
    } else {
      savedPlan = await plansApi.addPlan(writePayload)
      plans.value.push(savedPlan)
    }

    cancelDialog()
    await updatePlanStatus(savedPlan, 'Published')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save plan'
  }
}

const confirmDelete = (plan: Plan) => {
  planToDelete.value = plan
}

const deletePlan = async () => {
  if (!planToDelete.value) {
    return
  }

  errorMessage.value = ''
  const deletedPlan = planToDelete.value

  try {
    await plansApi.deletePlan(deletedPlan.id)
    plans.value = plans.value.filter((plan) => plan.id !== deletedPlan.id)
    planToDelete.value = null
    await showSuccessNotification('Plan deleted', `Plan **${deletedPlan.name}** was deleted successfully.`)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to delete plan'
    planToDelete.value = null
  }
}

const loadPlans = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    plans.value = await plansApi.listPlans()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load plans'
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

const loadRoutines = async () => {
  try {
    routines.value = await routinesApi.listRoutines()
  } catch {
    routines.value = []
  }
}

const loadExcercises = async () => {
  try {
    excercises.value = await excercisesApi.listExcercises()
  } catch {
    excercises.value = []
  }
}

const openEditDialogById = (planId: string) => {
  const plan = filteredPlans.value.find(p => p.id === planId)
  if (plan) openEditDialog(plan)
}

const statusBadgeClass = (plan: Plan) => {
  const status = plan.status ?? 'Draft'
  if (status === 'Published') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  if (status === 'Revoked') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
}

const updatePlanStatus = async (plan: Plan, status: PlanStatus) => {
  updatingStatusPlanId.value = plan.id
  try {
    const updated = await plansApi.updatePlanStatus(plan.id, status)
    const index = plans.value.findIndex(p => p.id === plan.id)
    if (index !== -1) plans.value[index] = updated
    const clientName = getPlanClientName(updated)

    if (status === 'Published') {
      await showSuccessNotification('Plan published', `Plan **${updated.name}** was published for **${clientName}**.`)
    }

    if (status === 'Revoked') {
      await showSuccessNotification('Plan revoked', `Plan **${updated.name}** was revoked for **${clientName}**.`)
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to update plan status'
  } finally {
    updatingStatusPlanId.value = null
  }
}

const revokeCurrentPlan = async () => {
  if (!editingPlanId.value) {
    return
  }

  const currentPlan = plans.value.find((plan) => plan.id === editingPlanId.value)

  if (!currentPlan) {
    return
  }

  await updatePlanStatus(currentPlan, 'Revoked')
}

const confirmPublish = () => {
  if (!planToPublish.value) return
  const plan = planToPublish.value
  planToPublish.value = null
  updatePlanStatus(plan, 'Published')
}

onMounted(() => {
  loadPlans()
  loadClients()
  loadRoutines()
  loadExcercises()
})
</script>
