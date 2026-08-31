<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '../../../../components/BaseModal.vue'
import BaseInput from '../../../../components/BaseInput.vue'
import BaseButton from '../../../../components/BaseButton.vue'
import type { BuildingOut, BuildingCreate } from '../../../../types'

const props = defineProps<{
  open: boolean
  building: BuildingOut | null
}>()
const emit = defineEmits<{ close: [] }>()

const form = ref<BuildingCreate>({ name: '', address: '', capacity: 0 })

watch(() => props.open, (val) => {
  if (val) {
    form.value = props.building
      ? { name: props.building.name, address: props.building.address, capacity: props.building.capacity }
      : { name: '', address: '', capacity: 0 }
  }
})

import { useSchedulePlanStore } from '../../../../stores/schedulePlanStore'
import { useToast } from '../../../../composables/useToast'

const store = useSchedulePlanStore()
const toast = useToast()
const saving = ref(false)

async function save() {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    if (props.building) {
      await store.updateBuilding(props.building.id, { ...form.value })
      toast.success('Building updated')
    } else {
      await store.addBuilding({ ...form.value })
      toast.success('Building created')
    }
    emit('close')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="building ? 'Edit Building' : 'New Building'"
    size="sm"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <BaseInput v-model="form.name" label="Name" placeholder="e.g. Main Hall" />
      <BaseInput v-model="form.address" label="Address" placeholder="e.g. 123 Main St" />
      <BaseInput v-model="form.capacity" label="Capacity" type="number" placeholder="0" />
    </div>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" @click="save">
          {{ building ? 'Save Changes' : 'Create Building' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
