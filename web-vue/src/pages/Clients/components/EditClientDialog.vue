<template>
  <FormDialog
    :open="open"
    title="Edit client"
    save-label="Save"
    :save-disabled="!canSave"
    @cancel="handleCancel"
    @submit="handleSubmit"
  >
    <!-- Name -->
    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
      <input
        v-model="name"
        type="text"
        placeholder="Client name"
        class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
    </div>

    <!-- Tags -->
    <div>
      <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Tags</label>
      <div class="flex flex-col gap-3">
        <div v-for="group in tagGroups" :key="group.name">
          <p class="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">{{ group.name }}</p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="tag in group.tags"
              :key="tag"
              type="button"
              @click="toggleTag(tag)"
              class="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
              :class="selectedTags.includes(tag)
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
      {{ errorMessage }}
    </p>
  </FormDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import FormDialog from '../../../components/FormDialog.vue'
import { useClientsApi } from '../../../services/clientsApi'
import type { Client, ClientTag, ClientStatus } from '../../../types/client'

const props = defineProps<{
  open: boolean
  client: Client
}>()

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'saved', client: Client): void
}>()

const clientsApi = useClientsApi()

const tagGroups: Array<{ name: string; tags: ClientTag[] }> = [
  { name: 'Session Type', tags: ['Online', 'Inperson', 'Group'] },
  { name: 'Gender', tags: ['Female', 'Male'] },
  { name: 'Training', tags: ['Gym', 'CrossFit', 'Mix'] },
]

const name = ref('')
const status = ref<ClientStatus>('Active')
const selectedTags = ref<ClientTag[]>([])
const errorMessage = ref('')
const isSaving = ref(false)

const canSave = computed(() => name.value.trim().length > 0 && !isSaving.value)

watch(
  () => [props.open, props.client] as const,
  () => {
    if (props.open && props.client) {
      name.value = props.client.name
      status.value = props.client.status
      selectedTags.value = [...props.client.tags]
      errorMessage.value = ''
      isSaving.value = false
    }
  },
  { immediate: true },
)

const toggleTag = (tag: ClientTag) => {
  const group = tagGroups.find((g) => g.tags.includes(tag))
  if (!group) return

  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag)
    return
  }

  const fromOtherGroups = selectedTags.value.filter((t) => !group.tags.includes(t))

  if (tag === 'Group') {
    const genderTags = tagGroups.find((g) => g.name === 'Gender')?.tags ?? []
    selectedTags.value = [...fromOtherGroups.filter((t) => !genderTags.includes(t)), tag]
  } else {
    selectedTags.value = [...fromOtherGroups, tag]
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  isSaving.value = true
  try {
    const updated = await clientsApi.editClient(props.client.invitationCode, {
      ...props.client,
      name: name.value.trim(),
      status: status.value,
      tags: [...selectedTags.value],
    })
    emit('saved', updated)
  } catch {
    errorMessage.value = 'Failed to save changes. Please try again.'
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>
