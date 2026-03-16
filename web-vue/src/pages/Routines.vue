<template>
  <div class="w-full max-w-5xl pb-24">
    <div class="mb-5">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Routines</h1>
    </div>

    <div class="mb-4 flex items-center justify-end gap-2">
      <div class="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-600">
        <button type="button" @click="viewMode = 'tile'" class="px-3 py-1.5 text-xs font-medium"
          :class="viewMode === 'tile'
            ? 'bg-emerald-500 text-white'
            : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'">
          Tile
        </button>
        <button type="button" @click="viewMode = 'list'"
          class="border-l border-slate-300 px-3 py-1.5 text-xs font-medium dark:border-slate-600"
          :class="viewMode === 'list'
            ? 'bg-emerald-500 text-white'
            : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'">
          List
        </button>
      </div>
      <button type="button" @click="loadRoutines" :disabled="isLoading" aria-label="Refresh routines"
        title="Refresh routines"
        class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          class="h-4 w-4" :class="isLoading ? 'animate-spin' : ''">
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <polyline points="21 3 21 9 15 9" />
        </svg>
      </button>
    </div>

    <div v-if="errorMessage"
      class="mb-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
      {{ errorMessage }}
    </div>

    <LoadingPanel v-if="isLoading" :is-loading="isLoading" label="Loading routines..." />

    <div v-else-if="viewMode === 'list'"
      class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            <tr>
              <th class="px-4 py-3 font-semibold">Name</th>
              <th class="px-4 py-3 font-semibold">Excercises</th>
              <th class="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="routine in routines" :key="routine.id" class="border-t border-slate-200 dark:border-slate-700">
              <td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{{ routine.name }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="excercise in routine.excercises" :key="`${routine.id}-${excercise.name}`"
                    class="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {{ excercise.name }} ({{ excercise.sets.length }})
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="inline-flex items-center gap-2">
                  <button type="button" @click="requestDeleteRoutine(routine)" aria-label="Remove routine"
                    title="Remove routine"
                    class="inline-flex items-center justify-center gap-2 rounded-md border border-rose-300 bg-white p-2 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-700 dark:text-rose-300 dark:hover:bg-rose-900/30">
                    <Trash2 :size="16" />
                  </button>
                  <button type="button" @click="openEditDialog(routine)"
                    class="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white p-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="routines.length === 0"
        class="border-t border-slate-200 px-4 py-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
        No routines yet.
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <article v-for="routine in routines" :key="routine.id"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p class="mb-3 font-semibold text-slate-900 dark:text-slate-100">{{ routine.name }}</p>

        <div class="flex flex-wrap gap-2">
          <span v-for="excercise in routine.excercises" :key="`${routine.id}-${excercise.name}`"
            class="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            {{ excercise.name }} ({{ excercise.sets.length }})
          </span>
        </div>

        <div class="mt-4 flex items-center justify-between gap-2">

          <button type="button" @click="requestDeleteRoutine(routine)" aria-label="Remove routine"
            title="Remove routine"
            class="inline-flex items-center justify-center gap-2 rounded-md border border-rose-300 bg-white p-2 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-700 dark:text-rose-300 dark:hover:bg-rose-900/30">
            <Trash2 :size="16" />
          </button>
          <button type="button" @click="openEditDialog(routine)"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600">
            Edit
          </button>
        </div>
      </article>

      <div v-if="routines.length === 0"
        class="md:col-span-2 lg:col-span-3 rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
        No routines yet.
      </div>
    </div>

    <div class="fixed bottom-0 left-56 right-0 z-30 px-6 pb-3">
      <div class="mx-auto w-full max-w-5xl">
        <DialogActionPanel primary-label="Add routine" @primary-click="openCreateDialog" />
      </div>
    </div>

    <RoutineEditorDialog :open="showDialog" :title="dialogMode === 'edit' ? 'Edit routine' : 'Add routine'"
      :save-label="dialogMode === 'edit' ? 'Save changes' : 'Add routine'" :excercises="excercises"
      :initial-name="editingRoutineName" :initial-note="editingRoutineNote" :initial-excercises="editingRoutineExcercises" @cancel="closeDialog"
      @save="saveRoutineFromDialog" />

    <ConfirmDialog :open="showDeleteDialog" title="Delete routine" :message="deleteDialogMessage" confirm-label="Delete"
      cancel-label="Cancel" @confirm="confirmDeleteRoutine" @cancel="closeDeleteDialog" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import DialogActionPanel from '../components/DialogActionPanel.vue'
import LoadingPanel from '../components/LoadingPanel.vue'
import RoutineEditorDialog from '../components/RoutineEditorDialog.vue'
import { useLocalStorageState } from '../composables/useLocalStorageState'
import { usePageTitle } from '../composables/usePageTitle'
import { useExcercisesApi } from '../services/excercisesApi'
import { useRoutinesApi } from '../services/routinesApi'
import type { Excercise } from '../types/excercise'
import type { Routine, RoutineExcercise } from '../types/routine'
import { Trash2 } from 'lucide-vue-next'

usePageTitle('Routines')

const excercisesApi = useExcercisesApi()
const routinesApi = useRoutinesApi()
const { isLoading: isAuthLoading, isAuthenticated } = useAuth0()

const routines = ref<Routine[]>([])
const viewMode = useLocalStorageState<'tile' | 'list'>('routines:viewMode', 'list')
const excercises = ref<Excercise[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const showDeleteDialog = ref(false)
const pendingDeleteRoutine = ref<Routine | null>(null)

const showDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingRoutineId = ref<string | null>(null)
const editingRoutineName = ref('')
const editingRoutineNote = ref('')
const editingRoutineExcercises = ref<RoutineExcercise[]>([])
const hasLoadedRoutinesInitially = ref(false)

const loadRoutines = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    routines.value = await routinesApi.listRoutines()
  } catch {
    errorMessage.value = 'Failed to load routines'
  } finally {
    isLoading.value = false
  }
}

const loadExcercises = async () => {
  try {
    excercises.value = await excercisesApi.listExcercises()
  } catch {
    excercises.value = []
  }
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  editingRoutineId.value = null
  editingRoutineName.value = ''
  editingRoutineNote.value = ''
  editingRoutineExcercises.value = []
  showDialog.value = true
}

const openEditDialog = (routine: Routine) => {
  dialogMode.value = 'edit'
  editingRoutineId.value = routine.id
  editingRoutineName.value = routine.name
  editingRoutineNote.value = routine.note || ''
  editingRoutineExcercises.value = routine.excercises.map((excercise) => ({
    name: excercise.name,
    isBodyweight: excercise.isBodyweight,
    note: excercise.note,
    sets: excercise.sets.map((setItem) => ({ ...setItem })),
  }))
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  dialogMode.value = 'create'
  editingRoutineId.value = null
  editingRoutineName.value = ''
  editingRoutineNote.value = ''
  editingRoutineExcercises.value = []
}

const saveRoutineFromDialog = async (payload: { name: string; note?: string; excercises: RoutineExcercise[] }) => {
  try {
    if (dialogMode.value === 'edit' && editingRoutineId.value) {
      const updatedRoutine = await routinesApi.editRoutine(editingRoutineId.value, payload)
      routines.value = routines.value.map((routine) => {
        if (routine.id !== updatedRoutine.id) {
          return routine
        }

        return updatedRoutine
      })
    } else {
      const createdRoutine = await routinesApi.addRoutine(payload)
      routines.value = [createdRoutine, ...routines.value]
    }

    closeDialog()
  } catch {
    errorMessage.value = 'Failed to save routine'
  }
}

const deleteDialogMessage = computed(() => {
  if (!pendingDeleteRoutine.value) {
    return 'Are you sure you want to delete this routine?'
  }

  return `Are you sure you want to delete "${pendingDeleteRoutine.value.name}"?`
})

const requestDeleteRoutine = (routine: Routine) => {
  pendingDeleteRoutine.value = routine
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  pendingDeleteRoutine.value = null
}

const confirmDeleteRoutine = async () => {
  const routine = pendingDeleteRoutine.value

  if (!routine) {
    return
  }

  errorMessage.value = ''

  try {
    await routinesApi.deleteRoutine(routine.id)
    routines.value = routines.value.filter((entry) => entry.id !== routine.id)

    if (dialogMode.value === 'edit' && editingRoutineId.value === routine.id) {
      closeDialog()
    }

    closeDeleteDialog()
  } catch {
    errorMessage.value = 'Failed to delete routine'
  }
}

watch(
  [isAuthLoading, isAuthenticated],
  async ([authLoading, authenticated]) => {
    if (authLoading || !authenticated || hasLoadedRoutinesInitially.value) {
      return
    }

    hasLoadedRoutinesInitially.value = true
    await loadRoutines()
    await loadExcercises()
  },
  { immediate: true },
)
</script>
