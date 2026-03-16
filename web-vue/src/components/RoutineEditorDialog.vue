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
                      <Trash2 class="size-4" />
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
                        class="group relative flex flex-wrap items-center justify-between gap-2 rounded-md bg-slate-100/70 p-2 dark:bg-slate-700/40"
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

                        <SetTypePicker v-model="setItem.type" />
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

                      <div
                        class="w-16 text-center text-[11px] font-medium"
                        title="Volume change vs previous set"
                        :class="setIndex === 0 || getVolumeDiff(excercise, setIndex) === null
                          ? 'text-slate-400 dark:text-slate-500'
                          : getVolumeDiff(excercise, setIndex)?.startsWith('+')
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : getVolumeDiff(excercise, setIndex) === '0%'
                          ? 'text-slate-400 dark:text-slate-500'
                          : 'text-rose-600 dark:text-rose-400'"
                      >
                        {{ setIndex === 0 ? '' : getVolumeDiff(excercise, setIndex) === null ? 'vol --' : `vol ${getVolumeDiff(excercise, setIndex)}` }}
                      </div>

                      <div class="flex items-center gap-1">
                        <button
                          type="button"
                          @click="removeSet(excerciseIndex, setIndex)"
                          class="rounded-md p-1.5 text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/30"
                          title="Remove set"
                        >
                          <Trash2 class="size-4" />
                        </button>
                      </div>

                      <div
                        v-if="!isDragActiveForExcercise(excerciseIndex)"
                        class="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <button
                          type="button"
                          @click="openProgressionDialog(excerciseIndex, setIndex, 'increase')"
                          class="h-5 w-5 rounded border border-slate-200 bg-white text-[13px] leading-none text-slate-500 shadow-sm hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-emerald-500 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300"
                          title="Add increased set after"
                        >+</button>
                        <button
                          type="button"
                          @click="openProgressionDialog(excerciseIndex, setIndex, 'decrease')"
                          class="h-5 w-5 rounded border border-slate-200 bg-white text-[13px] leading-none text-slate-500 shadow-sm hover:border-rose-400 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-rose-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-300"
                          title="Add decreased set after"
                        >−</button>
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

    <div
      v-if="progressionDialog"
      class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4"
      @click.self="progressionDialog = null"
    >
      <div class="w-full max-w-xs rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
            {{ progressionDialog.direction === 'increase' ? '↑ Increase next set' : '↓ Decrease next set' }}
          </h3>
          <button
            type="button"
            @click="progressionDialog = null"
            class="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >✕</button>
        </div>

        <div class="space-y-4">
          <div class="flex gap-1 rounded-md border border-slate-200 p-0.5 dark:border-slate-700">
            <button
              type="button"
              @click="progressionStrategy = 'percentage'; saveProgressionPrefs()"
              :class="progressionStrategy === 'percentage'
                ? 'flex-1 rounded py-1.5 text-xs font-medium bg-white shadow text-slate-900 dark:bg-slate-600 dark:text-slate-100'
                : 'flex-1 rounded py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
            >By %</button>
            <button
              type="button"
              @click="progressionStrategy = 'manual'; saveProgressionPrefs()"
              :class="progressionStrategy === 'manual'
                ? 'flex-1 rounded py-1.5 text-xs font-medium bg-white shadow text-slate-900 dark:bg-slate-600 dark:text-slate-100'
                : 'flex-1 rounded py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
            >Manual</button>
          </div>

          <div v-if="progressionStrategy === 'percentage'" class="space-y-3">
            <div class="flex gap-2">
              <button
                v-for="pct in [5, 10, 15]"
                :key="pct"
                type="button"
                @click="progressionPercent = pct; saveProgressionPrefs()"
                :class="progressionPercent === pct
                  ? 'flex-1 rounded-md border border-emerald-500 bg-emerald-500 py-2 text-sm font-semibold text-white'
                  : 'flex-1 rounded-md border border-slate-300 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'"
              >{{ pct }}%</button>
            </div>

            <div v-if="!isCurrentSetBodyweight" class="flex gap-1 rounded-md border border-slate-200 p-0.5 dark:border-slate-700">
              <button
                v-for="target in progressionTargets"
                :key="target.value"
                type="button"
                @click="progressionTarget = target.value; saveProgressionPrefs()"
                :class="progressionTarget === target.value
                  ? 'flex-1 rounded py-1.5 text-xs font-medium bg-white shadow text-slate-900 dark:bg-slate-600 dark:text-slate-100'
                  : 'flex-1 rounded py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
              >{{ target.label }}</button>
            </div>
          </div>

          <div v-else class="space-y-3">
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Reps</label>
              <input
                v-model.number="progressionManualReps"
                type="number"
                min="0"
                placeholder="Reps"
                class="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div v-if="!isCurrentSetBodyweight">
              <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">Weight</label>
              <input
                v-model.number="progressionManualWeight"
                type="number"
                min="0"
                step="0.25"
                placeholder="Weight"
                class="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        <div class="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="progressionDialog = null"
            class="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >Cancel</button>
          <button
            type="button"
            @click="applyProgression()"
            class="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
          >Apply</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import SelectExcercise from './Select/SelectExcercise.vue'
import SetTypePicker from './SetTypePicker.vue'
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

const getVolumeDiff = (excercise: RoutineExcercise, setIndex: number): string | null => {
  if (setIndex === 0) return null
  const prev = excercise.sets[setIndex - 1]
  const curr = excercise.sets[setIndex]
  if (!prev || !curr) return null

  const prevVol = excercise.isBodyweight
    ? (typeof prev.reps === 'number' ? prev.reps : null)
    : (typeof prev.reps === 'number' && typeof prev.weight === 'number' ? prev.reps * prev.weight : null)
  const currVol = excercise.isBodyweight
    ? (typeof curr.reps === 'number' ? curr.reps : null)
    : (typeof curr.reps === 'number' && typeof curr.weight === 'number' ? curr.reps * curr.weight : null)

  if (prevVol === null || currVol === null || prevVol === 0) return null

  const diff = Math.round(((currVol - prevVol) / prevVol) * 100)
  return diff > 0 ? `+${diff}%` : `${diff}%`
}

type ProgressionStrategy = 'percentage' | 'manual'
type ProgressionDirection = 'increase' | 'decrease'

const PROGRESSION_STRATEGY_KEY = 'set-progression-strategy'
const PROGRESSION_PERCENT_KEY = 'set-progression-percent'
const PROGRESSION_TARGET_KEY = 'set-progression-target'

type ProgressionTarget = 'weight' | 'reps' | 'volume'

const progressionTargets: { value: ProgressionTarget; label: string }[] = [
  { value: 'weight', label: 'Weight' },
  { value: 'reps', label: 'Reps' },
  { value: 'volume', label: 'Volume' },
]

const progressionDialog = ref<{
  direction: ProgressionDirection
  excerciseIndex: number
  setIndex: number
} | null>(null)

const progressionStrategy = ref<ProgressionStrategy>(
  (localStorage.getItem(PROGRESSION_STRATEGY_KEY) as ProgressionStrategy | null) ?? 'percentage',
)
const progressionPercent = ref<number>(Number(localStorage.getItem(PROGRESSION_PERCENT_KEY)) || 5)
const progressionTarget = ref<ProgressionTarget>(
  (localStorage.getItem(PROGRESSION_TARGET_KEY) as ProgressionTarget | null) ?? 'volume',
)
const progressionManualReps = ref<number | null>(null)
const progressionManualWeight = ref<number | null>(null)

const isCurrentSetBodyweight = computed(() => {
  if (!progressionDialog.value) return false
  return formExcercises.value[progressionDialog.value.excerciseIndex]?.isBodyweight ?? false
})

const saveProgressionPrefs = () => {
  localStorage.setItem(PROGRESSION_STRATEGY_KEY, progressionStrategy.value)
  localStorage.setItem(PROGRESSION_PERCENT_KEY, String(progressionPercent.value))
  localStorage.setItem(PROGRESSION_TARGET_KEY, progressionTarget.value)
}

const openProgressionDialog = (
  excerciseIndex: number,
  setIndex: number,
  direction: ProgressionDirection,
) => {
  const set = formExcercises.value[excerciseIndex]?.sets[setIndex]
  progressionManualReps.value = set?.reps ?? null
  progressionManualWeight.value = set?.weight ?? null
  progressionDialog.value = { direction, excerciseIndex, setIndex }
}

const applyProgression = () => {
  if (!progressionDialog.value) return
  const { direction, excerciseIndex, setIndex } = progressionDialog.value
  const excercise = formExcercises.value[excerciseIndex]
  const sourceSet = excercise?.sets[setIndex]

  if (!excercise || !sourceSet) {
    progressionDialog.value = null
    return
  }

  let newSet: RoutineSet

  if (progressionStrategy.value === 'manual') {
    newSet = {
      type: sourceSet.type,
      reps: typeof progressionManualReps.value === 'number' ? progressionManualReps.value : sourceSet.reps,
      weight: excercise.isBodyweight
        ? null
        : typeof progressionManualWeight.value === 'number'
        ? progressionManualWeight.value
        : sourceSet.weight,
    }
  } else {
    const factor =
      direction === 'increase'
        ? 1 + progressionPercent.value / 100
        : 1 - progressionPercent.value / 100

    if (excercise.isBodyweight) {
      const baseReps = typeof sourceSet.reps === 'number' ? sourceSet.reps : 0
      newSet = { type: sourceSet.type, reps: Math.max(1, Math.round(baseReps * factor)), weight: null }
    } else {
      const target = progressionTarget.value
      const baseWeight = typeof sourceSet.weight === 'number' ? sourceSet.weight : 0
      const baseReps = typeof sourceSet.reps === 'number' ? sourceSet.reps : 0
      newSet = {
        type: sourceSet.type,
        reps: (target === 'reps' || target === 'volume') ? Math.max(1, Math.round(baseReps * factor)) : sourceSet.reps,
        weight: (target === 'weight' || target === 'volume') ? Math.max(0, Math.round(baseWeight * factor * 4) / 4) : sourceSet.weight,
      }
    }
  }

  excercise.sets.splice(setIndex + 1, 0, newSet)
  saveProgressionPrefs()
  progressionDialog.value = null
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
