<template>
  <FormDialog :open="open" :title="dialogTitle" :save-label="saveLabel" :save-disabled="!canSave" @cancel="handleCancel" @submit="handleSubmit">
    <!-- Success: show invitation URL -->
    <template v-if="invitationUrl">
      <p class="text-sm text-slate-700 dark:text-slate-200">
        Invitation created for <strong>{{ createdName }}</strong>. Share the link below:
      </p>
      <div class="flex items-center gap-2">
        <input
          :value="invitationUrl"
          readonly
          class="flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="button"
          @click="copyUrl"
          class="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
        >
          <Check v-if="copied" :size="14" class="text-emerald-500" />
          <Copy v-else :size="14" />
          {{ copied ? 'Copied' : 'Copy' }}
        </button>
      </div>
    </template>

    <!-- Form: create new invitation -->
    <template v-else>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Name</label>
        <input
          v-model="name"
          type="text"
          placeholder="Client name"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

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
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import FormDialog from '../../../components/FormDialog.vue'
import { useClientsApi } from '../../../services/clientsApi'
import type { Client, ClientTag } from '../../.FormDialclient'

const props = withDefaults(
  defineProps<{
    open: boolean
    client?: Client | null
  }>(),
  {
    client: null,
  },
)

const emit = defineEmits<{
  (event: 'cancel'): void
  (event: 'invited', client: Client): void
}>()

const clientsApi = useClientsApi()

const tagGroups: Array<{ name: string; tags: ClientTag[] }> = [
  { name: 'Session Type', tags: ['Online', 'Inperson', 'Group'] },
  { name: 'Gender', tags: ['Female', 'Male'] },
  { name: 'Training', tags: ['Gym', 'CrossFit', 'Mix'] },
]

const defaultTags: ClientTag[] = ['Inperson', 'Gym']

const name = ref('')
const selectedTags = ref<ClientTag[]>([...defaultTags])
const invitationUrl = ref('')
const createdName = ref('')
const copied = ref(false)
const errorMessage = ref('')
const isSaving = ref(false)

const isReInvite = computed(() => !!props.client)

const dialogTitle = computed(() => (isReInvite.value ? 'Client invitation' : 'Invite client'))
const saveLabel = computed(() => {
  if (invitationUrl.value) return 'Done'
  if (isSaving.value) return 'Creating...'
  return isReInvite.value ? 'Regenerate link' : 'Create invitation'
})
const canSave = computed(() => invitationUrl.value !== '' || (name.value.trim().length > 0 && !isSaving.value))

const reset = () => {
  name.value = ''
  selectedTags.value = [...defaultTags]
  invitationUrl.value = ''
  createdName.value = ''
  copied.value = false
  errorMessage.value = ''
  isSaving.value = false
}

const applyClient = () => {
  if (props.client) {
    name.value = props.client.name
    selectedTags.value = [...props.client.tags]
    if (props.client.status === 'Invited') {
      invitationUrl.value = `${window.location.origin}/invite/${props.client.invitationCode}`
      createdName.value = props.client.name
    } else {
      invitationUrl.value = ''
      createdName.value = ''
    }
  } else {
    reset()
  }
}

watch(
  () => [props.open, props.client] as const,
  () => {
    if (props.open) applyClient()
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

  // Selecting 'Group' session type removes gender tags (groups have no individual gender)
  if (tag === 'Group') {
    const genderTags = tagGroups.find((g) => g.name === 'Gender')?.tags ?? []
    selectedTags.value = [...fromOtherGroups.filter((t) => !genderTags.includes(t)), tag]
  } else {
    selectedTags.value = [...fromOtherGroups, tag]
  }
}

const generateInvitationCode = (clientName: string) => {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  const namePrefix = clientName.replace(/\s+/g, '').slice(0, 5).toUpperCase() || 'CLNT'
  return `${namePrefix}-${random}`
}

const handleSubmit = async () => {
  if (invitationUrl.value) {
    emit('cancel')
    return
  }

  errorMessage.value = ''
  isSaving.value = true

  try {
    const invitationCode = generateInvitationCode(name.value)
    const payload: Client = {
      name: name.value.trim(),
      tags: [...selectedTags.value],
      imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.value.trim())}&background=E2E8F0&color=0F172A`,
      status: 'Pending',
      invitationCode,
    }

    const created = await clientsApi.addClient(payload)
    createdName.value = created.name
    invitationUrl.value = `${window.location.origin}/invite/${created.invitationCode}`
    emit('invited', created)
  } catch {
    errorMessage.value = 'Failed to create invitation. Please try again.'
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(invitationUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // fallback: select the input text
  }
}
</script>
