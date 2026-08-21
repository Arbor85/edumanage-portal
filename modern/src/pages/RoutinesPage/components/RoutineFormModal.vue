<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { usePageTitle } from '../../../composables/usePageTitle'
import type {
  RoutineOut, RoutineCreate, RoutineUpdate, RoutineExcercise, RoutineSet,
  ExcerciseOut, DefaultWorkoutOut, ActivityType, ActivityTrackType,
  SupersetGroup, SupersetColor, DropConfig,
} from '../../../types'
import { useRoutineStore } from '../../../stores/routineStore'
import { useToast } from '../../../composables/useToast'
import FullSizeDialog from '../../../components/FullSizeDialog/index.vue'
import ExercisePickerDialog from '../../../components/ExercisePickerDialog/index.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import BaseButton from '../../../components/BaseButton.vue'
import EmptyState from '../../../components/EmptyState.vue'
import EditSet from '../../../components/EditSet/index.vue'
import AddSetsDialog from '../../../components/AddSetsDialog/index.vue'
import DefaultWorkoutPickerDialog from '../../../components/DefaultWorkoutPickerDialog/index.vue'
import { X, Plus, Dumbbell, MoreVertical, ChevronUp, ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  routine: RoutineOut | null
}>()
const emit = defineEmits<{ close: [] }>()

usePageTitle(() => props.routine ? 'Edit Routine' : 'New Routine', () => props.open)

const routineStore = useRoutineStore()
const toast = useToast()

// ── Color config ──────────────────────────────────────────────

const SUPERSET_COLORS: Record<SupersetColor, { border: string; dot: string; bg: string; headerText: string }> = {
  violet: {
    border: 'border-violet-400 dark:border-violet-500',
    dot:    'bg-violet-400 dark:bg-violet-500',
    bg:     'bg-violet-50 dark:bg-violet-900/10',
    headerText: 'text-violet-600 dark:text-violet-400',
  },
  orange: {
    border: 'border-orange-400 dark:border-orange-500',
    dot:    'bg-orange-400 dark:bg-orange-500',
    bg:     'bg-orange-50 dark:bg-orange-900/10',
    headerText: 'text-orange-600 dark:text-orange-400',
  },
  sky: {
    border: 'border-sky-400 dark:border-sky-500',
    dot:    'bg-sky-400 dark:bg-sky-500',
    bg:     'bg-sky-50 dark:bg-sky-900/10',
    headerText: 'text-sky-600 dark:text-sky-400',
  },
  rose: {
    border: 'border-rose-400 dark:border-rose-500',
    dot:    'bg-rose-400 dark:bg-rose-500',
    bg:     'bg-rose-50 dark:bg-rose-900/10',
    headerText: 'text-rose-600 dark:text-rose-400',
  },
  amber: {
    border: 'border-amber-400 dark:border-amber-500',
    dot:    'bg-amber-400 dark:bg-amber-500',
    bg:     'bg-amber-50 dark:bg-amber-900/10',
    headerText: 'text-amber-600 dark:text-amber-400',
  },
}
const COLOR_ORDER: SupersetColor[] = ['violet', 'orange', 'sky', 'rose', 'amber']

const ACTIVITY_TYPE_BADGE: Record<ActivityType, { label: string; classes: string }> = {
  weighted:   { label: 'Weighted',   classes: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' },
  machine:    { label: 'Machine',    classes: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' },
  bodyweight: { label: 'Bodyweight', classes: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' },
  cardio:     { label: 'Cardio',     classes: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400' },
}

// ── Form state ────────────────────────────────────────────────

const form = ref<{
  name: string | null
  note: string | null
  excercises: RoutineExcercise[]
  supersetGroups: SupersetGroup[]
}>({
  name: null, note: null, excercises: [], supersetGroups: [],
})
const saving = ref(false)
const confirmDelete = ref(false)
const confirmDiscard = ref(false)
const isExercisePickerOpen = ref(false)
const isDefaultWorkoutPickerOpen = ref(false)
const addSetsForExIdx = ref<number | null>(null)

// per-exercise ⋮ menu
const openMenuFor = ref<number | null>(null)

// superset group name/color editor
const editingGroupId = ref<string | null>(null)

// superset picker (when adding to one of multiple existing supersets)
const supersetPickerFor = ref<number | null>(null)  // exercise index

// drop set config dialog
const dropConfigFor = ref<number | null>(null)  // exercise index
const dropConfigCount = ref(3)
const dropConfigPct = ref(20)

let savedSnapshot = ''

const isDirty = computed(() => JSON.stringify(form.value) !== savedSnapshot)

const nameIsAuto = ref(false)

watch(
  () => form.value.excercises.map((e) => e.name),
  (names) => {
    if (!nameIsAuto.value) return
    form.value.name = names.filter(Boolean).join(' + ') || null
  },
)

function onNameInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  nameIsAuto.value = !val
  form.value.name = val || null
}

watch(() => props.open, (val) => {
  if (val) {
    if (props.routine) {
      form.value = {
        name: props.routine.name,
        note: props.routine.note,
        excercises: (props.routine.excercises ?? []).map((ex) => ({
          name: ex.name,
          activityType: ex.activityType ?? 'weighted',
          activityTrackType: ex.activityTrackType ?? 'repetitions',
          sets: (ex.sets ?? []).map((s) => ({ ...s })),
          supersetGroupId: ex.supersetGroupId ?? null,
          dropConfig: ex.dropConfig ?? null,
        })),
        supersetGroups: (props.routine.supersetGroups ?? []).map(g => ({ ...g })),
      }
      nameIsAuto.value = false
    } else {
      form.value = { name: null, note: null, excercises: [], supersetGroups: [] }
      nameIsAuto.value = true
    }
    savedSnapshot = JSON.stringify(form.value)
    openMenuFor.value = null
    editingGroupId.value = null
  }
})

// ── Exercise blocks (computed flat list with superset grouping) ──

type ExerciseBlock =
  | { type: 'superset'; groupId: string; exerciseIndices: number[] }
  | { type: 'exercise'; exerciseIndex: number }

const exerciseBlocks = computed<ExerciseBlock[]>(() => {
  const blocks: ExerciseBlock[] = []
  const seen = new Set<string>()

  for (let i = 0; i < form.value.excercises.length; i++) {
    const ex = form.value.excercises[i]
    const gid = ex.supersetGroupId

    if (gid && !seen.has(gid)) {
      seen.add(gid)
      const indices = form.value.excercises
        .map((e, idx) => ({ e, idx }))
        .filter(({ e }) => e.supersetGroupId === gid)
        .map(({ idx }) => idx)
      blocks.push({ type: 'superset', groupId: gid, exerciseIndices: indices })
    } else if (!gid) {
      blocks.push({ type: 'exercise', exerciseIndex: i })
    }
  }
  return blocks
})

// ── Off-screen exercises indicator ─────────────────────────────

const listEl = ref<HTMLElement | null>(null)
const blockEls = new Map<number, HTMLElement>()
const offscreenAbove = ref<string[]>([])
const offscreenBelow = ref<string[]>([])
let listObserver: MutationObserver | null = null

function setBlockEl(bi: number, el: unknown) {
  if (el) blockEls.set(bi, el as HTMLElement)
  else blockEls.delete(bi)
}

function blockLabel(block: ExerciseBlock): string {
  if (block.type === 'superset') {
    const group = getGroup(block.groupId)
    if (group?.name) return group.name
    const names = block.exerciseIndices
      .map(i => form.value.excercises[i]?.name)
      .filter(Boolean) as string[]
    return names.join(' + ') || 'Superset'
  }
  return form.value.excercises[block.exerciseIndex]?.name || 'Exercise'
}

function summarize(names: string[]): string {
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`
}

function recomputeOffscreen() {
  const container = listEl.value
  if (!container) {
    offscreenAbove.value = []
    offscreenBelow.value = []
    return
  }
  const cRect = container.getBoundingClientRect()
  const above: string[] = []
  const below: string[] = []
  exerciseBlocks.value.forEach((block, bi) => {
    const el = blockEls.get(bi)
    if (!el) return
    const r = el.getBoundingClientRect()
    if (r.bottom <= cRect.top) above.push(blockLabel(block))
    else if (r.top >= cRect.bottom) below.push(blockLabel(block))
  })
  if (above.join() !== offscreenAbove.value.join()) offscreenAbove.value = above
  if (below.join() !== offscreenBelow.value.join()) offscreenBelow.value = below
}

watch(listEl, (el) => {
  listObserver?.disconnect()
  listObserver = null
  if (!el) {
    offscreenAbove.value = []
    offscreenBelow.value = []
    return
  }
  listObserver = new MutationObserver(() => nextTick(recomputeOffscreen))
  listObserver.observe(el, { childList: true, subtree: true })
  nextTick(recomputeOffscreen)
})

window.addEventListener('resize', recomputeOffscreen)
onUnmounted(() => {
  listObserver?.disconnect()
  window.removeEventListener('resize', recomputeOffscreen)
})

// ── Helpers ───────────────────────────────────────────────────

function getGroup(id: string): SupersetGroup | undefined {
  return form.value.supersetGroups.find(g => g.id === id)
}

function nextAvailableColor(): SupersetColor {
  const used = new Set(form.value.supersetGroups.map(g => g.color))
  return COLOR_ORDER.find(c => !used.has(c)) ?? COLOR_ORDER[0]
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// Adjust all exercises in group so their set count matches the reference count
function syncGroupSetCounts(groupId: string, targetCount: number) {
  const exes = form.value.excercises.filter(e => e.supersetGroupId === groupId)
  for (const ex of exes) {
    const sets = ex.sets ?? []
    const diff = targetCount - sets.length
    if (diff > 0) {
      const last = sets[sets.length - 1]
      for (let i = 0; i < diff; i++) {
        sets.push(last ? { ...last } : { type: 'normal', reps: 10, weight: null, duration: null, distance: null, note: null })
      }
    } else if (diff < 0) {
      sets.splice(targetCount)
    }
    ex.sets = sets
  }
}

// Round drop weight to nearest 0.5
function roundHalf(n: number) { return Math.round(n * 2) / 2 }

function computedDropWeights(exIdx: number): number[] {
  const ex = form.value.excercises[exIdx]
  if (!ex.dropConfig || !ex.sets?.length) return []
  const start = ex.sets[0].weight ?? 0
  const weights: number[] = [start]
  for (let i = 1; i < ex.dropConfig.count; i++) {
    weights.push(roundHalf(weights[i - 1] * (1 - ex.dropConfig.weightDecreasePercent / 100)))
  }
  return weights
}

// ── Exercise management ───────────────────────────────────────

function defaultSetForTrackType(trackType: ActivityTrackType): RoutineSet {
  if (trackType === 'time')     return { type: 'normal', reps: null, weight: null, duration: 60, distance: null, note: null }
  if (trackType === 'distance') return { type: 'normal', reps: null, weight: null, duration: null, distance: 1000, note: null }
  return { type: 'normal', reps: 10, weight: null, duration: null, distance: null, note: null }
}

function onExercisePicked(ex: ExcerciseOut) {
  const trackType: ActivityTrackType = ex.activityTrackType ?? 'repetitions'
  form.value.excercises.push({
    name: ex.name,
    activityType: ex.activityType ?? 'weighted',
    activityTrackType: trackType,
    sets: [defaultSetForTrackType(trackType)],
    supersetGroupId: null,
    dropConfig: null,
  })
}

function removeExercise(i: number) {
  const ex = form.value.excercises[i]
  if (ex.supersetGroupId) {
    removeFromSuperset(i)
  }
  form.value.excercises.splice(i, 1)
  // Fix up exercise indices referenced in blocks are recomputed anyway
}

function addSet(exIdx: number) {
  const ex = form.value.excercises[exIdx]
  const sets = ex.sets ?? []
  const last = sets[sets.length - 1]
  const newSet = last ? { ...last } : { type: 'normal', reps: 10, weight: null, duration: null, distance: null, note: null }
  ex.sets = [...sets, newSet]

  // Sync superset group set counts
  if (ex.supersetGroupId) {
    syncGroupSetCounts(ex.supersetGroupId, ex.sets.length)
  }
}

function removeSet(exIdx: number, setIdx: number) {
  const ex = form.value.excercises[exIdx]
  ex.sets!.splice(setIdx, 1)
  if (ex.supersetGroupId && ex.sets!.length > 0) {
    syncGroupSetCounts(ex.supersetGroupId, ex.sets!.length)
  }
}

function onSetsAdded(sets: RoutineSet[]) {
  const ex = form.value.excercises[addSetsForExIdx.value!]
  ex.sets = [...(ex.sets ?? []), ...sets]
  if (ex.supersetGroupId) {
    syncGroupSetCounts(ex.supersetGroupId, ex.sets.length)
  }
  addSetsForExIdx.value = null
}

function onDefaultWorkoutSelected(w: DefaultWorkoutOut) {
  form.value.excercises = (w.excercises ?? []).map((ex) => ({
    name: ex.name,
    activityType: ex.activityType ?? 'weighted',
    activityTrackType: ex.activityTrackType ?? 'repetitions',
    sets: (ex.sets ?? []).map((s) => ({ ...s })),
    supersetGroupId: null,
    dropConfig: null,
  }))
  form.value.supersetGroups = []
  if (nameIsAuto.value) form.value.name = w.name
}

// ── Superset management ───────────────────────────────────────

function addToSuperset(exIdx: number) {
  supersetPickerFor.value = exIdx
  openMenuFor.value = null
}

function createNewSuperset(exIdx: number) {
  const id = generateId()
  const color = nextAvailableColor()
  form.value.supersetGroups.push({ id, name: null, color })
  form.value.excercises[exIdx].supersetGroupId = id
}

function joinSuperset(exIdx: number, groupId: string) {
  const group = getGroup(groupId)
  if (!group) return
  const ex = form.value.excercises[exIdx]

  // Get reference set count from existing group members
  const groupMember = form.value.excercises.find(e => e.supersetGroupId === groupId)
  const targetCount = groupMember?.sets?.length ?? ex.sets?.length ?? 1

  ex.supersetGroupId = groupId
  // Sync set count for the newly joined exercise
  const sets = ex.sets ?? []
  const diff = targetCount - sets.length
  if (diff > 0) {
    const last = sets[sets.length - 1]
    for (let i = 0; i < diff; i++) {
      sets.push(last ? { ...last } : { type: 'normal', reps: 10, weight: null, duration: null, distance: null, note: null })
    }
    ex.sets = sets
  } else if (diff < 0) {
    ex.sets = sets.slice(0, targetCount)
  }
}

function removeFromSuperset(exIdx: number) {
  const ex = form.value.excercises[exIdx]
  const groupId = ex.supersetGroupId
  if (!groupId) return
  ex.supersetGroupId = null

  // Dissolve group if only one exercise remains
  const remaining = form.value.excercises.filter(e => e.supersetGroupId === groupId)
  if (remaining.length <= 1) {
    remaining.forEach(e => { e.supersetGroupId = null })
    form.value.supersetGroups = form.value.supersetGroups.filter(g => g.id !== groupId)
  }
  openMenuFor.value = null
}

function editGroup(groupId: string) {
  editingGroupId.value = editingGroupId.value === groupId ? null : groupId
}

function setGroupName(groupId: string, name: string) {
  const g = getGroup(groupId)
  if (g) g.name = name || null
}

function setGroupColor(groupId: string, color: SupersetColor) {
  const g = getGroup(groupId)
  if (g) g.color = color
}

// ── Drop set management ───────────────────────────────────────

function openDropSetConfig(exIdx: number) {
  const ex = form.value.excercises[exIdx]
  if (ex.dropConfig) {
    dropConfigCount.value = ex.dropConfig.count
    dropConfigPct.value = ex.dropConfig.weightDecreasePercent
  } else {
    dropConfigCount.value = 3
    dropConfigPct.value = 20
  }
  dropConfigFor.value = exIdx
  openMenuFor.value = null
}

function applyDropConfig() {
  if (dropConfigFor.value === null) return
  const ex = form.value.excercises[dropConfigFor.value]
  const config: DropConfig = { count: dropConfigCount.value, weightDecreasePercent: dropConfigPct.value }
  ex.dropConfig = config
  // Keep only the starting set
  if (ex.sets && ex.sets.length > 1) ex.sets = [ex.sets[0]]
  dropConfigFor.value = null
}

function removeDropConfig(exIdx: number) {
  form.value.excercises[exIdx].dropConfig = null
  openMenuFor.value = null
}

// ── Request close ─────────────────────────────────────────────

function requestClose() {
  if (isDirty.value) {
    confirmDiscard.value = true
  } else {
    emit('close')
  }
}

// ── Save / delete ─────────────────────────────────────────────

async function save() {
  saving.value = true
  try {
    if (props.routine?.id) {
      await routineStore.update(props.routine.id, form.value as RoutineUpdate)
      toast.success('Routine updated')
    } else {
      await routineStore.create(form.value as RoutineCreate)
      toast.success('Routine created')
    }
    savedSnapshot = JSON.stringify(form.value)
    emit('close')
  } catch {
    toast.error('Failed to save routine')
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!props.routine?.id) return
  try {
    await routineStore.remove(props.routine.id)
    toast.success('Routine deleted')
    confirmDelete.value = false
    emit('close')
  } catch {
    toast.error('Failed to delete routine')
  }
}
</script>

<template>
  <FullSizeDialog :open="open">
    <template #header>
      <input
        :value="form.name ?? ''"
        @input="onNameInput"
        type="text"
        placeholder="Routine name…"
        autofocus
        class="flex-1 text-lg font-semibold bg-transparent outline-none text-text-primary dark:text-white placeholder:text-text-secondary placeholder:font-normal"
      />
      <button
        type="button"
        class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary dark:text-white/60 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Close dialog"
        @click="requestClose"
      >
        <X class="w-5 h-5" />
      </button>
    </template>

    <!-- Body: flat exercise list or empty state -->
    <div class="relative h-full">
    <Transition name="fade" mode="out-in">

      <!-- Exercise list -->
      <div
        v-if="form.excercises.length"
        key="list"
        ref="listEl"
        class="flex flex-col gap-3 overflow-y-auto custom-scrollbar h-full p-4"
        @scroll="recomputeOffscreen"
      >

        <template v-for="(block, bi) in exerciseBlocks" :key="bi">

          <!-- ── Superset block ── -->
          <div
            v-if="block.type === 'superset'"
            :ref="(el) => setBlockEl(bi, el)"
            class="rounded-2xl border-2 p-1"
            :class="[
              SUPERSET_COLORS[getGroup(block.groupId)?.color ?? 'violet'].border,
              SUPERSET_COLORS[getGroup(block.groupId)?.color ?? 'violet'].bg,
            ]"
          >
            <!-- Superset header -->
            <button
              type="button"
              class="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              @click="editGroup(block.groupId)"
            >
              <span
                class="w-3 h-3 rounded-full flex-shrink-0"
                :class="SUPERSET_COLORS[getGroup(block.groupId)?.color ?? 'violet'].dot"
              />
              <span
                class="text-sm font-bold"
                :class="SUPERSET_COLORS[getGroup(block.groupId)?.color ?? 'violet'].headerText"
              >
                {{ getGroup(block.groupId)?.name ?? 'Superset' }}
              </span>
              <ChevronUp v-if="editingGroupId === block.groupId" class="w-4 h-4 ml-auto" :class="SUPERSET_COLORS[getGroup(block.groupId)?.color ?? 'violet'].headerText" />
              <ChevronDown v-else class="w-4 h-4 ml-auto" :class="SUPERSET_COLORS[getGroup(block.groupId)?.color ?? 'violet'].headerText" />
            </button>

            <!-- Group editor (name + color) -->
            <div v-if="editingGroupId === block.groupId" class="mx-3 mb-2 p-3 rounded-xl bg-white/70 dark:bg-black/20 flex flex-col gap-3">
              <input
                :value="getGroup(block.groupId)?.name ?? ''"
                @input="setGroupName(block.groupId, ($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="Group name (e.g. Chest / Back)…"
                class="w-full text-sm bg-transparent outline-none border-b border-gray-200 dark:border-white/10 pb-1 text-text-primary dark:text-white placeholder:text-text-secondary"
              />
              <div class="flex items-center gap-2">
                <span class="text-xs text-text-secondary font-medium">Color:</span>
                <button
                  v-for="color in COLOR_ORDER"
                  :key="color"
                  type="button"
                  class="w-5 h-5 rounded-full ring-2 ring-offset-1 transition-all"
                  :class="[
                    SUPERSET_COLORS[color].dot,
                    getGroup(block.groupId)?.color === color
                      ? 'ring-gray-600 dark:ring-white'
                      : 'ring-transparent',
                  ]"
                  @click="setGroupColor(block.groupId, color)"
                />
              </div>
            </div>

            <!-- Exercises in the superset -->
            <div class="flex flex-col gap-0.5">
              <div
                v-for="(exIdx, memberI) in block.exerciseIndices"
                :key="exIdx"
                class="rounded-xl bg-surface-card p-3 flex flex-col gap-3"
                :class="memberI < block.exerciseIndices.length - 1 ? 'mb-0.5' : ''"
              >
                <!-- Exercise header -->
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <span
                      class="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      :class="ACTIVITY_TYPE_BADGE[form.excercises[exIdx].activityType ?? 'weighted'].classes"
                    >
                      {{ ACTIVITY_TYPE_BADGE[form.excercises[exIdx].activityType ?? 'weighted'].label }}
                    </span>
                    <span class="text-sm font-semibold text-text-primary dark:text-white truncate">
                      {{ form.excercises[exIdx].name }}
                    </span>
                  </div>
                  <!-- ⋮ menu -->
                  <div class="relative flex-shrink-0">
                    <button
                      type="button"
                      class="p-1 rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-white/10 min-h-[32px] min-w-[32px] flex items-center justify-center"
                      @click.stop="openMenuFor = openMenuFor === exIdx ? null : exIdx"
                    >
                      <MoreVertical class="w-4 h-4" />
                    </button>
                    <div
                      v-if="openMenuFor === exIdx"
                      class="absolute right-0 top-8 z-50 w-44 rounded-xl bg-surface-card border border-gray-200 dark:border-white/10 shadow-lg py-1 text-sm"
                      @click.stop
                    >
                      <button
                        type="button"
                        class="w-full text-left px-3 py-2 text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white"
                        @click="removeFromSuperset(exIdx)"
                      >
                        Remove from superset
                      </button>
                      <button
                        type="button"
                        class="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        @click="removeExercise(exIdx); openMenuFor = null"
                      >
                        Remove exercise
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Sets -->
                <div class="flex flex-col gap-2">
                  <div
                    v-for="(set, setIdx) in form.excercises[exIdx].sets ?? []"
                    :key="setIdx"
                    class="flex items-center gap-2"
                  >
                    <span class="text-xs text-text-secondary w-6 text-center flex-shrink-0">{{ setIdx + 1 }}</span>
                    <EditSet
                      :set="set"
                      :activity-type="form.excercises[exIdx].activityType"
                      :activity-track-type="form.excercises[exIdx].activityTrackType"
                      class="flex-1"
                      @update:set="form.excercises[exIdx].sets![setIdx] = $event"
                    />
                    <button
                      type="button"
                      class="text-red-400 hover:text-red-600 text-lg leading-none p-1 focus-visible:ring-1 focus-visible:ring-primary rounded"
                      aria-label="Remove set"
                      @click="removeSet(exIdx, setIdx)"
                    >
                      ×
                    </button>
                  </div>
                  <div class="flex items-center gap-4 mt-1">
                    <button
                      type="button"
                      class="text-sm text-primary font-medium hover:underline focus-visible:ring-1 focus-visible:ring-primary rounded w-fit"
                      @click="addSet(exIdx)"
                    >
                      + Add set
                    </button>
                    <button
                      type="button"
                      class="text-sm text-primary font-medium hover:underline focus-visible:ring-1 focus-visible:ring-primary rounded w-fit"
                      @click="addSetsForExIdx = exIdx"
                    >
                      + Add sets…
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ── Normal or drop-set exercise block ── -->
          <div
            v-else
            :ref="(el) => setBlockEl(bi, el)"
            class="rounded-2xl bg-surface-card border border-gray-100 dark:border-white/5 p-3 flex flex-col gap-3"
            @click.self="openMenuFor = null"
          >
            <!-- Exercise header -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                  :class="ACTIVITY_TYPE_BADGE[form.excercises[block.exerciseIndex].activityType ?? 'weighted'].classes"
                >
                  {{ ACTIVITY_TYPE_BADGE[form.excercises[block.exerciseIndex].activityType ?? 'weighted'].label }}
                </span>
                <span class="text-sm font-semibold text-text-primary dark:text-white truncate">
                  {{ form.excercises[block.exerciseIndex].name }}
                </span>
                <span
                  v-if="form.excercises[block.exerciseIndex].dropConfig"
                  class="text-xs px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold flex-shrink-0"
                >
                  ↓ Drop
                </span>
              </div>
              <!-- ⋮ menu -->
              <div class="relative flex-shrink-0">
                <button
                  type="button"
                  class="p-1 rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-white/10 min-h-[32px] min-w-[32px] flex items-center justify-center"
                  @click.stop="openMenuFor = openMenuFor === block.exerciseIndex ? null : block.exerciseIndex"
                >
                  <MoreVertical class="w-4 h-4" />
                </button>
                <div
                  v-if="openMenuFor === block.exerciseIndex"
                  class="absolute right-0 top-8 z-50 w-48 rounded-xl bg-surface-card border border-gray-200 dark:border-white/10 shadow-lg py-1 text-sm"
                  @click.stop
                >
                  <!-- Superset actions (not available for drop sets) -->
                  <template v-if="!form.excercises[block.exerciseIndex].dropConfig">
                    <button
                      type="button"
                      class="w-full text-left px-3 py-2 text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white"
                      @click="addToSuperset(block.exerciseIndex)"
                    >
                      Add to superset
                    </button>
                  </template>
                  <!-- Drop set actions (not available if in superset) -->
                  <template v-if="!form.excercises[block.exerciseIndex].supersetGroupId">
                    <button
                      v-if="!form.excercises[block.exerciseIndex].dropConfig"
                      type="button"
                      class="w-full text-left px-3 py-2 text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white"
                      @click="openDropSetConfig(block.exerciseIndex)"
                    >
                      Convert to drop set
                    </button>
                    <button
                      v-else
                      type="button"
                      class="w-full text-left px-3 py-2 text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white"
                      @click="openDropSetConfig(block.exerciseIndex)"
                    >
                      Edit drop set
                    </button>
                    <button
                      v-if="form.excercises[block.exerciseIndex].dropConfig"
                      type="button"
                      class="w-full text-left px-3 py-2 text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 hover:text-text-primary dark:hover:text-white"
                      @click="removeDropConfig(block.exerciseIndex)"
                    >
                      Remove drop set
                    </button>
                  </template>
                  <button
                    type="button"
                    class="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    @click="removeExercise(block.exerciseIndex); openMenuFor = null"
                  >
                    Remove exercise
                  </button>
                </div>
              </div>
            </div>

            <!-- Drop set preview -->
            <div v-if="form.excercises[block.exerciseIndex].dropConfig" class="flex flex-col gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  v-for="(w, wi) in computedDropWeights(block.exerciseIndex)"
                  :key="wi"
                  class="text-sm font-semibold text-text-primary dark:text-white"
                >
                  {{ w }}kg<span v-if="wi < computedDropWeights(block.exerciseIndex).length - 1" class="text-text-secondary mx-1">→</span>
                </span>
              </div>
              <p class="text-xs text-text-secondary">
                {{ form.excercises[block.exerciseIndex].dropConfig!.count }} drops ·
                −{{ form.excercises[block.exerciseIndex].dropConfig!.weightDecreasePercent }}% per drop ·
                to failure each
              </p>
              <!-- Still allow editing the starting set weight -->
              <div class="flex items-center gap-2">
                <span class="text-xs text-text-secondary w-6 text-center flex-shrink-0">1</span>
                <EditSet
                  :set="form.excercises[block.exerciseIndex].sets?.[0] ?? { type: 'normal', reps: null, weight: null, duration: null, distance: null, note: null }"
                  :activity-type="form.excercises[block.exerciseIndex].activityType"
                  :activity-track-type="form.excercises[block.exerciseIndex].activityTrackType"
                  class="flex-1"
                  @update:set="form.excercises[block.exerciseIndex].sets = [$event]"
                />
              </div>
            </div>

            <!-- Normal sets -->
            <div v-else class="flex flex-col gap-2">
              <div
                v-for="(set, setIdx) in form.excercises[block.exerciseIndex].sets ?? []"
                :key="setIdx"
                class="flex items-center gap-2"
              >
                <span class="text-xs text-text-secondary w-6 text-center flex-shrink-0">{{ setIdx + 1 }}</span>
                <EditSet
                  :set="set"
                  :activity-type="form.excercises[block.exerciseIndex].activityType"
                  :activity-track-type="form.excercises[block.exerciseIndex].activityTrackType"
                  class="flex-1"
                  @update:set="form.excercises[block.exerciseIndex].sets![setIdx] = $event"
                />
                <button
                  type="button"
                  class="text-red-400 hover:text-red-600 text-lg leading-none p-1 focus-visible:ring-1 focus-visible:ring-primary rounded"
                  aria-label="Remove set"
                  @click="removeSet(block.exerciseIndex, setIdx)"
                >
                  ×
                </button>
              </div>
              <div class="flex items-center gap-4 mt-1">
                <button
                  type="button"
                  class="text-sm text-primary font-medium hover:underline focus-visible:ring-1 focus-visible:ring-primary rounded w-fit"
                  @click="addSet(block.exerciseIndex)"
                >
                  + Add set
                </button>
                <button
                  type="button"
                  class="text-sm text-primary font-medium hover:underline focus-visible:ring-1 focus-visible:ring-primary rounded w-fit"
                  @click="addSetsForExIdx = block.exerciseIndex"
                >
                  + Add sets…
                </button>
              </div>
            </div>
          </div>

        </template>

        <!-- Add exercise button -->
        <button
          type="button"
          class="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 text-sm text-primary font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
          @click="isExercisePickerOpen = true"
        >
          <Plus class="w-4 h-4" />
          Add exercise
        </button>
      </div>

      <!-- Empty state -->
      <div v-else key="empty" class="h-full flex flex-col items-center justify-center">
        <EmptyState
          :icon="Dumbbell"
          title="No exercises yet"
          description="Add your first exercise to get started"
          action-label="Add exercise"
          @action="isExercisePickerOpen = true"
        />
      </div>

    </Transition>

      <!-- Off-screen exercises indicator -->
      <div
        v-if="offscreenAbove.length || offscreenBelow.length"
        class="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5 pointer-events-none"
      >
        <div
          v-if="offscreenAbove.length"
          class="pointer-events-auto max-w-[220px] px-2.5 py-1.5 rounded-full bg-gray-900/85 dark:bg-black/70 text-white text-[11px] font-medium shadow-lg backdrop-blur-sm truncate"
          :title="offscreenAbove.join(', ')"
        >
          ↑ {{ offscreenAbove.length }} above · {{ summarize(offscreenAbove) }}
        </div>
        <div
          v-if="offscreenBelow.length"
          class="pointer-events-auto max-w-[220px] px-2.5 py-1.5 rounded-full bg-gray-900/85 dark:bg-black/70 text-white text-[11px] font-medium shadow-lg backdrop-blur-sm truncate"
          :title="offscreenBelow.join(', ')"
        >
          ↓ {{ offscreenBelow.length }} below · {{ summarize(offscreenBelow) }}
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center gap-2">
        <BaseButton v-if="routine" variant="danger" @click="confirmDelete = true">Delete</BaseButton>
        <BaseButton v-if="!routine" variant="ghost" @click="isDefaultWorkoutPickerOpen = true">Use default workout</BaseButton>
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="requestClose">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">{{ routine ? 'Save' : 'Create' }}</BaseButton>
      </div>
    </template>
  </FullSizeDialog>

  <!-- Dialogs -->
  <ConfirmDialog
    :open="confirmDelete"
    title="Delete Routine"
    message="Are you sure you want to delete this routine?"
    confirm-label="Delete"
    variant="danger"
    @confirm="doDelete"
    @cancel="confirmDelete = false"
  />

  <ConfirmDialog
    :open="confirmDiscard"
    title="Discard changes?"
    message="You have unsaved changes. Leave anyway and lose them?"
    confirm-label="Discard"
    variant="danger"
    @confirm="confirmDiscard = false; emit('close')"
    @cancel="confirmDiscard = false"
  />

  <ExercisePickerDialog
    :open="isExercisePickerOpen"
    @close="isExercisePickerOpen = false"
    @select="onExercisePicked"
  />

  <AddSetsDialog
    v-if="addSetsForExIdx !== null"
    :open="addSetsForExIdx !== null"
    :base-set="form.excercises[addSetsForExIdx].sets?.at(-1) ?? { type: 'normal', reps: 10, weight: null, duration: null, distance: null, note: null }"
    :activity-type="form.excercises[addSetsForExIdx].activityType"
    :activity-track-type="form.excercises[addSetsForExIdx].activityTrackType"
    @add="onSetsAdded"
    @close="addSetsForExIdx = null"
  />

  <DefaultWorkoutPickerDialog
    :open="isDefaultWorkoutPickerOpen"
    @close="isDefaultWorkoutPickerOpen = false"
    @select="onDefaultWorkoutSelected"
  />

  <!-- Superset picker (choose an existing superset or create a new one) -->
  <Teleport to="body">
    <div
      v-if="supersetPickerFor !== null"
      class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40"
      @click.self="supersetPickerFor = null"
    >
      <div class="w-full max-w-sm bg-surface-card rounded-t-2xl sm:rounded-2xl p-4 flex flex-col gap-2 shadow-xl">
        <p class="text-sm font-bold text-text-primary dark:text-white px-1 pb-1">Add to superset</p>
        <button
          v-for="group in form.supersetGroups"
          :key="group.id"
          type="button"
          class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          @click="joinSuperset(supersetPickerFor!, group.id); supersetPickerFor = null"
        >
          <span class="w-4 h-4 rounded-full flex-shrink-0" :class="SUPERSET_COLORS[group.color].dot" />
          <span class="text-sm font-medium text-text-primary dark:text-white">{{ group.name ?? 'Superset' }}</span>
        </button>
        <p v-if="form.supersetGroups.length === 0" class="text-xs text-text-secondary px-1 pb-1">
          No supersets yet in this routine.
        </p>
        <button
          type="button"
          class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          @click="createNewSuperset(supersetPickerFor!); supersetPickerFor = null"
        >
          <Plus class="w-4 h-4 text-primary" />
          <span class="text-sm font-medium text-primary">New superset</span>
        </button>
        <button
          type="button"
          class="mt-1 w-full py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-sm font-medium text-text-secondary"
          @click="supersetPickerFor = null"
        >
          Cancel
        </button>
      </div>
    </div>
  </Teleport>

  <!-- Drop set config dialog -->
  <div
    v-if="dropConfigFor !== null"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
    @click.self="dropConfigFor = null"
  >
    <div class="w-full max-w-sm bg-surface-card rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-5 shadow-xl">
      <p class="text-base font-bold text-text-primary dark:text-white">
        {{ form.excercises[dropConfigFor]?.dropConfig ? 'Edit drop set' : 'Convert to drop set' }}
      </p>

      <!-- Number of drops -->
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-text-primary dark:text-white">Total sets</p>
          <p class="text-xs text-text-secondary">Including the starting set</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-lg font-bold text-text-primary dark:text-white disabled:opacity-30"
            :disabled="dropConfigCount <= 2"
            @click="dropConfigCount--"
          >−</button>
          <span class="w-6 text-center font-bold text-text-primary dark:text-white">{{ dropConfigCount }}</span>
          <button
            type="button"
            class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-lg font-bold text-text-primary dark:text-white disabled:opacity-30"
            :disabled="dropConfigCount >= 6"
            @click="dropConfigCount++"
          >+</button>
        </div>
      </div>

      <!-- Weight decrease % -->
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-text-primary dark:text-white">Weight decrease</p>
          <p class="text-xs text-text-secondary">Per drop</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-lg font-bold text-text-primary dark:text-white disabled:opacity-30"
            :disabled="dropConfigPct <= 5"
            @click="dropConfigPct -= 5"
          >−</button>
          <span class="w-10 text-center font-bold text-text-primary dark:text-white">{{ dropConfigPct }}%</span>
          <button
            type="button"
            class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-lg font-bold text-text-primary dark:text-white disabled:opacity-30"
            :disabled="dropConfigPct >= 50"
            @click="dropConfigPct += 5"
          >+</button>
        </div>
      </div>

      <!-- Preview -->
      <div v-if="form.excercises[dropConfigFor]?.sets?.[0]?.weight" class="p-3 rounded-xl bg-surface-elevated text-sm text-text-secondary">
        Preview:
        <span v-for="(w, wi) in (() => {
          const start = form.excercises[dropConfigFor!]?.sets?.[0]?.weight ?? 0
          const weights = [start]
          for (let i = 1; i < dropConfigCount; i++) weights.push(Math.round(weights[i-1] * (1 - dropConfigPct/100) * 2)/2)
          return weights
        })()" :key="wi" class="font-semibold text-text-primary dark:text-white">
          {{ w }}kg<span v-if="wi < dropConfigCount - 1" class="text-text-secondary mx-1 font-normal">→</span>
        </span>
      </div>

      <div class="flex gap-2">
        <BaseButton variant="ghost" class="flex-1" @click="dropConfigFor = null">Cancel</BaseButton>
        <BaseButton variant="primary" class="flex-1" @click="applyDropConfig">Apply</BaseButton>
      </div>
    </div>
  </div>

</template>
