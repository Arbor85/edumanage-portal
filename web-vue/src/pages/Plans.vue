<template>
  <div class="w-full max-w-7xl pb-24">
    <div class="mb-5">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Plans</h1>
    </div>

    <div class="mb-4 flex flex-col gap-3">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          v-model.trim="searchQuery"
          type="text"
          placeholder="Search by plan, client, workout or excercise"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:flex-1"
        />

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
            <p class="text-xs text-slate-600 dark:text-slate-400">Client: {{ plan.clientName }}</p>
          </div>
          <span class="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            {{ plan.workouts.length }} workout{{ plan.workouts.length === 1 ? '' : 's' }}
          </span>
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
      v-else
      class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            <tr>
              <th class="px-4 py-3 font-semibold">Plan</th>
              <th class="px-4 py-3 font-semibold">Client</th>
              <th class="px-4 py-3 font-semibold">Workouts</th>
              <th class="px-4 py-3 font-semibold">Details</th>
              <th class="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="plan in filteredPlans" :key="plan.id" class="border-t border-slate-200 dark:border-slate-700">
              <td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{{ plan.name }}</td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">{{ plan.clientName }}</td>
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

    <div class="fixed bottom-0 left-56 right-0 z-30 px-6 pb-3">
      <div class="mx-auto w-full max-w-7xl">
        <DialogActionPanel primary-label="Create plan" @primary-click="openCreateDialog" />
      </div>
    </div>

    <div
      v-if="showDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="cancelDialog"
    >
      <div class="w-full max-w-3xl rounded-lg border border-slate-300 bg-white p-6 shadow-xl dark:border-slate-600 dark:bg-slate-800">
        <h2 class="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
          {{ isEditing ? 'Edit plan' : 'Create plan' }}
        </h2>

        <div class="space-y-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Plan name
            </label>
            <input
              v-model="formData.name"
              type="text"
              class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Enter plan name"
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Client
            </label>
            <SelectClient
              v-model="formData.clientName"
              :options="clients"
            />
          </div>

          <div>
            <div class="mb-2 flex items-center justify-between">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                Workouts ({{ formData.workouts.length }})
              </label>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="openEmptyWorkoutDialog"
                  class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                >
                  Add empty workout
                </button>
                <ScheduleRoutine
                  :routines="routines"
                  @schedule="addWorkout"
                />
              </div>
            </div>

            <div class="max-h-96 space-y-3 overflow-y-auto">
              <div
                v-for="(workout, index) in formData.workouts"
                :key="`workout-${index}`"
                class="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/50"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {{ workout.name }}
                    </p>
                    <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {{ formatDate(workout.date) }} • {{ workout.excercises.length }} exercise{{ workout.excercises.length !== 1 ? 's' : '' }}
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="removeWorkout(index)"
                    class="rounded-md bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div
                v-if="formData.workouts.length === 0"
                class="rounded border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-400"
              >
                No workouts scheduled. Click "Add workout" to start.
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button
            type="button"
            @click="cancelDialog"
            class="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="savePlan"
            :disabled="!canSave"
            class="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            {{ isEditing ? 'Save changes' : 'Create plan' }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="!!planToDelete"
      title="Delete plan"
      :message="planToDelete ? `Are you sure you want to delete the plan '${planToDelete.name}'?` : ''"
      @confirm="deletePlan"
      @cancel="planToDelete = null"
    />

    <RoutineEditorDialog
      :open="showEmptyWorkoutDialog"
      title="Add empty workout"
      save-label="Add workout"
      :excercises="excercises"
      :show-schedule-date="true"
      @cancel="showEmptyWorkoutDialog = false"
      @save="addEmptyWorkout"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Edit2, Trash2 } from 'lucide-vue-next'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import DialogActionPanel from '../components/DialogActionPanel.vue'
import FilterOption from '../components/FilterOption.vue'
import RoutineEditorDialog from '../components/RoutineEditorDialog.vue'
import ScheduleRoutine from '../components/ScheduleRoutine.vue'
import SelectClient from '../components/SelectClient.vue'
import { useLocalStorageState } from '../composables/useLocalStorageState'
import { usePageTitle } from '../composables/usePageTitle'
import { useClientsApi } from '../services/clientsApi'
import { useExcercisesApi } from '../services/excercisesApi'
import { usePlansApi } from '../services/plansApi'
import { useRoutinesApi } from '../services/routinesApi'
import type { Client } from '../types/client'
import type { Excercise } from '../types/excercise'
import type { Plan, PlanWorkout } from '../types/plan'
import type { Routine, RoutineExcercise } from '../types/routine'

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
const viewMode = useLocalStorageState<'tile' | 'list'>('plans:viewMode', 'list')

const showDialog = ref(false)
const showEmptyWorkoutDialog = ref(false)
const isEditing = ref(false)
const editingPlanId = ref<string | null>(null)
const planToDelete = ref<Plan | null>(null)

const formData = ref<{
  name: string
  clientName: string
  workouts: PlanWorkout[]
}>({
  name: '',
  clientName: '',
  workouts: [],
})

const canSave = computed(() => {
  return formData.value.name.trim() && formData.value.clientName.trim()
})

const clientFilterOptions = computed(() => {
  const fromPlans = plans.value.map((plan) => plan.clientName)
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
      plan.clientName.toLowerCase().includes(normalizedQuery) ||
      workoutsText.includes(normalizedQuery)

    const matchesClient =
      normalizedClientNames.length === 0 || normalizedClientNames.includes(plan.clientName.toLowerCase())

    return matchesSearch && matchesClient
  })
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const openCreateDialog = () => {
  isEditing.value = false
  editingPlanId.value = null
  formData.value = {
    name: '',
    clientName: '',
    workouts: [],
  }
  showDialog.value = true
}

const openEditDialog = (plan: Plan) => {
  isEditing.value = true
  editingPlanId.value = plan.id
  formData.value = {
    name: plan.name,
    clientName: plan.clientName,
    workouts: [...plan.workouts],
  }
  showDialog.value = true
}

const cancelDialog = () => {
  showDialog.value = false
  showEmptyWorkoutDialog.value = false
  isEditing.value = false
  editingPlanId.value = null
}

const openEmptyWorkoutDialog = () => {
  showEmptyWorkoutDialog.value = true
}

const addWorkout = (workout: PlanWorkout) => {
  formData.value.workouts.push(workout)
}

const addEmptyWorkout = (payload: { name: string; excercises: RoutineExcercise[]; date?: string }) => {
  const generatedId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `workout-${Date.now()}-${Math.random().toString(16).slice(2)}`

  const workout: PlanWorkout = {
    id: generatedId,
    name: payload.name,
    excercises: payload.excercises,
    date: payload.date || new Date().toISOString().split('T')[0] || '',
  }

  formData.value.workouts.push(workout)
  showEmptyWorkoutDialog.value = false
}

const removeWorkout = (index: number) => {
  formData.value.workouts.splice(index, 1)
}

const savePlan = async () => {
  if (!canSave.value) {
    return
  }

  errorMessage.value = ''

  try {
    const payload = {
      name: formData.value.name.trim(),
      clientName: formData.value.clientName.trim(),
      workouts: formData.value.workouts,
    }

    if (isEditing.value && editingPlanId.value) {
      const updatedPlan = await plansApi.editPlan(editingPlanId.value, payload)
      const index = plans.value.findIndex((plan) => plan.id === updatedPlan.id)
      if (index !== -1) {
        plans.value[index] = updatedPlan
      }
    } else {
      const newPlan = await plansApi.addPlan(payload)
      plans.value.push(newPlan)
    }

    cancelDialog()
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

  try {
    await plansApi.deletePlan(planToDelete.value.id)
    plans.value = plans.value.filter((plan) => plan.id !== planToDelete.value?.id)
    planToDelete.value = null
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

onMounted(() => {
  loadPlans()
  loadClients()
  loadRoutines()
  loadExcercises()
})
</script>
