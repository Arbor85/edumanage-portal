<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormTemplateOut, FormAnswer, FormFieldDefinition, StandaloneFormResponseOut } from '../../../types'
import { useToast } from '../../../composables/useToast'
import * as formsApi from '../../../services/formsApi'
import BaseModal from '../../../components/BaseModal.vue'
import BaseInput from '../../../components/BaseInput.vue'
import BaseTextarea from '../../../components/BaseTextarea.vue'
import BaseSelect from '../../../components/BaseSelect.vue'
import BaseCheckbox from '../../../components/BaseCheckbox.vue'
import BaseButton from '../../../components/BaseButton.vue'
import { Check } from '@lucide/vue'

const props = defineProps<{ open: boolean; template: FormTemplateOut | null; existingResponse?: StandaloneFormResponseOut | null }>()
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

function rangeMin(field: FormFieldDefinition) { return field.min ?? 0 }
function rangeMax(field: FormFieldDefinition) { return field.max ?? 100 }

function initAnswers(template: FormTemplateOut | null, existing?: StandaloneFormResponseOut | null) {
  answers.value = {}
  if (!template) return
  for (const field of template.fields) {
    const existingAnswer = existing?.answers.find((a) => a.fieldId === field.id)
    if (existingAnswer) {
      answers.value[field.id] = {
        value: existingAnswer.value ?? '',
        values: existingAnswer.values ?? [],
      }
    } else {
      const defaultVal = field.type === 'Range'
        ? String(Math.round((rangeMin(field) + rangeMax(field)) / 2))
        : ''
      answers.value[field.id] = { value: defaultVal, values: [] }
    }
  }
}

watch(() => props.open, (val) => {
  if (!val) return
  const existing = props.existingResponse
  firstName.value = existing?.firstName ?? ''
  lastName.value = existing?.lastName ?? ''
  gender.value = existing?.gender ?? null
  age.value = existing?.age != null ? String(existing.age) : ''
  notes.value = existing?.notes ?? ''
  initAnswers(props.template, existing)
})

watch(() => props.template, (template) => {
  initAnswers(template, props.existingResponse)
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

// Progress — respondent fields + template fields
const respondentItems = computed(() => [
  { label: 'First name', filled: !!firstName.value.trim() },
  { label: 'Last name', filled: !!lastName.value.trim() },
  { label: 'Gender', filled: gender.value !== null },
  { label: 'Age', filled: !!age.value },
])

function isFieldFilled(field: FormFieldDefinition): boolean {
  const a = answers.value[field.id]
  if (!a) return false
  if (field.type === 'MultiChoice') return (a.values?.length ?? 0) > 0
  if (field.type === 'Range') return true
  return !!a.value
}

const templateItems = computed(() =>
  (props.template?.fields ?? []).map((f) => ({ label: f.label, filled: isFieldFilled(f) }))
)

const filledCount = computed(() =>
  respondentItems.value.filter((i) => i.filled).length +
  templateItems.value.filter((i) => i.filled).length
)

const totalCount = computed(() =>
  respondentItems.value.length + templateItems.value.length
)

const progressPercent = computed(() =>
  totalCount.value > 0 ? Math.round((filledCount.value / totalCount.value) * 100) : 0
)

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
    if (f.type === 'Range') return false
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

  const payload = {
    formTemplateId: props.template.id,
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    gender: gender.value,
    age: age.value ? parseInt(age.value, 10) : null,
    notes: notes.value.trim() || null,
    answers: payloadAnswers,
  }

  saving.value = true
  try {
    if (props.existingResponse) {
      await formsApi.updateStandaloneFormResponse(props.existingResponse.id, payload)
      toast.success('Response updated')
    } else {
      await formsApi.submitStandaloneFormResponse(payload)
      toast.success('Form submitted')
    }
    emit('submitted')
    emit('close')
  } catch {
    toast.error(props.existingResponse ? 'Failed to update response' : 'Failed to submit form')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal :open="open" :title="template ? (existingResponse ? `Edit: ${template.name}` : `Fill: ${template.name}`) : 'Fill Form'" size="fullscreen" @close="emit('close')">
    <div class="flex gap-6 h-full min-h-0">

      <!-- Form content -->
      <div
        class="flex-1 flex flex-col gap-5 overflow-y-auto pr-2"
        style="scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent;"
      >
        <!-- Respondent info -->
        <div class="pb-4 border-b border-white/10">
          <p class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Respondent</p>
          <div class="flex flex-col gap-3 max-w-2xl">
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
          <div class="flex flex-col gap-4 max-w-2xl">
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

              <template v-else-if="field.type === 'Range'">
                <div class="flex flex-col gap-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-text-primary">{{ field.label }}{{ field.required ? ' *' : '' }}</span>
                    <span class="text-sm font-bold text-primary tabular-nums">{{ answers[field.id]?.value ?? rangeMin(field) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-text-muted tabular-nums">{{ rangeMin(field) }}</span>
                    <input
                      type="range"
                      class="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                      style="accent-color: var(--color-primary, #7c3aed);"
                      :min="rangeMin(field)"
                      :max="rangeMax(field)"
                      :value="answers[field.id]?.value ?? rangeMin(field)"
                      @input="(e) => answers[field.id].value = (e.target as HTMLInputElement).value"
                    />
                    <span class="text-xs text-text-muted tabular-nums">{{ rangeMax(field) }}</span>
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
                <span class="text-sm font-semibold text-text-primary">{{ field.label }}{{ field.required ? ' *' : '' }}</span>
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
          </div>
        </template>
      </div>

      <!-- Progress sidebar -->
      <div class="w-56 flex-shrink-0 flex flex-col gap-4 border-l border-white/10 pl-6 overflow-y-auto"
        style="scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent;"
      >
        <!-- Big percentage + bar -->
        <div class="flex flex-col items-center gap-2">
          <span class="text-3xl font-bold text-white tabular-nums">{{ progressPercent }}<span class="text-lg text-text-muted">%</span></span>
          <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary rounded-full transition-all duration-300"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
          <span class="text-xs text-text-muted">{{ filledCount }} / {{ totalCount }} filled</span>
        </div>

        <!-- Respondent items -->
        <div class="flex flex-col gap-1">
          <p class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Respondent</p>
          <div
            v-for="item in respondentItems"
            :key="item.label"
            class="flex items-center gap-2 text-xs py-0.5"
          >
            <div
              class="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
              :class="item.filled ? 'bg-primary' : 'bg-white/10'"
            >
              <Check v-if="item.filled" class="w-2.5 h-2.5 text-white" />
            </div>
            <span :class="item.filled ? 'text-white' : 'text-text-muted'">{{ item.label }}</span>
          </div>
        </div>

        <!-- Template field items -->
        <div v-if="templateItems.length" class="flex flex-col gap-1">
          <p class="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">Fields</p>
          <div
            v-for="item in templateItems"
            :key="item.label"
            class="flex items-center gap-2 text-xs py-0.5"
          >
            <div
              class="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
              :class="item.filled ? 'bg-primary' : 'bg-white/10'"
            >
              <Check v-if="item.filled" class="w-2.5 h-2.5 text-white" />
            </div>
            <span class="truncate" :class="item.filled ? 'text-white' : 'text-text-muted'">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center gap-2">
        <div class="flex-1" />
        <BaseButton variant="ghost" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="saving" :disabled="!template" @click="submit">{{ existingResponse ? 'Save changes' : 'Submit' }}</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
