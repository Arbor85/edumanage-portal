<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PlanOut, PlanCreate, PlanUpdate, PlanWorkoutInput, RoutineOut, ClientOut, RoutineExcercise } from '../../../types'
import { usePlanStore } from '../../../stores/planStore'
import { useClientStore } from '../../../stores/clientStore'
import { useToast } from '../../../composables/useToast'
import FullSizeDialog from '../../../components/FullSizeDialog/index.vue'
import ProcessWizard from '../../../components/ProcessWizard/index.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import BaseButton from '../../../components/BaseButton.vue'
import BaseAvatar from '../../../components/BaseAvatar.vue'
import BaseDatePicker from '../../../components/BaseDatePicker.vue'
import EmptyState from '../../../components/EmptyState.vue'
import ClientPickerDialog from '../../../components/ClientPickerDialog/index.vue'
import RoutinePickerDialog from '../../../components/RoutinePickerDialog/index.vue'
import { X, Plus, CalendarDays } from 'lucide-vue-next'

const props = defineProps<{ open: boolean; plan: PlanOut | null }>()
const emit = defineEmits<{ close: [] }>()

const planStore = usePlanStore()
const clientStore = useClientStore()
const toast = useToast()

const form = ref<{
  name: string | null
  clientId: string | null
  note: string | null
  status: string | null
  workouts: PlanWorkoutInput[]
}>({ name: null, clientId: null, note: null, status: 'draft', workouts: [] })

const saving = ref(false)
const confirmDelete = ref(false)
const confirmDiscard = ref(false)
const activeWorkoutIndex = ref(0)
const isClientPickerOpen = ref(false)
const isRoutinePickerOpen = ref(false)
const nameIsAuto = ref(false)

let savedSnapshot = ''

const isDirty = computed(() => JSON.stringify(form.value) !== savedSnapshot)

const STATUS_CYCLE = ['draft', 'active', 'inactive']
const STATUS_META: Record<string, { label: string; classes: string }> = {
  draft:    { label: 'Draft',    classes: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60' },
  active:   { label: 'Active',   classes: 'bg-primary/10 text-primary' },
  inactive: { label: 'Inactive', classes: 'bg-red-50 dark:bg-red-500/10 text-red-500' },
}

const statusMeta = computed(() => STATUS_META[form.value.status ?? 'draft'] ?? STATUS_META.draft)
const selectedClient = computed(() =>
  clientStore.clients.find((c) => c.invitationCode === form.value.clientId) ?? null,
)
const wizardSteps = computed(() =>
  form.value.workouts.map((w, i) => ({ id: i, label: w.name ?? 'New workout' })),
)

watch(
  () => form.value.workouts.map((w) => w.name),
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

function cycleStatus() {
  const idx = STATUS_CYCLE.indexOf(form.value.status ?? 'draft')
  form.value.status = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

watch(() => props.open, (val) => {
  if (!val) return
  if (props.plan) {
    form.value = {
      name: props.plan.name,
      clientId: props.plan.clientId,
      note: props.plan.note,
      status: props.plan.status,
      workouts: (props.plan.workouts ?? []).map((w) => ({
        id: w.id, name: w.name, note: w.note, user_id: w.userId,
        excercises: w.excercises, date: w.date,
      })),
    }
    nameIsAuto.value = false
  } else {
    form.value = { name: null, clientId: null, note: null, status: 'draft', workouts: [] }
    nameIsAuto.value = true
  }
  activeWorkoutIndex.value = 0
  savedSnapshot = JSON.stringify(form.value)
  if (!clientStore.clients.length) clientStore.fetch()
})

function requestClose() {
  if (isDirty.value) {
    confirmDiscard.value = true
  } else {
    emit('close')
  }
}

function onClientPicked(client: ClientOut) {
  form.value.clientId = client.invitationCode
}

function onRoutinePicked(routine: RoutineOut) {
  form.value.workouts.push({
    id: null,
    name: routine.name,
    note: routine.note,
    user_id: null,
    excercises: routine.excercises as RoutineExcercise[],
    date: null,
  })
  activeWorkoutIndex.value = form.value.workouts.length - 1
}

function addBlankWorkout() {
  form.value.workouts.push({ id: null, name: null, note: null, user_id: null, excercises: [], date: null })
  activeWorkoutIndex.value = form.value.workouts.length - 1
}

function removeWorkout(i: number) {
  form.value.workouts.splice(i, 1)
  if (activeWorkoutIndex.value >= form.value.workouts.length) {
    activeWorkoutIndex.value = Math.max(0, form.value.workouts.length - 1)
  }
}

async function save() {
  saving.value = true
  try {
    if (props.plan?.id) {
      await planStore.update(props.plan.id, form.value as PlanUpdate)
      if (form.value.status && form.value.status !== props.plan.status) {
        await planStore.updateStatus(props.plan.id, form.value.status)
      }
      toast.success('Plan updated')
    } else {
      await planStore.create(form.value as PlanCreate)
      toast.success('Plan created')
    }
    savedSnapshot = JSON.stringify(form.value)
    emit('close')
  } catch {
    toast.error('Failed to save plan')
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!props.plan?.id) return
  try {
    await planStore.remove(props.plan.id)
    toast.success('Plan deleted')
    confirmDelete.value = false
    emit('close')
  } catch {
    toast.error('Failed to delete plan')
  }
}
</script>

<template>
  <FullSizeDialog :open="open">
    <template #header>
      <input
        :value="form.name ?? ''"
        type="text"
        placeholder="Plan name…"
        autofocus
        class="flex-1 min-w-0 text-lg font-semibold bg-transparent outline-none text-text-primary dark:text-white placeholder:text-text-secondary placeholder:font-normal"
        @input="onNameInput"
      />

      <!-- Client picker -->
      <button
        type="button"
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm text-text-secondary dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary transition-colors flex-shrink-0"
        @click="isClientPickerOpen = true"
      >
        <BaseAvatar v-if="selectedClient" :name="selectedClient.name ?? '?'" size="xs" />
        <span class="max-w-[120px] truncate">{{ selectedClient?.name ?? 'No client' }}</span>
      </button>

      <!-- Status badge — click to cycle -->
      <button
        type="button"
        :class="['px-2.5 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-colors focus-visible:ring-2 focus-visible:ring-primary', statusMeta.classes]"
        @click="cycleStatus"
      >
        {{ statusMeta.label }}
      </button>

      <!-- Close -->
      <button
        type="button"
        class="p-1.5 rounded-lg text-text-secondary hover:text-text-primary dark:text-white/60 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Close dialog"
        @click="requestClose"
      >
        <X class="w-5 h-5" />
      </button>
    </template>

    <!-- Wizard -->
    <ProcessWizard
      v-if="form.workouts.length"
      v-model="activeWorkoutIndex"
      :steps="wizardSteps"
      class="h-full"
    >
      <template #add-step>
        <div class="flex flex-col gap-1">
          <button
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-primary font-medium hover:bg-primary/10 transition-colors"
            @click="isRoutinePickerOpen = true"
          >
            <Plus class="w-4 h-4" />
            From routine
          </button>
          <button
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-secondary dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            @click="addBlankWorkout"
          >
            <Plus class="w-4 h-4" />
            Blank workout
          </button>
        </div>
      </template>

      <template #step-content="{ index }">
        <div v-if="form.workouts[index]" class="flex flex-col gap-5">
          <!-- Workout name + remove -->
          <div class="flex items-center justify-between gap-3">
            <input
              :value="form.workouts[index].name ?? ''"
              type="text"
              placeholder="Workout name…"
              class="flex-1 text-lg font-semibold bg-transparent outline-none text-text-primary dark:text-white placeholder:text-text-secondary placeholder:font-normal"
              @input="form.workouts[index].name = ($event.target as HTMLInputElement).value || null"
            />
            <button
              type="button"
              class="text-sm text-red-500 hover:text-red-600 font-medium focus-visible:ring-1 focus-visible:ring-primary rounded flex-shrink-0"
              @click="removeWorkout(index)"
            >
              Remove
            </button>
          </div>

          <!-- Date -->
          <BaseDatePicker
            :model-value="form.workouts[index].date"
            label="Date"
            @update:model-value="form.workouts[index].date = $event"
          />

          <!-- Note -->
          <div class="flex flex-col gap-1.5">
            <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">Note</p>
            <textarea
              :value="form.workouts[index].note ?? ''"
              rows="2"
              placeholder="Optional note…"
              class="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm bg-white dark:bg-surface-dark text-text-primary dark:text-white placeholder:text-text-secondary outline-none resize-none focus-visible:ring-2 focus-visible:ring-primary"
              @input="form.workouts[index].note = ($event.target as HTMLTextAreaElement).value || null"
            />
          </div>

          <!-- Exercises (read-only) -->
          <div v-if="form.workouts[index].excercises?.length" class="flex flex-col gap-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Exercises ({{ form.workouts[index].excercises!.length }})
            </p>
            <ul class="flex flex-col gap-1">
              <li
                v-for="(ex, ei) in form.workouts[index].excercises"
                :key="ei"
                class="flex items-center gap-2 text-sm py-1"
              >
                <span class="text-text-secondary w-5 flex-shrink-0 text-right">{{ ei + 1 }}.</span>
                <span class="flex-1 truncate text-text-primary dark:text-white">{{ ex.name }}</span>
                <span class="text-xs text-text-secondary flex-shrink-0">{{ ex.sets?.length ?? 0 }} sets</span>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </ProcessWizard>

    <!-- Empty state -->
    <div v-else class="h-full flex flex-col items-center justify-center gap-2">
      <EmptyState
        :icon="CalendarDays"
        title="No workouts yet"
        description="Add a workout from a routine or start blank"
        action-label="From routine"
        @action="isRoutinePickerOpen = true"
      />
      <button
        type="button"
        class="text-sm text-text-secondary hover:text-text-primary dark:hover:text-white transition-colors"
        @click="addBlankWorkout"
      >
        or add a blank workout
      </button>
    </div>

    <template #footer>
      <div class="flex items-center gap-2">
        <BaseButton v-if="plan" variant="danger" @click="confirmDelete = true">Delete</BaseButton>
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="requestClose">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">{{ plan ? 'Save' : 'Create' }}</BaseButton>
      </div>
    </template>
  </FullSizeDialog>

  <ConfirmDialog
    :open="confirmDelete"
    title="Delete Plan"
    message="Are you sure you want to delete this plan?"
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

  <ClientPickerDialog
    :open="isClientPickerOpen"
    @select="onClientPicked"
    @close="isClientPickerOpen = false"
  />

  <RoutinePickerDialog
    :open="isRoutinePickerOpen"
    @select="onRoutinePicked"
    @close="isRoutinePickerOpen = false"
  />
</template>
