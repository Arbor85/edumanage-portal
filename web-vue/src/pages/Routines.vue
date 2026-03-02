<template>
  <div class="w-full max-w-5xl pb-24">
    <div class="mb-5">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Routines</h1>
    </div>

    <div class="mb-4 flex items-center justify-end">
      <div class="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-600">
        <button
          type="button"
          @click="viewMode = 'tile'"
          class="px-3 py-1.5 text-xs font-medium"
          :class="viewMode === 'tile'
            ? 'bg-emerald-500 text-white'
            : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
        >
          Tile
        </button>
        <button
          type="button"
          @click="viewMode = 'list'"
          class="border-l border-slate-300 px-3 py-1.5 text-xs font-medium dark:border-slate-600"
          :class="viewMode === 'list'
            ? 'bg-emerald-500 text-white'
            : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
        >
          List
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
      Loading routines...
    </div>

    <div v-else-if="viewMode === 'list'" class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
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
                  <span
                    v-for="excercise in routine.excercises"
                    :key="`${routine.id}-${excercise}`"
                    class="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  >
                    {{ excercise }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  type="button"
                  @click="openEditDialog(routine)"
                  class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="routines.length === 0"
        class="border-t border-slate-200 px-4 py-4 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
      >
        No routines yet.
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="routine in routines"
        :key="routine.id"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <p class="mb-3 font-semibold text-slate-900 dark:text-slate-100">{{ routine.name }}</p>

        <div class="flex flex-wrap gap-2">
          <span
            v-for="excercise in routine.excercises"
            :key="`${routine.id}-${excercise}`"
            class="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200"
          >
            {{ excercise }}
          </span>
        </div>

        <div class="mt-4 flex justify-end">
          <button
            type="button"
            @click="openEditDialog(routine)"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Edit
          </button>
        </div>
      </article>

      <div
        v-if="routines.length === 0"
        class="md:col-span-2 lg:col-span-3 rounded-md border border-slate-300 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        No routines yet.
      </div>
    </div>

    <div class="fixed bottom-0 left-56 right-0 z-30 px-6 pb-3">
      <div class="mx-auto w-full max-w-5xl">
        <DialogActionPanel primary-label="Add routine" @primary-click="openCreateDialog" />
      </div>
    </div>

    <div v-if="showDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" @click.self="closeDialog">
      <div class="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {{ dialogMode === 'edit' ? 'Edit routine' : 'Add routine' }}
          </h2>
          <button
            type="button"
            @click="closeDialog"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="submitRoutine">
          <div>
            <label for="routine-name" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
            <input
              id="routine-name"
              v-model.trim="formName"
              type="text"
              placeholder="Routine name"
              class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <p class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Excercises</p>
            <SelectExcercise v-model="formExcercises" :options="excerciseOptions" button-text="Add excercises" />

            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="excercise in formExcercises"
                :key="excercise"
                class="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200"
              >
                {{ excercise }}
              </span>
            </div>

            <p v-if="formExcercises.length === 0" class="mt-2 text-xs text-slate-500 dark:text-slate-300">
              No excercises selected.
            </p>
          </div>

          <DialogActionPanel
            :primary-label="dialogMode === 'edit' ? 'Save changes' : 'Add routine'"
            :primary-disabled="!canSave"
            cancel-label="Cancel"
            primary-button-type="submit"
            @cancel-click="closeDialog"
            @primary-click="submitRoutine"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DialogActionPanel from '../components/DialogActionPanel.vue'
import SelectExcercise from '../components/SelectExcercise.vue'
import { useLocalStorageState } from '../composables/useLocalStorageState'
import { usePageTitle } from '../composables/usePageTitle'
import { useExcercisesApi } from '../services/excercisesApi'
import { routinesApi } from '../services/routinesApi'
import type { Routine } from '../types/routine'

usePageTitle('Routines')

const excercisesApi = useExcercisesApi()

const routines = ref<Routine[]>([])
const viewMode = useLocalStorageState<'tile' | 'list'>('routines:viewMode', 'list')
const excerciseOptions = ref<string[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const showDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingRoutineId = ref<string | null>(null)
const formName = ref('')
const formExcercises = ref<string[]>([])

const canSave = computed(() => {
  return formName.value.length > 0 && formExcercises.value.length > 0
})

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
    const excercises = await excercisesApi.listExcercises()
    excerciseOptions.value = excercises.map((excercise) => excercise.name)
  } catch {
    excerciseOptions.value = []
  }
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  editingRoutineId.value = null
  formName.value = ''
  formExcercises.value = []
  showDialog.value = true
}

const openEditDialog = (routine: Routine) => {
  dialogMode.value = 'edit'
  editingRoutineId.value = routine.id
  formName.value = routine.name
  formExcercises.value = [...routine.excercises]
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  dialogMode.value = 'create'
  editingRoutineId.value = null
  formName.value = ''
  formExcercises.value = []
}

const submitRoutine = async () => {
  if (!canSave.value) {
    return
  }

  const payload = {
    name: formName.value,
    excercises: [...formExcercises.value],
  }

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

onMounted(() => {
  loadRoutines()
  loadExcercises()
})
</script>
