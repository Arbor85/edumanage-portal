<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from '../../../../components/BaseModal.vue'
import BaseInput from '../../../../components/BaseInput.vue'
import BaseButton from '../../../../components/BaseButton.vue'
import { useSchedulePlanStore } from '../../../../stores/schedulePlanStore'
import { useToast } from '../../../../composables/useToast'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const store = useSchedulePlanStore()
const router = useRouter()
const toast = useToast()

const name = ref('')
const creating = ref(false)

watch(() => props.open, (val) => { if (val) name.value = '' })

async function create() {
  if (!name.value.trim()) return
  creating.value = true
  try {
    const plan = await store.createPlan({ name: name.value.trim() })
    toast.success('Plan created')
    emit('close')
    router.push(`/organizer/schedule-plans/${plan.id}`)
  } catch {
    toast.error('Failed to create plan')
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <BaseModal :open="open" title="New Schedule Plan" size="sm" @close="emit('close')">
    <BaseInput v-model="name" label="Plan name" placeholder="e.g. Summer 2026" @keyup.enter="create" />

    <template #footer>
      <div class="flex gap-3 justify-end">
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="creating" @click="create">Create Plan</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
