<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormTemplateOut, FormAnswer, FormFieldDefinition } from '../../../types'
import { useToast } from '../../../composables/useToast'
import * as formsApi from '../../../services/formsApi'
import BaseModal from '../../../components/BaseModal.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseTextarea from '../../../components/BaseTextarea.vue'
import BaseSelect from '../../../components/BaseSelect.vue'
import BaseCheckbox from '../../../components/BaseCheckbox.vue'
import BaseButton from '../../../components/BaseButton.vue'

const props = defineProps<{ open: boolean; template: FormTemplateOut | null }>()
const emit = defineEmits<{ close: []; submitted: [] }>()

const toast = useToast()
const saving = ref(false)

const firstName = ref('')
const lastName = ref('')
const gender = ref<string | null>(null)
const age = ref<string>('')
const notes = ref('')
const answers = ref<Record<string, { value: string; values: string[] }>>({})

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
]

watch(() => props.open, (val) => {
  if (!val) return
  firstName.value = ''
  lastName.value = ''
  gender.value = null
  age.value = ''
  notes.value = ''
  answers.value = {}
  if (props.template) {
    for (const field of props.template.fields) {
      answers.value[field.id] = { value: '', values: [] }
    }
  }
})

watch(() => props.template, (template) => {
  answers.value = {}
  if (!template) return
  for (const field of template.fields) {
    answers.value[field.id] = { value: '', values: [] }
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
  if (!props.template) return
  if (!firstName.value.trim() || !lastName.value.trim()) {
    toast.error('First name and last name are required')
    return
  }

  const missing = props.template.fields.filter((f: FormFieldDefinition) => {
    if (!f.required) return false
    const a = answers.value[f.id]
    if (f.type === 'MultiChoice') return !(a?.values?.length)
    return !a?.value
  })
  if (missing.length) {
    toast.error(`Missing required field(s): ${missing.map((f) => f.label).join(', ')}`)
    return
  }

  const payloadAnswers: FormAnswer[] = props.template.fields.map((f) => ({
    fieldId: f.id,
    value: f.type === 'MultiChoice' ? null : (answers.value[f.id]?.value || null),
    values: f.type === 'MultiChoice' ? (answers.value[f.id]?.values ?? []) : null,
  }))

  saving.value = true
  try {
    await formsApi.submitStandaloneFormResponse({
      formTemplateId: props.template.id,
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      gender: gender.value,
      age: age.value ? parseInt(age.value, 10) : null,
      notes: notes.value.trim() || null,
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
  <BaseModal :open="open" :title="template ? `Fill: ${template.name}` : 'Fill Form'" size="md" @close="emit('close')">
    <div
      class="flex flex-col gap-4 overflow-y-auto pr-1"
      style="max-height: 65vh; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent;"
    >
      <!-- Respondent info -->
      <div class="pb-3 border-b border-white/10">
        <p class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Respondent</p>
        <div class="flex flex-col gap-3">
          <div class="grid grid-cols-2 gap-3">
            <BaseInput v-model="firstName" label="First name *" placeholder="Enter first name" />
            <BaseInput v-model="lastName" label="Last name *" placeholder="Enter last name" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <BaseSelect v-model="gender" label="Gender" placeholder="Select gender" :options="GENDER_OPTIONS" />
            <BaseInput v-model="age" type="number" label="Age" placeholder="e.g. 30" />
          </div>
          <BaseTextarea v-model="notes" label="Notes" placeholder="Any additional notes..." :rows="2" />
        </div>
      </div>

      <!-- Template fields -->
      <template v-if="template">
        <div v-for="field in template.fields" :key="field.id" class="flex flex-col gap-1.5">
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
        <BaseButton variant="primary" :loading="saving" :disabled="!template" @click="submit">Submit</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
