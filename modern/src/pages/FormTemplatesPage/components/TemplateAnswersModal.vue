<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormTemplateOut, StandaloneFormResponseOut, FormFieldDefinition } from '../../../types'
import * as formsApi from '../../../services/formsApi'
import { useToast } from '../../../composables/useToast'
import BaseModal from '../../../components/BaseModal.vue'
import SkeletonLoader from '../../../components/SkeletonLoader.vue'
import { ChevronDown, ChevronRight, Pencil, Trash2 } from '@lucide/vue'

const props = defineProps<{ open: boolean; template: FormTemplateOut | null }>()
const emit = defineEmits<{ close: []; edit: [response: StandaloneFormResponseOut] }>()

const toast = useToast()
const loading = ref(false)
const responses = ref<StandaloneFormResponseOut[]>([])
const expandedId = ref<string | null>(null)
const confirmDeleteId = ref<string | null>(null)
const deleting = ref(false)

watch(() => props.open, async (val) => {
  if (!val || !props.template) return
  loading.value = true
  expandedId.value = null
  confirmDeleteId.value = null
  try {
    responses.value = await formsApi.listStandaloneFormResponses(props.template.id)
  } finally {
    loading.value = false
  }
})

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function getFieldLabel(fieldId: string): string {
  return props.template?.fields.find((f) => f.id === fieldId)?.label ?? fieldId
}

function getField(fieldId: string): FormFieldDefinition | undefined {
  return props.template?.fields.find((f) => f.id === fieldId)
}

function formatAnswer(fieldId: string, value: string | null, values: string[] | null): string {
  const field = getField(fieldId)
  if (!field) return value ?? '—'
  if (field.type === 'MultiChoice') return values?.join(', ') || '—'
  if (field.type === 'Boolean') return value === 'true' ? 'Yes' : value === 'false' ? 'No' : '—'
  return value || '—'
}

async function confirmDelete(id: string) {
  deleting.value = true
  try {
    await formsApi.deleteStandaloneFormResponse(id)
    responses.value = responses.value.filter((r) => r.id !== id)
    confirmDeleteId.value = null
    if (expandedId.value === id) expandedId.value = null
    toast.success('Response deleted')
  } catch {
    toast.error('Failed to delete response')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <BaseModal :open="open" :title="template ? `Answers: ${template.name}` : 'Answers'" size="lg" @close="emit('close')">
    <div
      class="flex flex-col gap-2 overflow-y-auto"
      style="max-height: 60vh; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent;"
    >
      <div v-if="loading" class="flex flex-col gap-2">
        <SkeletonLoader v-for="i in 4" :key="i" height="56px" rounded="rounded-xl" />
      </div>

      <p v-else-if="!responses.length" class="text-sm text-text-secondary text-center py-8">
        No responses yet for this template.
      </p>

      <template v-else>
        <div
          v-for="response in responses"
          :key="response.id"
          class="border border-white/10 rounded-xl overflow-hidden"
        >
          <!-- Row header -->
          <div class="flex items-center gap-2 px-4 py-3">
            <button
              class="flex-1 flex items-center gap-3 text-left hover:opacity-80 transition-opacity min-w-0"
              @click="toggleExpand(response.id)"
            >
              <component :is="expandedId === response.id ? ChevronDown : ChevronRight" class="w-4 h-4 text-text-muted flex-shrink-0" />
              <div class="min-w-0">
                <p class="font-semibold text-white text-sm">{{ response.firstName }} {{ response.lastName }}</p>
                <p class="text-xs text-text-muted">
                  {{ [response.gender, response.age != null ? `Age ${response.age}` : null].filter(Boolean).join(' · ') }}
                  <span v-if="response.gender || response.age != null"> · </span>{{ formatDate(response.createdAt) }}
                </p>
              </div>
            </button>

            <div class="flex items-center gap-1 flex-shrink-0">
              <button
                class="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-all"
                title="Edit response"
                @click="emit('edit', response)"
              >
                <Pencil class="w-3.5 h-3.5" />
              </button>
              <button
                class="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                title="Delete response"
                @click="confirmDeleteId = confirmDeleteId === response.id ? null : response.id"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Inline delete confirmation -->
          <div
            v-if="confirmDeleteId === response.id"
            class="flex items-center justify-between gap-3 px-4 py-2.5 bg-red-500/10 border-t border-red-500/20"
          >
            <p class="text-xs text-red-400">Delete this response permanently?</p>
            <div class="flex items-center gap-2">
              <button
                class="text-xs text-text-muted hover:text-white transition-colors"
                @click="confirmDeleteId = null"
              >Cancel</button>
              <button
                class="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                :disabled="deleting"
                @click="confirmDelete(response.id)"
              >{{ deleting ? 'Deleting…' : 'Delete' }}</button>
            </div>
          </div>

          <!-- Expanded answers -->
          <div v-if="expandedId === response.id" class="px-4 pb-4 flex flex-col gap-3 border-t border-white/10 pt-3">
            <div v-if="response.notes" class="text-xs text-text-secondary bg-white/5 rounded-lg px-3 py-2">
              <span class="font-semibold text-text-muted">Notes: </span>{{ response.notes }}
            </div>

            <div class="grid grid-cols-1 gap-2">
              <div
                v-for="answer in response.answers"
                :key="answer.fieldId"
                class="flex items-start justify-between gap-2 text-sm"
              >
                <span class="text-text-secondary shrink-0 max-w-[55%]">{{ getFieldLabel(answer.fieldId) }}</span>
                <span class="text-white text-right">{{ formatAnswer(answer.fieldId, answer.value, answer.values) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <button
          class="text-sm text-text-secondary hover:text-white transition-colors"
          @click="emit('close')"
        >Close</button>
      </div>
    </template>
  </BaseModal>
</template>
