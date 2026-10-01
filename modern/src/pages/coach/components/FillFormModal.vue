<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePageTitle } from '../../../composables/usePageTitle'
import type { FormTemplateOut, FormAnswer, FormFieldDefinition } from '../../../types'
import { useFormTemplateStore } from '../../../stores/formTemplateStore'
import { useToast } from '../../../composables/useToast'
import * as formsApi from '../../../services/formsApi'
import BaseModal from '../../../components/BaseModal.vue'
import BaseSelect from '../../../components/BaseSelect.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseTextarea from '../../../components/BaseTextarea.vue'
import BaseCheckbox from '../../../components/BaseCheckbox.vue'
import BaseButton from '../../../components/BaseButton.vue'

const props = defineProps<{ open: boolean; clientId: string; meetingId?: string | null }>()
const emit = defineEmits<{ close: []; submitted: [] }>()

usePageTitle('Fill Session Form', () => props.open)

const templateStore = useFormTemplateStore()
const toast = useToast()

const selectedTemplateId = ref<string | null>(null)
const answers = ref<Record<string, { value: string; values: string[] }>>({})
const saving = ref(false)

const activeTemplates = computed(() => templateStore.templates.filter((t) => t.isActive))

const selectedTemplate = computed<FormTemplateOut | null>(() =>
  activeTemplates.value.find((t) => t.id === selectedTemplateId.value) ?? null
)

watch(() => props.open, async (val) => {
  if (!val) return
  if (!templateStore.templates.length) await templateStore.fetch()
  selectedTemplateId.value = null
  answers.value = {}
})

watch(selectedTemplate, (template) => {
  answers.value = {}
  if (!template) return
  for (const field of template.fields) {
    const defaultVal = field.type === 'Range'
      ? String(Math.round(((field.min ?? 0) + (field.max ?? 100)) / 2))
      : ''
    answers.value[field.id] = { value: defaultVal, values: [] }
  }
})

function toggleMultiChoice(fieldId: string, option: string) {
  const current = answers.value[fieldId]?.values ?? []
  answers.value[fieldId] = {
    value: '',
    values: current.includes(option) ? current.filter((v) => v !== option) : [...current, option],
  }
}

function isChecked(fieldId: string, option: string) {
  return answers.value[fieldId]?.values?.includes(option) ?? false
}

async function submit() {
  if (!selectedTemplate.value) {
    toast.error('Choose a form template')
    return
  }

  const missing = selectedTemplate.value.fields.filter((f: FormFieldDefinition) => {
    if (!f.required) return false
    const a = answers.value[f.id]
    if (f.type === 'MultiChoice') return !(a?.values?.length)
    if (f.type === 'Range') return false
    return !a?.value
  })
  if (missing.length) {
    toast.error(`Missing required field(s): ${missing.map((f) => f.label).join(', ')}`)
    return
  }

  const payloadAnswers: FormAnswer[] = selectedTemplate.value.fields.map((f) => ({
    fieldId: f.id,
    value: f.type === 'MultiChoice' ? null : (answers.value[f.id]?.value || null),
    values: f.type === 'MultiChoice' ? (answers.value[f.id]?.values ?? []) : null,
  }))

  saving.value = true
  try {
    await formsApi.submitFormResponse({
      formTemplateId: selectedTemplate.value.id,
      clientId: props.clientId,
      meetingId: props.meetingId ?? null,
      answers: payloadAnswers,
    })
    toast.success('Form submitted')
    emit('submitted')
    emit('close')
  } catch {
    toast.error('Failed to submit form')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal :open="open" title="Fill Session Form" size="md" @close="emit('close')">
    <div class="flex flex-col gap-4">
      <BaseSelect
        v-model="selectedTemplateId"
        label="Form template"
        placeholder="Select a form template"
        :options="activeTemplates.map((t) => ({ value: t.id, label: t.name }))"
      />

      <p v-if="!activeTemplates.length" class="text-sm text-text-secondary">
        No active form templates. Create one under Form Templates first.
      </p>

      <template v-if="selectedTemplate">
        <div v-for="field in selectedTemplate.fields" :key="field.id" class="flex flex-col gap-1.5">
          <template v-if="field.type === 'TextArea'">
            <BaseTextarea
              v-model="answers[field.id].value"
              :label="field.label + (field.required ? ' *' : '')"
              :hint="field.helpText ?? undefined"
              :rows="3"
            />
          </template>

          <template v-else-if="field.type === 'Number' || field.type === 'Scale'">
            <BaseInput
              v-model="answers[field.id].value"
              type="number"
              :label="field.label + (field.required ? ' *' : '')"
              :hint="field.helpText ?? (field.min != null || field.max != null ? `Range: ${field.min ?? '–'} to ${field.max ?? '–'}` : undefined)"
            />
          </template>

          <template v-else-if="field.type === 'Range'">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-text-primary">{{ field.label }}{{ field.required ? ' *' : '' }}</span>
                <span class="text-sm font-bold text-primary tabular-nums">{{ answers[field.id]?.value ?? (field.min ?? 0) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-text-muted tabular-nums">{{ field.min ?? 0 }}</span>
                <input
                  type="range"
                  class="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                  style="accent-color: var(--color-primary, #7c3aed);"
                  :min="field.min ?? 0"
                  :max="field.max ?? 100"
                  :value="answers[field.id]?.value ?? (field.min ?? 0)"
                  @input="(e) => answers[field.id].value = (e.target as HTMLInputElement).value"
                />
                <span class="text-xs text-text-muted tabular-nums">{{ field.max ?? 100 }}</span>
              </div>
              <p v-if="field.helpText" class="text-xs text-text-muted">{{ field.helpText }}</p>
            </div>
          </template>

          <template v-else-if="field.type === 'Date'">
            <BaseInput v-model="answers[field.id].value" type="date" :label="field.label + (field.required ? ' *' : '')" />
          </template>

          <template v-else-if="field.type === 'Boolean'">
            <BaseCheckbox
              :model-value="answers[field.id].value === 'true'"
              :label="field.label + (field.required ? ' *' : '')"
              @update:model-value="(v: boolean) => answers[field.id].value = v ? 'true' : 'false'"
            />
          </template>

          <template v-else-if="field.type === 'SingleChoice'">
            <BaseSelect
              v-model="answers[field.id].value"
              :label="field.label + (field.required ? ' *' : '')"
              placeholder="Select…"
              :options="(field.options ?? []).map((o) => ({ value: o, label: o }))"
            />
          </template>

          <template v-else-if="field.type === 'MultiChoice'">
            <span class="text-sm font-semibold text-text-primary dark:text-white">{{ field.label }}{{ field.required ? ' *' : '' }}</span>
            <div class="flex flex-col gap-1.5 pl-1">
              <BaseCheckbox
                v-for="option in field.options ?? []"
                :key="option"
                :model-value="isChecked(field.id, option)"
                :label="option"
                @update:model-value="toggleMultiChoice(field.id, option)"
              />
            </div>
          </template>

          <template v-else>
            <BaseInput v-model="answers[field.id].value" :label="field.label + (field.required ? ' *' : '')" :hint="field.helpText ?? undefined" />
          </template>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="flex items-center gap-2">
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" :disabled="!selectedTemplate" @click="submit">Submit</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
