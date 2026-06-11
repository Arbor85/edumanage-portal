<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { usePageTitle } from '../../../composables/usePageTitle'
import type { EquipmentOut, EquipmentCreate, EquipmentUpdate, EquipmentType } from '../../../types'
import { useEquipmentStore } from '../../../stores/equipmentStore'
import { useToast } from '../../../composables/useToast'
import BaseModal from '../../../components/BaseModal.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseSelect from '../../../components/BaseSelect.vue'
import BaseButton from '../../../components/BaseButton.vue'
import ConfirmDialog from '../../../components/ConfirmDialog.vue'
import { X, Plus, ShieldCheck } from 'lucide-vue-next'

const EQUIPMENT_TYPE_OPTIONS = [
  { value: 'bodyweight', label: 'Bodyweight – no added load' },
  { value: 'weight', label: 'Weight – free weights, plates, dumbbells' },
]

const props = defineProps<{
  open: boolean
  equipment: EquipmentOut | null
}>()
const emit = defineEmits<{ close: [] }>()

usePageTitle(() => props.equipment ? 'Edit Equipment' : 'New Equipment', () => props.open)

const store = useEquipmentStore()
const toast = useToast()

const form = ref<{ name: string | null; equipmentType: EquipmentType; weightOptions: number[] }>({
  name: null, equipmentType: 'bodyweight', weightOptions: [],
})
const weightInput = ref('')
const saving = ref(false)
const confirmDelete = ref(false)
const weightInputError = ref('')

const isCore = computed(() => props.equipment?.isCore ?? false)

watch(() => props.open, (val) => {
  if (val) {
    weightInput.value = ''
    weightInputError.value = ''
    form.value = props.equipment
      ? {
          name: props.equipment.name,
          equipmentType: props.equipment.equipmentType ?? 'bodyweight',
          weightOptions: [...(props.equipment.weightOptions ?? [])],
        }
      : { name: null, equipmentType: 'bodyweight', weightOptions: [] }
  }
})

function addWeight() {
  const v = parseFloat(weightInput.value)
  if (isNaN(v) || v <= 0) { weightInputError.value = 'Enter a positive number'; return }
  if (form.value.weightOptions.includes(v)) { weightInputError.value = 'Already added'; return }
  form.value.weightOptions = [...form.value.weightOptions, v].sort((a, b) => a - b)
  weightInput.value = ''
  weightInputError.value = ''
}

function removeWeight(w: number) {
  form.value.weightOptions = form.value.weightOptions.filter((x) => x !== w)
}

function onWeightKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); addWeight() }
}

const payload = computed((): EquipmentCreate | EquipmentUpdate => ({
  name: form.value.name,
  equipmentType: form.value.equipmentType,
  weightOptions: form.value.equipmentType === 'weight' ? form.value.weightOptions : null,
}))

async function save() {
  saving.value = true
  try {
    if (props.equipment) {
      await store.update(props.equipment.id, payload.value as EquipmentUpdate)
      toast.success('Equipment updated')
    } else {
      await store.create(payload.value as EquipmentCreate)
      toast.success('Equipment created')
    }
    emit('close')
  } catch {
    toast.error('Failed to save equipment')
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!props.equipment) return
  try {
    await store.remove(props.equipment.id)
    toast.success('Equipment deleted')
    confirmDelete.value = false
    emit('close')
  } catch {
    toast.error('Failed to delete equipment')
  }
}
</script>

<template>
  <BaseModal :open="open" :title="equipment ? 'Edit Equipment' : 'New Equipment'" size="md" @close="emit('close')">
    <div v-if="isCore" class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm mb-4">
      <ShieldCheck class="w-4 h-4 flex-shrink-0" />
      <span>Core equipment — name and type are managed by the system and cannot be changed.</span>
    </div>

    <form class="flex flex-col gap-4" @submit.prevent="save">
      <BaseInput v-model="form.name" label="Name" placeholder="e.g. Barbell, Dumbbell, Pull-up Bar" :disabled="isCore" />

      <BaseSelect
        :model-value="form.equipmentType"
        label="Type"
        :options="EQUIPMENT_TYPE_OPTIONS"
        :disabled="isCore"
        @update:model-value="form.equipmentType = $event as EquipmentType"
      />

      <div v-if="form.equipmentType === 'weight'" class="flex flex-col gap-2">
        <label class="text-sm font-medium text-text-primary dark:text-white">
          Weight Options <span class="text-text-secondary font-normal">(kg)</span>
        </label>

        <div class="flex gap-2">
          <input
            v-model="weightInput"
            type="number"
            step="0.5"
            min="0.5"
            placeholder="e.g. 20"
            class="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-sm text-text-primary dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
            @keydown="onWeightKeydown"
          />
          <BaseButton type="button" variant="secondary" size="sm" @click="addWeight">
            <Plus class="w-4 h-4" />
            Add
          </BaseButton>
        </div>
        <p v-if="weightInputError" class="text-xs text-red-500">{{ weightInputError }}</p>

        <div v-if="form.weightOptions.length" class="flex flex-wrap gap-2">
          <span
            v-for="w in form.weightOptions"
            :key="w"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-sm text-text-primary dark:text-white"
          >
            {{ w }} kg
            <button type="button" class="hover:text-red-500 transition-colors" @click="removeWeight(w)">
              <X class="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
        <p v-else class="text-sm text-text-secondary">No weight options added yet.</p>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center gap-2">
        <BaseButton v-if="equipment" variant="danger" @click="confirmDelete = true">Delete</BaseButton>
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">{{ equipment ? 'Save' : 'Create' }}</BaseButton>
      </div>
    </template>
  </BaseModal>

  <ConfirmDialog
    :open="confirmDelete"
    title="Delete Equipment"
    message="Are you sure you want to delete this equipment? This action cannot be undone."
    confirm-label="Delete"
    variant="danger"
    @confirm="doDelete"
    @cancel="confirmDelete = false"
  />
</template>
