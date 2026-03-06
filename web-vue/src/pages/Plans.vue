<template>
  <div class="w-full max-w-7xl pb-10">
    <div class="mb-5 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Plans</h1>
      <div class="flex items-center gap-3">
        <!-- View mode toggle -->
        <div class="flex rounded-md border border-slate-300 dark:border-slate-600 overflow-hidden">
          <button
            @click="viewMode = 'list'"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors',
              viewMode === 'list'
                ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            ]"
          >
            List
          </button>
          <button
            @click="viewMode = 'calendar'"
            :class="[
              'px-4 py-2 text-sm font-medium transition-colors border-l border-slate-300 dark:border-slate-600',
              viewMode === 'calendar'
                ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            ]"
          >
            Calendar
          </button>
        </div>
        
        <button
          @click="openCreateDialog"
          class="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          <Plus :size="18" />
          Create plan
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
      class="mb-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
    >
      Loading plans...
    </div>

    <!-- List View -->
    <div v-else-if="viewMode === 'list'" class="space-y-4">
      <article
        v-for="plan in plans"
        :key="plan.id"
        class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="mb-3 flex items-start justify-between gap-4">
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ plan.name }}</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Client: {{ plan.clientName }}</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="openEditDialog(plan)"
              class="inline-flex items-center gap-2 rounded-md bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              <Edit2 :size="16" />
              Edit
            </button>
            <button
              @click="confirmDelete(plan)"
              class="inline-flex items-center gap-2 rounded-md bg-rose-100 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50"
            >
              <Trash2 :size="16" />
              Delete
            </button>
          </div>
        </div>
        
        <div v-if="plan.workouts.length > 0" class="space-y-2">
          <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300">Workouts ({{ plan.workouts.length }})</h3>
          <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="(workout, index) in plan.workouts"
              :key="`${plan.id}-workout-${index}`"
              class="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/50"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ workout.name }}</span>
                <span class="text-xs text-slate-600 dark:text-slate-400">{{ formatDate(workout.date) }}</span>
              </div>
              <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {{ workout.excercises.length }} exercise{{ workout.excercises.length !== 1 ? 's' : '' }}
              </p>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-slate-500 dark:text-slate-400">
          No workouts scheduled
        </div>
      </article>

      <div
        v-if="plans.length === 0"
        class="rounded-md border border-slate-300 bg-white p-6 text-center text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        No plans created yet. Click "Create plan" to get started.
      </div>
    </div>

    <!-- Calendar View -->
    <div v-else-if="viewMode === 'calendar'" class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-4 flex items-center justify-between">
        <button
          @click="changeMonth(-1)"
          class="rounded-md bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Previous
        </button>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ currentMonthYear }}
        </h2>
        <button
          @click="changeMonth(1)"
          class="rounded-md bg-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          Next
        </button>
      </div>

      <div class="grid grid-cols-7 gap-2">
        <!-- Day headers -->
        <div
          v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
          :key="day"
          class="text-center text-sm font-medium text-slate-600 dark:text-slate-400 py-2"
        >
          {{ day }}
        </div>

        <!-- Calendar cells -->
        <div
          v-for="(cell, index) in calendarCells"
          :key="`cell-${index}`"
          :class="[
            'min-h-24 rounded border p-2',
            cell.isCurrentMonth
              ? 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800'
              : 'border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-900',
            cell.isToday ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : ''
          ]"
        >
          <div class="text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">
            {{ cell.day }}
          </div>
          <div class="space-y-1">
            <div
              v-for="workout in cell.workouts"
              :key="`${workout.planId}-${workout.workout.id}`"
              class="text-[10px] rounded bg-emerald-100 px-1.5 py-1 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 truncate"
              :title="`${workout.planName}: ${workout.workout.name}`"
            >
              {{ workout.planName }}: {{ workout.workout.name }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
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

            <div class="space-y-3 max-h-96 overflow-y-auto">
              <div
                v-for="(workout, index) in formData.workouts"
                :key="`workout-${index}`"
                class="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/50"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {{ workout.name }}
                    </p>
                    <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {{ formatDate(workout.date) }} • {{ workout.excercises.length }} exercise{{ workout.excercises.length !== 1 ? 's' : '' }}
                    </p>
                  </div>
                  <button
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
            @click="cancelDialog"
            class="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            @click="savePlan"
            :disabled="!canSave"
            class="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            {{ isEditing ? 'Save changes' : 'Create plan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
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
import { Plus, Edit2, Trash2 } from 'lucide-vue-next'
import { usePageTitle } from '../composables/usePageTitle'
import { usePlansApi } from '../services/plansApi'
import { useClientsApi } from '../services/clientsApi'
import { useRoutinesApi } from '../services/routinesApi'
import { useExcercisesApi } from '../services/excercisesApi'
import type { Plan, PlanWorkout } from '../types/plan'
import type { Client } from '../types/client'
import type { Excercise } from '../types/excercise'
import type { Routine, RoutineExcercise } from '../types/routine'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import SelectClient from '../components/SelectClient.vue'
import ScheduleRoutine from '../components/ScheduleRoutine.vue'
import RoutineEditorDialog from '../components/RoutineEditorDialog.vue'

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
const viewMode = ref<'list' | 'calendar'>('list')

// Calendar state
const currentDate = ref(new Date())

// Dialog state
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Calendar computed properties
const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

type CalendarCell = {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  dateString: string
  workouts: Array<{ planId: string; planName: string; workout: PlanWorkout }>
}

const calendarCells = computed((): CalendarCell[] => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const cells: CalendarCell[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const cellDate = new Date(year, month - 1, day)
    cells.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      dateString: cellDate.toISOString().split('T')[0] || '',
      workouts: []
    })
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day)
    cells.push({
      day,
      isCurrentMonth: true,
      isToday: cellDate.getTime() === today.getTime(),
      dateString: cellDate.toISOString().split('T')[0] || '',
      workouts: []
    })
  }
  
  // Next month days
  const remainingCells = 42 - cells.length // 6 rows * 7 days
  for (let day = 1; day <= remainingCells; day++) {
    const cellDate = new Date(year, month + 1, day)
    cells.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      dateString: cellDate.toISOString().split('T')[0] || '',
      workouts: []
    })
  }
  
  // Add workouts to cells
  plans.value.forEach(plan => {
    plan.workouts.forEach(workout => {
      const workoutDate = workout.date.split('T')[0]
      const cell = cells.find(c => c.dateString === workoutDate)
      if (cell) {
        cell.workouts.push({
          planId: plan.id,
          planName: plan.name,
          workout
        })
      }
    })
  })
  
  return cells
})

const changeMonth = (offset: number) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + offset)
  currentDate.value = newDate
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
  if (!canSave.value) return

  errorMessage.value = ''

  try {
    const payload = {
      name: formData.value.name.trim(),
      clientName: formData.value.clientName.trim(),
      workouts: formData.value.workouts,
    }

    if (isEditing.value && editingPlanId.value) {
      const updatedPlan = await plansApi.editPlan(editingPlanId.value, payload)
      const index = plans.value.findIndex(p => p.id === updatedPlan.id)
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
  if (!planToDelete.value) return

  errorMessage.value = ''

  try {
    await plansApi.deletePlan(planToDelete.value.id)
    plans.value = plans.value.filter(p => p.id !== planToDelete.value!.id)
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
    // Silently fail, clients dropdown will just be empty
  }
}

const loadRoutines = async () => {
  try {
    routines.value = await routinesApi.listRoutines()
  } catch {
    // Silently fail, routines dropdown will just be empty
  }
}

const loadExcercises = async () => {
  try {
    excercises.value = await excercisesApi.listExcercises()
  } catch {
    // Silently fail, empty list disables building detailed workouts
  }
}

onMounted(() => {
  loadPlans()
  loadClients()
  loadRoutines()
  loadExcercises()
})
</script>
