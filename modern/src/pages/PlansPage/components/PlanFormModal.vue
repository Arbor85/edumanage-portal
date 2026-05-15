<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PlanOut, PlanCreate, PlanUpdate, PlanWorkoutInput, RoutineExcercise } from '../../../types'
import { usePlanStore } from '../../../stores/planStore'
import { useRoutineStore } from '../../../stores/routineStore'
import { useToast } from '../../../composables/useToast'
import BaseModal from '../../../components/BaseModal.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseTextarea from '../../../components/BaseTextarea.vue'
import BaseSelect from '../../../components/BaseSelect.vue'
import BaseButton from '../../../components/BaseButton.vue'
import SelectClient from '../../../components/SelectClient/index.vue'
import SelectRoutine from '../../../components/SelectRoutine/index.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'

const props = defineProps<{ open: boolean; plan: PlanOut | null }>()
const emit = defineEmits<{ close: [] }>()

const planStore = usePlanStore()
const routineStore = useRoutineStore()
const toast = useToast()

const form = ref<{ name: string | null; clientId: string | null; note: string | null; status: string | null; workouts: PlanWorkoutInput[] }>({
  name: null, clientId: null, note: null, status: 'draft', workouts: []
})
const saving = ref(false)
const confirmDelete = ref(false)
const addRoutineId = ref<string | null>(null)

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

watch(() => props.open, (val) => {
  if (val) {
    if (props.plan) {
      form.value = {
        name: props.plan.name,
        clientId: props.plan.clientId,
        note: props.plan.note,
        status: props.plan.status,
        workouts: (props.plan.workouts ?? []).map((w) => ({
          id: w.id, name: w.name, note: w.note, user_id: w.userId, excercises: w.excercises, date: w.date
        }))
      }
    } else {
      form.value = { name: null, clientId: null, note: null, status: 'draft', workouts: [] }
    }
    addRoutineId.value = null
  }
})

function addFromRoutine() {
  const routine = routineStore.routines.find((r) => r.id === addRoutineId.value)
  if (!routine) return
  form.value.workouts.push({
    id: null, name: routine.name, note: routine.note, user_id: null,
    excercises: routine.excercises as RoutineExcercise[], date: null
  })
  addRoutineId.value = null
}

function removeWorkout(i: number) { form.value.workouts.splice(i, 1) }

async function save() {
  saving.value = true
  try {
    if (props.plan?.id) {
      await planStore.update(props.plan.id, form.value as PlanUpdate)
      // Update status if changed
      if (form.value.status && form.value.status !== props.plan.status) {
        await planStore.updateStatus(props.plan.id, form.value.status)
      }
      toast.success('Plan updated')
    } else {
      await planStore.create(form.value as PlanCreate)
      toast.success('Plan created')
    }
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
  <BaseModal :open="open" :title="plan ? 'Edit Plan' : 'New Plan'" size="lg" @close="emit('close')">
    <form class="flex flex-col gap-4" @submit.prevent="save">
      <BaseInput v-model="form.name" label="Name" placeholder="Plan name" />
      <BaseTextarea v-model="form.note" label="Notes" :rows="2" />
      <SelectClient v-model="form.clientId" label="Client" />
      <BaseSelect v-model="form.status" label="Status" :options="statusOptions" />

      <!-- Workouts -->
      <div class="flex flex-col gap-3">
        <p class="text-sm font-semibold text-text-primary dark:text-white">Workouts</p>

        <div
          v-for="(w, i) in form.workouts"
          :key="i"
          class="border border-gray-200 dark:border-white/10 rounded-xl p-3 flex flex-col gap-2"
        >
          <div class="flex items-center gap-2">
            <BaseInput :model-value="w.name" class="flex-1" placeholder="Workout name" @update:model-value="w.name = $event as string" />
            <button type="button" class="text-red-500 text-sm hover:underline flex-shrink-0" @click="removeWorkout(i)">Remove</button>
          </div>
          <BaseInput :model-value="w.date" type="date" @update:model-value="w.date = $event as string" />
          <p v-if="w.excercises?.length" class="text-xs text-text-secondary">{{ w.excercises.length }} exercises</p>
        </div>

        <div class="flex gap-2 items-end">
          <div class="flex-1">
            <SelectRoutine v-model="addRoutineId" label="Add from Routine" />
          </div>
          <BaseButton size="sm" variant="secondary" :disabled="!addRoutineId" @click="addFromRoutine">Add</BaseButton>
          <BaseButton size="sm" variant="ghost" @click="form.workouts.push({ id: null, name: null, note: null, user_id: null, excercises: [], date: null })">+ Blank</BaseButton>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center gap-2">
        <BaseButton v-if="plan" variant="danger" @click="confirmDelete = true">Delete</BaseButton>
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">{{ plan ? 'Save' : 'Create' }}</BaseButton>
      </div>
    </template>
  </BaseModal>

  <ConfirmDialog
    :open="confirmDelete"
    title="Delete Plan"
    message="Delete this plan?"
    confirm-label="Delete"
    variant="danger"
    @confirm="doDelete"
    @cancel="confirmDelete = false"
  />
</template>
