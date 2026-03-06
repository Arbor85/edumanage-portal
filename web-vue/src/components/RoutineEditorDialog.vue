<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4"
    @click.self="emitCancel"
  >
    <div
      class="h-[90vh] w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] 2xl:w-[40vw] rounded-lg border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ title }}
        </h2>
        <button
          type="button"
          @click="emitCancel"
          class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          ✕
        </button>
      </div>

      <form class="flex h-[calc(100%-3rem)] flex-col" @submit.prevent="submit">
        <div class="flex-1 space-y-4 overflow-y-auto pr-1">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
            <input
              v-model.trim="formName"
              type="text"
              placeholder="Routine name"
              class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div v-if="showScheduleDate">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Workout date</label>
            <input
              v-model="formDate"
              type="date"
              class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <p class="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Excercises</p>
            <SelectExcercise v-model="formExcerciseNames" :options="excercises" button-text="Add excercises" />

            <p v-if="formExcercises.length === 0" class="mt-2 text-xs text-slate-500 dark:text-slate-300">
              No excercises selected.
            </p>
          </div>

          <div v-if="formExcercises.length > 0" class="space-y-3">
            <template v-for="(excercise, excerciseIndex) in formExcercises" :key="excercise.name">
              <div
                v-if="isExcerciseInsertPlaceholderVisible(excerciseIndex)"
                class="flex h-8 items-center justify-center rounded-md border border-dashed border-emerald-500 bg-emerald-50/60 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                :data-excercise-insert="excerciseIndex"
              >
                {{ getExcerciseInsertPlaceholderText(excerciseIndex) }}
              </div>

              <article
                class="rounded-md border border-slate-200 p-3 dark:border-slate-700"
                :class="isDraggedExcercise(excerciseIndex) ? 'opacity-60 ring-2 ring-emerald-500/60' : ''"
                :data-excercise-row="excerciseIndex"
              >
                <div class="mb-3 flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @pointerdown.prevent="handleExcercisePointerDown(excerciseIndex, $event)"
                      class="cursor-grab rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 active:cursor-grabbing dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                      title="Drag to reorder excercise"
                    >
                      ⋮⋮
                    </button>

                    <div>
                      <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ excercise.name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-300">
                        {{ excercise.isBodyweight ? 'Bodyweight: reps only' : 'Weighted: reps + weight' }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="removeExcercise(excerciseIndex)"
                      class="rounded-md p-1.5 text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/30"
                      title="Remove excercise"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                        <path
                          fill-rule="evenodd"
                          d="M9 3.75A1.5 1.5 0 0 1 10.5 2.25h3A1.5 1.5 0 0 1 15 3.75V4.5h3.75a.75.75 0 0 1 0 1.5h-.518l-.824 12.36A2.25 2.25 0 0 1 15.164 20.5H8.836a2.25 2.25 0 0 1-2.244-2.14L5.768 6H5.25a.75.75 0 0 1 0-1.5H9v-.75Zm1.5 0V4.5h3v-.75h-3Zm-2.49 2.25.807 12.11a.75.75 0 0 0 .748.64h6.87a.75.75 0 0 0 .748-.64L15.99 6H8.01Zm2.24 2.25a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm4.5.75a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0V9Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      @click="addSet(excerciseIndex)"
                      class="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
                    >
                      Add set
                    </button>
                  </div>
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
                      {{ getInsertPlaceholderText(excerciseIndex, setIndex) }}
                    </div>

                    <div
                      class="flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-100/70 p-2 dark:bg-slate-700/40"
                      :class="isDraggedSet(excerciseIndex, setIndex) ? 'opacity-60 ring-2 ring-emerald-500/60' : ''"
                      :data-set-row="`${excerciseIndex}:${setIndex}`"
                    >
                      <div class="flex items-center gap-2">
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
                      </div>

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

                      <div class="flex items-center gap-1">
                        <button
                          type="button"
                          @click="removeSet(excerciseIndex, setIndex)"
                          class="rounded-md p-1.5 text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/30"
                          title="Remove set"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                            <path
                              fill-rule="evenodd"
                              d="M9 3.75A1.5 1.5 0 0 1 10.5 2.25h3A1.5 1.5 0 0 1 15 3.75V4.5h3.75a.75.75 0 0 1 0 1.5h-.518l-.824 12.36A2.25 2.25 0 0 1 15.164 20.5H8.836a2.25 2.25 0 0 1-2.244-2.14L5.768 6H5.25a.75.75 0 0 1 0-1.5H9v-.75Zm1.5 0V4.5h3v-.75h-3Zm-2.49 2.25.807 12.11a.75.75 0 0 0 .748.64h6.87a.75.75 0 0 0 .748-.64L15.99 6H8.01Zm2.24 2.25a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm4.5.75a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0V9Z"
                              clip-rule="evenodd"
                            />
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
                    {{ getEndPlaceholderText(excerciseIndex) }}
                  </div>

                  <div v-if="isDragActiveForExcercise(excerciseIndex)" class="mt-1 grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div
                      class="flex h-10 items-center justify-center rounded-md border border-dashed text-xs font-medium"
                      :class="isRemoveDropActive(excerciseIndex)
                        ? 'border-rose-500 bg-rose-100 text-rose-800 dark:border-rose-500 dark:bg-rose-900/50 dark:text-rose-200'
                        : 'border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300'"
                      :data-set-action-remove="excerciseIndex"
                    >
                      {{ isRemoveDropHovered(excerciseIndex) ? 'Release to remove set' : 'Remove set' }}
                    </div>
                    <div
                      class="flex h-10 items-center justify-center rounded-md border border-dashed text-xs font-medium"
                      :class="isCopyDropActive(excerciseIndex)
                        ? 'border-sky-500 bg-sky-100 text-sky-800 dark:border-sky-500 dark:bg-sky-900/50 dark:text-sky-200'
                        : 'border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-300'"
                      :data-set-action-copy="excerciseIndex"
                    >
                      {{ isCopyDropHovered(excerciseIndex) ? 'Release to copy set' : 'Copy set' }}
                    </div>
                  </div>
                </div>
              </article>
            </template>

            <div
              v-if="isExcerciseDragActive"
              class="flex h-8 items-center justify-center rounded-md border border-dashed text-[11px] font-medium"
              :class="isExcerciseInsertPlaceholderVisible(formExcercises.length)
                ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                : 'border-slate-300 bg-transparent text-slate-500 dark:border-slate-600 dark:text-slate-300'"
              data-excercise-end="true"
            >
              {{ getExcerciseEndPlaceholderText() }}
            </div>

            <div
              v-if="isExcerciseDragActive"
              class="flex h-10 items-center justify-center rounded-md border border-dashed text-xs font-medium"
              :class="isExcerciseRemoveDropActive
                ? 'border-rose-500 bg-rose-100 text-rose-800 dark:border-rose-500 dark:bg-rose-900/50 dark:text-rose-200'
                : 'border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300'"
              data-excercise-action-remove="true"
            >
              {{ isExcerciseRemoveDropHovered ? 'Release to remove excercise' : 'Remove excercise' }}
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="emitCancel"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!canSave"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ saveLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import SelectExcercise from './SelectExcercise.vue'
import type { Excercise } from '../types/excercise'
import type { RoutineExcercise, RoutineSet } from '../types/routine'

type HoveredSetDropTarget =
  | { type: 'insert'; excerciseIndex: number; insertIndex: number }
  | { type: 'end'; excerciseIndex: number }
  | { type: 'remove'; excerciseIndex: number }
  | { type: 'copy'; excerciseIndex: number }

type HoveredExcerciseDropTarget =
  | { type: 'insert'; insertIndex: number }
  | { type: 'end' }
  | { type: 'remove' }

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    saveLabel: string
    excercises: Excercise[]
    initialName?: string
    initialExcercises?: RoutineExcercise[]
    showScheduleDate?: boolean
    initialDate?: string
  }>(),
  {
    initialName: '',
    initialExcercises: () => [],
    showScheduleDate: false,
    initialDate: '',
  },
)

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'save', payload: { name: string; excercises: RoutineExcercise[]; date?: string }): void
}>()

const formName = ref('')
const formDate = ref('')
const formExcerciseNames = ref<string[]>([])
const formExcercises = ref<RoutineExcercise[]>([])

const draggedSet = ref<{ excerciseIndex: number; setIndex: number } | null>(null)
const dropInsertTarget = ref<{ excerciseIndex: number; insertIndex: number } | null>(null)
const dropActionTarget = ref<{ excerciseIndex: number; action: 'remove' | 'copy' } | null>(null)
const hoveredDropTarget = ref<HoveredSetDropTarget | null>(null)
const isPointerDragging = ref(false)
const dragStartPoint = ref<{ x: number; y: number } | null>(null)

const draggedExcerciseIndex = ref<number | null>(null)
const excerciseDropInsertIndex = ref<number | null>(null)
const excerciseDropAction = ref<'remove' | null>(null)
const hoveredExcerciseDropTarget = ref<HoveredExcerciseDropTarget | null>(null)
const isExcercisePointerDragging = ref(false)
const excerciseDragStartPoint = ref<{ x: number; y: number } | null>(null)

const dragCursorClassName = 'routine-set-dragging-cursor'

const setDragCursorActive = (isActive: boolean) => {
  document.body.classList.toggle(dragCursorClassName, isActive)
}

const updateDragCursor = () => {
  setDragCursorActive(isPointerDragging.value || isExcercisePointerDragging.value)
}

const canSave = computed(() => {
  if (!formName.value.length || formExcercises.value.length === 0) {
    return false
  }

  if (props.showScheduleDate) {
    return !!formDate.value
  }

  return true
})

const isBodyweightExcercise = (excerciseName: string) => {
  const matchedExcercise = props.excercises.find((excercise) => excercise.name === excerciseName)

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

const cloneExcercises = (excercises: RoutineExcercise[]): RoutineExcercise[] => {
  return excercises.map((excercise) => ({
    name: excercise.name,
    isBodyweight: excercise.isBodyweight,
    sets: excercise.sets.map((setItem) => ({ ...setItem })),
  }))
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

const resetFormState = () => {
  formName.value = props.initialName
  formExcercises.value = cloneExcercises(props.initialExcercises)
  formExcerciseNames.value = props.initialExcercises.map((excercise) => excercise.name)
  formDate.value = props.initialDate || new Date().toISOString().split('T')[0] || ''
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetFormState()
      return
    }

    cleanupDragListeners()
    clearDragState()
    clearExcerciseDragState()
  },
)

const emitCancel = () => {
  emit('cancel')
}

const removeExcercise = (excerciseIndex: number) => {
  const [removedExcercise] = formExcercises.value.splice(excerciseIndex, 1)

  if (!removedExcercise) {
    return
  }

  formExcerciseNames.value = formExcercises.value.map((excercise) => excercise.name)
}

const addSet = (excerciseIndex: number) => {
  const excercise = formExcercises.value[excerciseIndex]

  if (!excercise) {
    return
  }

  const lastSet = excercise.sets[excercise.sets.length - 1]
  const newSet = lastSet ? { ...lastSet } : createEmptySet()

  excercise.sets.push(newSet)
}

const removeSet = (excerciseIndex: number, setIndex: number) => {
  const excercise = formExcercises.value[excerciseIndex]

  if (!excercise) {
    return
  }

  excercise.sets.splice(setIndex, 1)
}

const isDragActiveForExcercise = (excerciseIndex: number) => {
  return isPointerDragging.value && draggedSet.value?.excerciseIndex === excerciseIndex
}

const isDraggedSet = (excerciseIndex: number, setIndex: number) => {
  return (
    isPointerDragging.value &&
    draggedSet.value?.excerciseIndex === excerciseIndex &&
    draggedSet.value.setIndex === setIndex
  )
}

const isRemoveDropActive = (excerciseIndex: number) => {
  return dropActionTarget.value?.excerciseIndex === excerciseIndex && dropActionTarget.value.action === 'remove'
}

const isCopyDropActive = (excerciseIndex: number) => {
  return dropActionTarget.value?.excerciseIndex === excerciseIndex && dropActionTarget.value.action === 'copy'
}

const isRemoveDropHovered = (excerciseIndex: number) => {
  return hoveredDropTarget.value?.type === 'remove' && hoveredDropTarget.value.excerciseIndex === excerciseIndex
}

const isCopyDropHovered = (excerciseIndex: number) => {
  return hoveredDropTarget.value?.type === 'copy' && hoveredDropTarget.value.excerciseIndex === excerciseIndex
}

const getInsertPlaceholderText = (excerciseIndex: number, insertIndex: number) => {
  if (
    hoveredDropTarget.value?.type === 'insert' &&
    hoveredDropTarget.value.excerciseIndex === excerciseIndex &&
    hoveredDropTarget.value.insertIndex === insertIndex
  ) {
    return 'Release to move set here'
  }

  return ''
}

const getEndPlaceholderText = (excerciseIndex: number) => {
  if (hoveredDropTarget.value?.type === 'end' && hoveredDropTarget.value.excerciseIndex === excerciseIndex) {
    return 'Release to move set to end'
  }

  return ''
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

const isExcerciseDragActive = computed(() => {
  return isExcercisePointerDragging.value && draggedExcerciseIndex.value !== null
})

const isDraggedExcercise = (excerciseIndex: number) => {
  return isExcercisePointerDragging.value && draggedExcerciseIndex.value === excerciseIndex
}

const isExcerciseInsertPlaceholderVisible = (insertIndex: number) => {
  return excerciseDropInsertIndex.value === insertIndex
}

const getExcerciseInsertPlaceholderText = (insertIndex: number) => {
  if (hoveredExcerciseDropTarget.value?.type === 'insert' && hoveredExcerciseDropTarget.value.insertIndex === insertIndex) {
    return 'Release to move excercise here'
  }

  return ''
}

const getExcerciseEndPlaceholderText = () => {
  if (hoveredExcerciseDropTarget.value?.type === 'end') {
    return 'Release to move excercise to end'
  }

  return ''
}

const isExcerciseRemoveDropActive = computed(() => {
  return excerciseDropAction.value === 'remove'
})

const isExcerciseRemoveDropHovered = computed(() => {
  return hoveredExcerciseDropTarget.value?.type === 'remove'
})

const moveExcerciseToInsertIndex = (insertIndex: number) => {
  const sourceIndex = draggedExcerciseIndex.value

  if (sourceIndex === null || sourceIndex < 0 || sourceIndex >= formExcercises.value.length) {
    return
  }

  if (insertIndex < 0 || insertIndex > formExcercises.value.length) {
    return
  }

  const [movedExcercise] = formExcercises.value.splice(sourceIndex, 1)

  if (!movedExcercise) {
    return
  }

  const nextIndex = sourceIndex < insertIndex ? insertIndex - 1 : insertIndex
  formExcercises.value.splice(nextIndex, 0, movedExcercise)
  formExcerciseNames.value = formExcercises.value.map((excercise) => excercise.name)
  draggedExcerciseIndex.value = nextIndex
}

const removeDraggedExcercise = () => {
  const sourceIndex = draggedExcerciseIndex.value

  if (sourceIndex === null) {
    return
  }

  removeExcercise(sourceIndex)
}

const clearDragState = () => {
  draggedSet.value = null
  dropInsertTarget.value = null
  dropActionTarget.value = null
  hoveredDropTarget.value = null
  isPointerDragging.value = false
  dragStartPoint.value = null
  updateDragCursor()
}

const clearExcerciseDragState = () => {
  draggedExcerciseIndex.value = null
  excerciseDropInsertIndex.value = null
  excerciseDropAction.value = null
  hoveredExcerciseDropTarget.value = null
  isExcercisePointerDragging.value = false
  excerciseDragStartPoint.value = null
  updateDragCursor()
}

const handleSetPointerMove = (event: PointerEvent) => {
  const source = draggedSet.value

  if (!source) {
    return
  }

  if (!isPointerDragging.value) {
    const startPoint = dragStartPoint.value

    if (!startPoint) {
      return
    }

    const distance = Math.hypot(event.clientX - startPoint.x, event.clientY - startPoint.y)

    if (distance < 4) {
      return
    }

    isPointerDragging.value = true
    updateDragCursor()
  }

  const elementAtPointer = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null

  if (!elementAtPointer) {
    dropActionTarget.value = null
    hoveredDropTarget.value = null
    return
  }

  const removeTarget = elementAtPointer.closest('[data-set-action-remove]') as HTMLElement | null

  if (removeTarget) {
    const targetExcerciseIndex = Number(removeTarget.dataset.setActionRemove)

    if (Number.isFinite(targetExcerciseIndex) && targetExcerciseIndex === source.excerciseIndex) {
      hoveredDropTarget.value = { type: 'remove', excerciseIndex: targetExcerciseIndex }
      dropActionTarget.value = { excerciseIndex: targetExcerciseIndex, action: 'remove' }
      return
    }
  }

  const copyTarget = elementAtPointer.closest('[data-set-action-copy]') as HTMLElement | null

  if (copyTarget) {
    const targetExcerciseIndex = Number(copyTarget.dataset.setActionCopy)

    if (Number.isFinite(targetExcerciseIndex) && targetExcerciseIndex === source.excerciseIndex) {
      hoveredDropTarget.value = { type: 'copy', excerciseIndex: targetExcerciseIndex }
      dropActionTarget.value = { excerciseIndex: targetExcerciseIndex, action: 'copy' }
      return
    }
  }

  dropActionTarget.value = null

  const insertTarget = elementAtPointer.closest('[data-set-insert]') as HTMLElement | null

  if (insertTarget) {
    const rawInsert = insertTarget.dataset.setInsert ?? ''
    const [excerciseIndexPart, insertIndexPart] = rawInsert.split(':')
    const targetExcerciseIndex = Number(excerciseIndexPart)
    const targetInsertIndex = Number(insertIndexPart)

    if (
      Number.isFinite(targetExcerciseIndex) &&
      Number.isFinite(targetInsertIndex) &&
      targetExcerciseIndex === source.excerciseIndex
    ) {
      hoveredDropTarget.value = {
        type: 'insert',
        excerciseIndex: targetExcerciseIndex,
        insertIndex: targetInsertIndex,
      }
      dropInsertTarget.value = { excerciseIndex: targetExcerciseIndex, insertIndex: targetInsertIndex }
      return
    }
  }

  const endTarget = elementAtPointer.closest('[data-set-end]') as HTMLElement | null

  if (endTarget) {
    const targetExcerciseIndex = Number(endTarget.dataset.setEnd)
    const excercise = formExcercises.value[targetExcerciseIndex]

    if (Number.isFinite(targetExcerciseIndex) && targetExcerciseIndex === source.excerciseIndex && excercise) {
      hoveredDropTarget.value = { type: 'end', excerciseIndex: targetExcerciseIndex }
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
      hoveredDropTarget.value = null
      dropInsertTarget.value = { excerciseIndex: targetExcerciseIndex, insertIndex }
      return
    }
  }

  hoveredDropTarget.value = null
}

const handleExcercisePointerMove = (event: PointerEvent) => {
  const sourceIndex = draggedExcerciseIndex.value

  if (sourceIndex === null) {
    return
  }

  if (!isExcercisePointerDragging.value) {
    const startPoint = excerciseDragStartPoint.value

    if (!startPoint) {
      return
    }

    const distance = Math.hypot(event.clientX - startPoint.x, event.clientY - startPoint.y)

    if (distance < 4) {
      return
    }

    isExcercisePointerDragging.value = true
    updateDragCursor()
  }

  const elementAtPointer = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null

  if (!elementAtPointer) {
    excerciseDropAction.value = null
    hoveredExcerciseDropTarget.value = null
    return
  }

  const removeTarget = elementAtPointer.closest('[data-excercise-action-remove]') as HTMLElement | null

  if (removeTarget) {
    hoveredExcerciseDropTarget.value = { type: 'remove' }
    excerciseDropAction.value = 'remove'
    return
  }

  excerciseDropAction.value = null

  const insertTarget = elementAtPointer.closest('[data-excercise-insert]') as HTMLElement | null

  if (insertTarget) {
    const targetInsertIndex = Number(insertTarget.dataset.excerciseInsert)

    if (Number.isFinite(targetInsertIndex)) {
      hoveredExcerciseDropTarget.value = { type: 'insert', insertIndex: targetInsertIndex }
      excerciseDropInsertIndex.value = targetInsertIndex
      return
    }
  }

  const endTarget = elementAtPointer.closest('[data-excercise-end]') as HTMLElement | null

  if (endTarget) {
    hoveredExcerciseDropTarget.value = { type: 'end' }
    excerciseDropInsertIndex.value = formExcercises.value.length
    return
  }

  const rowTarget = elementAtPointer.closest('[data-excercise-row]') as HTMLElement | null

  if (rowTarget) {
    const targetExcerciseIndex = Number(rowTarget.dataset.excerciseRow)

    if (Number.isFinite(targetExcerciseIndex)) {
      const rowBounds = rowTarget.getBoundingClientRect()
      const insertIndex = event.clientY >= rowBounds.top + rowBounds.height / 2 ? targetExcerciseIndex + 1 : targetExcerciseIndex
      hoveredExcerciseDropTarget.value = null
      excerciseDropInsertIndex.value = insertIndex
      return
    }
  }

  hoveredExcerciseDropTarget.value = null
}

const handleSetPointerUp = () => {
  const source = draggedSet.value

  window.removeEventListener('pointermove', handleSetPointerMove)
  window.removeEventListener('pointerup', handleSetPointerUp)

  if (!source) {
    return
  }

  if (!isPointerDragging.value) {
    clearDragState()
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
  dropInsertTarget.value = null
  dropActionTarget.value = null
  isPointerDragging.value = false
  dragStartPoint.value = { x: event.clientX, y: event.clientY }

  window.addEventListener('pointermove', handleSetPointerMove)
  window.addEventListener('pointerup', handleSetPointerUp)
}

const handleExcercisePointerUp = () => {
  const sourceIndex = draggedExcerciseIndex.value

  window.removeEventListener('pointermove', handleExcercisePointerMove)
  window.removeEventListener('pointerup', handleExcercisePointerUp)

  if (sourceIndex === null) {
    return
  }

  if (!isExcercisePointerDragging.value) {
    clearExcerciseDragState()
    return
  }

  if (excerciseDropAction.value === 'remove') {
    removeDraggedExcercise()
    clearExcerciseDragState()
    return
  }

  if (excerciseDropInsertIndex.value !== null) {
    moveExcerciseToInsertIndex(excerciseDropInsertIndex.value)
  }

  clearExcerciseDragState()
}

const handleExcercisePointerDown = (excerciseIndex: number, event: PointerEvent) => {
  if (event.button !== 0) {
    return
  }

  draggedExcerciseIndex.value = excerciseIndex
  excerciseDropInsertIndex.value = null
  excerciseDropAction.value = null
  hoveredExcerciseDropTarget.value = null
  isExcercisePointerDragging.value = false
  excerciseDragStartPoint.value = { x: event.clientX, y: event.clientY }

  window.addEventListener('pointermove', handleExcercisePointerMove)
  window.addEventListener('pointerup', handleExcercisePointerUp)
}

const cleanupDragListeners = () => {
  window.removeEventListener('pointermove', handleSetPointerMove)
  window.removeEventListener('pointerup', handleSetPointerUp)
  window.removeEventListener('pointermove', handleExcercisePointerMove)
  window.removeEventListener('pointerup', handleExcercisePointerUp)
}

const submit = () => {
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
    date: formDate.value,
  }

  emit('save', props.showScheduleDate ? payload : { name: payload.name, excercises: payload.excercises })
}

onBeforeUnmount(() => {
  cleanupDragListeners()
  setDragCursorActive(false)
})
</script>

<style scoped>
:global(body.routine-set-dragging-cursor),
:global(body.routine-set-dragging-cursor *) {
  cursor: grabbing !important;
}
</style>
