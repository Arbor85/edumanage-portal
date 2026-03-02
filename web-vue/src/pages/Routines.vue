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
                    :key="`${routine.id}-${excercise.name}`"
                    class="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  >
                    {{ excercise.name }} ({{ excercise.sets.length }})
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
            :key="`${routine.id}-${excercise.name}`"
            class="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200"
          >
            {{ excercise.name }} ({{ excercise.sets.length }})
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
      <div class="h-[90vh] w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] 2xl:w-[40vw] rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
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

        <form class="flex h-[calc(100%-3rem)] flex-col" @submit.prevent="submitRoutine">
          <div class="flex-1 space-y-4 overflow-y-auto pr-1">
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
              <SelectExcercise v-model="formExcerciseNames" :options="excerciseOptions" button-text="Add excercises" />

              <p v-if="formExcercises.length === 0" class="mt-2 text-xs text-slate-500 dark:text-slate-300">
                No excercises selected.
              </p>
            </div>

            <div class="space-y-3" v-if="formExcercises.length > 0">
              <article
                v-for="(excercise, excerciseIndex) in formExcercises"
                :key="excercise.name"
                class="rounded-md border border-slate-200 p-3 dark:border-slate-700"
              >
                <div class="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ excercise.name }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-300">
                      {{ excercise.isBodyweight ? 'Bodyweight: reps only' : 'Weighted: reps + weight' }}
                    </p>
                  </div>
                  <button
                    type="button"
                    @click="addSet(excerciseIndex)"
                    class="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    Add set
                  </button>
                </div>

                <div v-if="excercise.sets.length === 0" class="text-xs text-slate-500 dark:text-slate-300">
                  No sets yet.
                </div>

                <div v-else class="space-y-2">
                  <template v-for="(setItem, setIndex) in excercise.sets" :key="`${excercise.name}-set-${setIndex}`">
                    <div
                      v-if="isInsertPlaceholderVisible(excerciseIndex, setIndex)"
                      class="flex h-8 items-center justify-center rounded-md border border-dashed border-emerald-500 bg-emerald-50/60 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      :data-set-insert="`${excerciseIndex}:${setIndex}`"
                    >
                      Drop here
                    </div>

                    <div
                      class="flex flex-wrap items-center gap-2 rounded-md bg-slate-100/70 p-2 dark:bg-slate-700/40"
                      :class="isDraggedSet(excerciseIndex, setIndex) ? 'opacity-60 ring-2 ring-emerald-500/60' : ''"
                      :data-set-row="`${excerciseIndex}:${setIndex}`"
                    >
                      <button
                        type="button"
                        @pointerdown.prevent="handleSetPointerDown(excerciseIndex, setIndex, $event)"
                        class="cursor-grab rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 active:cursor-grabbing dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                        title="Drag to reorder"
                      >
                        ⋮⋮
                      </button>

                      <select
                        v-model="setItem.type"
                        class="w-24 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                      >
                        <option value="warmup">warmup</option>
                        <option value="normal">normal</option>
                        <option value="fail">fail</option>
                      </select>

                      <input
                        v-model.number="setItem.reps"
                        type="number"
                        min="0"
                        placeholder="Reps"
                        class="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                      />

                      <input
                        v-if="!excercise.isBodyweight"
                        v-model.number="setItem.weight"
                        type="number"
                        min="0"
                        step="0.25"
                        placeholder="Weight"
                        class="w-24 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                      />

                      <div class="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          @click="removeSet(excerciseIndex, setIndex)"
                          class="rounded-md border border-rose-300 p-1.5 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/30"
                          title="Remove set"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                            <path fill-rule="evenodd" d="M9 3.75A1.5 1.5 0 0 1 10.5 2.25h3A1.5 1.5 0 0 1 15 3.75V4.5h3.75a.75.75 0 0 1 0 1.5h-.518l-.824 12.36A2.25 2.25 0 0 1 15.164 20.5H8.836a2.25 2.25 0 0 1-2.244-2.14L5.768 6H5.25a.75.75 0 0 1 0-1.5H9v-.75Zm1.5 0V4.5h3v-.75h-3Zm-2.49 2.25.807 12.11a.75.75 0 0 0 .748.64h6.87a.75.75 0 0 0 .748-.64L15.99 6H8.01Zm2.24 2.25a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm4.5.75a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0V9Z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </template>

                  <div
                    v-if="isDragActiveForExcercise(excerciseIndex)"
                    class="flex h-8 items-center justify-center rounded-md border border-dashed text-[11px] font-medium"
                    :class="isInsertPlaceholderVisible(excerciseIndex, excercise.sets.length)
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                      : 'border-slate-300 bg-transparent text-slate-500 dark:border-slate-600 dark:text-slate-300'"
                    :data-set-end="excerciseIndex"
                  >
                    Drop at end
                  </div>

                  <div class="mt-1 grid grid-cols-1 gap-2 md:grid-cols-2" v-if="isDragActiveForExcercise(excerciseIndex)">
                    <div
                      class="flex h-10 items-center justify-center rounded-md border border-dashed text-xs font-medium"
                      :class="isRemoveDropActive(excerciseIndex)
                        ? 'border-rose-500 bg-rose-100 text-rose-800 dark:border-rose-500 dark:bg-rose-900/50 dark:text-rose-200'
                        : 'border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300'"
                      :data-set-action-remove="excerciseIndex"
                    >
                      Drop here to remove set
                    </div>
                    <div
                      class="flex h-10 items-center justify-center rounded-md border border-dashed text-xs font-medium"
                      :class="isCopyDropActive(excerciseIndex)
                        ? 'border-sky-500 bg-sky-100 text-sky-800 dark:border-sky-500 dark:bg-sky-900/50 dark:text-sky-200'
                        : 'border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-300'"
                      :data-set-action-copy="excerciseIndex"
                    >
                      Drop here to copy set
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <div class="mt-4">
            <DialogActionPanel
              :primary-label="dialogMode === 'edit' ? 'Save changes' : 'Add routine'"
              :primary-disabled="!canSave"
              cancel-label="Cancel"
              primary-button-type="submit"
              @cancel-click="closeDialog"
              @primary-click="submitRoutine"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DialogActionPanel from '../components/DialogActionPanel.vue'
import SelectExcercise from '../components/SelectExcercise.vue'
import { useLocalStorageState } from '../composables/useLocalStorageState'
import { usePageTitle } from '../composables/usePageTitle'
import { useExcercisesApi } from '../services/excercisesApi'
import { routinesApi } from '../services/routinesApi'
import type { Excercise } from '../types/excercise'
import type { Routine, RoutineExcercise, RoutineSet } from '../types/routine'

usePageTitle('Routines')

const excercisesApi = useExcercisesApi()

const routines = ref<Routine[]>([])
const viewMode = useLocalStorageState<'tile' | 'list'>('routines:viewMode', 'list')
const excercises = ref<Excercise[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const showDialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const editingRoutineId = ref<string | null>(null)
const formName = ref('')
const formExcerciseNames = ref<string[]>([])
const formExcercises = ref<RoutineExcercise[]>([])
const draggedSet = ref<{ excerciseIndex: number; setIndex: number } | null>(null)
const dropInsertTarget = ref<{ excerciseIndex: number; insertIndex: number } | null>(null)
const dropActionTarget = ref<{ excerciseIndex: number; action: 'remove' | 'copy' } | null>(null)

const excerciseOptions = computed(() => {
  return excercises.value.map((excercise) => excercise.name)
})

const canSave = computed(() => {
  return formName.value.length > 0 && formExcercises.value.length > 0
})

const isBodyweightExcercise = (excerciseName: string) => {
  const matchedExcercise = excercises.value.find((excercise) => excercise.name === excerciseName)

  if (!matchedExcercise) {
    return false
  }

  return matchedExcercise.tags.some((tag) => tag.toLowerCase() === 'bodyweight')
}

const createEmptySet = (): RoutineSet => {
  return {
    type: 'normal',
    reps: null,
    weight: null,
  }
}

const syncFormExcercisesFromNames = (names: string[]) => {
  const currentByName = new Map(formExcercises.value.map((excercise) => [excercise.name, excercise]))

  formExcercises.value = names.map((name) => {
    const currentExcercise = currentByName.get(name)

    if (currentExcercise) {
      return {
        name,
        isBodyweight: currentExcercise.isBodyweight,
        sets: [...currentExcercise.sets],
      }
    }

    return {
      name,
      isBodyweight: isBodyweightExcercise(name),
      sets: [],
    }
  })
}

watch(
  formExcerciseNames,
  (nextNames) => {
    syncFormExcercisesFromNames(nextNames)
  },
  { deep: true },
)

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
    syncFormExcercisesFromNames(formExcerciseNames.value)
  } catch {
    excercises.value = []
  }
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  editingRoutineId.value = null
  formName.value = ''
  formExcerciseNames.value = []
  formExcercises.value = []
  showDialog.value = true
}

const openEditDialog = (routine: Routine) => {
  dialogMode.value = 'edit'
  editingRoutineId.value = routine.id
  formName.value = routine.name
  formExcercises.value = routine.excercises.map((excercise) => {
    return {
      name: excercise.name,
      isBodyweight: excercise.isBodyweight,
      sets: excercise.sets.map((setItem) => ({ ...setItem })),
    }
  })
  formExcerciseNames.value = routine.excercises.map((excercise) => excercise.name)
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  dialogMode.value = 'create'
  editingRoutineId.value = null
  formName.value = ''
  formExcerciseNames.value = []
  formExcercises.value = []
  window.removeEventListener('pointermove', handleSetPointerMove)
  window.removeEventListener('pointerup', handleSetPointerUp)
  draggedSet.value = null
  dropInsertTarget.value = null
}

const addSet = (excerciseIndex: number) => {
  const excercise = formExcercises.value[excerciseIndex]

  if (!excercise) {
    return
  }

  excercise.sets.push(createEmptySet())
}

const removeSet = (excerciseIndex: number, setIndex: number) => {
  const excercise = formExcercises.value[excerciseIndex]

  if (!excercise) {
    return
  }

  excercise.sets.splice(setIndex, 1)
}

const isDragActiveForExcercise = (excerciseIndex: number) => {
  return draggedSet.value?.excerciseIndex === excerciseIndex
}

const isDraggedSet = (excerciseIndex: number, setIndex: number) => {
  return draggedSet.value?.excerciseIndex === excerciseIndex && draggedSet.value.setIndex === setIndex
}

const isRemoveDropActive = (excerciseIndex: number) => {
  return dropActionTarget.value?.excerciseIndex === excerciseIndex && dropActionTarget.value.action === 'remove'
}

const isCopyDropActive = (excerciseIndex: number) => {
  return dropActionTarget.value?.excerciseIndex === excerciseIndex && dropActionTarget.value.action === 'copy'
}

const isInsertPlaceholderVisible = (excerciseIndex: number, insertIndex: number) => {
  return dropInsertTarget.value?.excerciseIndex === excerciseIndex && dropInsertTarget.value.insertIndex === insertIndex
}

const moveSetToInsertIndex = (targetExcerciseIndex: number, insertIndex: number) => {
  const source = draggedSet.value

  if (!source || source.excerciseIndex !== targetExcerciseIndex) {
    return
  }

  const excercise = formExcercises.value[targetExcerciseIndex]

  if (!excercise) {
    return
  }

  const sets = excercise.sets

  if (insertIndex < 0 || insertIndex > sets.length) {
    return
  }

  const [movedSet] = sets.splice(source.setIndex, 1)

  if (!movedSet) {
    return
  }

  const nextIndex = source.setIndex < insertIndex ? insertIndex - 1 : insertIndex
  sets.splice(nextIndex, 0, movedSet)
  draggedSet.value = { excerciseIndex: targetExcerciseIndex, setIndex: nextIndex }
}

const removeDraggedSet = (targetExcerciseIndex: number) => {
  const source = draggedSet.value

  if (!source || source.excerciseIndex !== targetExcerciseIndex) {
    return
  }

  removeSet(source.excerciseIndex, source.setIndex)
}

const copyDraggedSet = (targetExcerciseIndex: number) => {
  const source = draggedSet.value

  if (!source || source.excerciseIndex !== targetExcerciseIndex) {
    return
  }

  const excercise = formExcercises.value[targetExcerciseIndex]

  if (!excercise) {
    return
  }

  const sourceSet = excercise.sets[source.setIndex]

  if (!sourceSet) {
    return
  }

  excercise.sets.push({ ...sourceSet })
}

const clearDragState = () => {
  draggedSet.value = null
  dropInsertTarget.value = null
  dropActionTarget.value = null
}

const handleSetPointerMove = (event: PointerEvent) => {
  const source = draggedSet.value

  if (!source) {
    return
  }

  const elementAtPointer = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null

  if (!elementAtPointer) {
    dropActionTarget.value = null
    return
  }

  const removeTarget = elementAtPointer.closest('[data-set-action-remove]') as HTMLElement | null

  if (removeTarget) {
    const targetExcerciseIndex = Number(removeTarget.dataset.setActionRemove)

    if (Number.isFinite(targetExcerciseIndex) && targetExcerciseIndex === source.excerciseIndex) {
      dropActionTarget.value = { excerciseIndex: targetExcerciseIndex, action: 'remove' }
      return
    }
  }

  const copyTarget = elementAtPointer.closest('[data-set-action-copy]') as HTMLElement | null

  if (copyTarget) {
    const targetExcerciseIndex = Number(copyTarget.dataset.setActionCopy)

    if (Number.isFinite(targetExcerciseIndex) && targetExcerciseIndex === source.excerciseIndex) {
      dropActionTarget.value = { excerciseIndex: targetExcerciseIndex, action: 'copy' }
      return
    }
  }

  dropActionTarget.value = null

  const endTarget = elementAtPointer.closest('[data-set-end]') as HTMLElement | null

  if (endTarget) {
    const targetExcerciseIndex = Number(endTarget.dataset.setEnd)
    const excercise = formExcercises.value[targetExcerciseIndex]

    if (Number.isFinite(targetExcerciseIndex) && targetExcerciseIndex === source.excerciseIndex && excercise) {
      dropInsertTarget.value = { excerciseIndex: targetExcerciseIndex, insertIndex: excercise.sets.length }
      return
    }
  }

  const rowTarget = elementAtPointer.closest('[data-set-row]') as HTMLElement | null

  if (rowTarget) {
    const rawRow = rowTarget.dataset.setRow ?? ''
    const [excerciseIndexPart, setIndexPart] = rawRow.split(':')
    const targetExcerciseIndex = Number(excerciseIndexPart)
    const targetSetIndex = Number(setIndexPart)

    if (
      Number.isFinite(targetExcerciseIndex) &&
      Number.isFinite(targetSetIndex) &&
      targetExcerciseIndex === source.excerciseIndex
    ) {
      const rowBounds = rowTarget.getBoundingClientRect()
      const insertIndex = event.clientY >= rowBounds.top + rowBounds.height / 2 ? targetSetIndex + 1 : targetSetIndex
      dropInsertTarget.value = { excerciseIndex: targetExcerciseIndex, insertIndex }
      return
    }
  }
}

const handleSetPointerUp = () => {
  const source = draggedSet.value

  window.removeEventListener('pointermove', handleSetPointerMove)
  window.removeEventListener('pointerup', handleSetPointerUp)

  if (!source) {
    return
  }

  if (dropActionTarget.value?.excerciseIndex === source.excerciseIndex) {
    if (dropActionTarget.value.action === 'remove') {
      removeDraggedSet(source.excerciseIndex)
    } else {
      copyDraggedSet(source.excerciseIndex)
    }

    clearDragState()
    return
  }

  if (dropInsertTarget.value?.excerciseIndex === source.excerciseIndex) {
    moveSetToInsertIndex(source.excerciseIndex, dropInsertTarget.value.insertIndex)
  }

  clearDragState()
}

const handleSetPointerDown = (excerciseIndex: number, setIndex: number, event: PointerEvent) => {
  if (event.button !== 0) {
    return
  }

  draggedSet.value = { excerciseIndex, setIndex }
  dropInsertTarget.value = { excerciseIndex, insertIndex: setIndex }
  dropActionTarget.value = null

  window.addEventListener('pointermove', handleSetPointerMove)
  window.addEventListener('pointerup', handleSetPointerUp)
}

const submitRoutine = async () => {
  if (!canSave.value) {
    return
  }

  const payload = {
    name: formName.value,
    excercises: formExcercises.value.map((excercise) => {
      const sanitizedSets = excercise.sets.map((setItem) => {
        const reps = typeof setItem.reps === 'number' && Number.isFinite(setItem.reps) ? setItem.reps : null
        const weight =
          !excercise.isBodyweight && typeof setItem.weight === 'number' && Number.isFinite(setItem.weight)
            ? setItem.weight
            : null

        return {
          type: setItem.type,
          reps,
          weight,
        }
      })

      return {
        name: excercise.name,
        isBodyweight: excercise.isBodyweight,
        sets: sanitizedSets,
      }
    }),
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

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', handleSetPointerMove)
  window.removeEventListener('pointerup', handleSetPointerUp)
})
</script>
